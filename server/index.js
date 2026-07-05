const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");
const nodemailer = require("nodemailer");

// ── Startup env validation ─────────────────────────────────────────────────
const REQUIRED_ENV = [
  "GEMINI_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "FRONTEND_URL",
  "BACKEND_URL",
];
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.error(
    `[STARTUP ERROR] Missing required environment variables: ${missingEnv.join(", ")}\n` +
      "Please add them to your .env file and restart the server.",
  );
  process.exit(1);
}

// ── Gemini AI ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Supabase admin client (service role — server-only) ────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const app = express();
// connectSrc / CSP are irrelevant here because we never serve HTML — browsers enforce
// CSP on the page origin, not on the API origin. Keeping headers tight anyway.
app.use(
  helmet({
    contentSecurityPolicy: false, // pure REST API, no HTML served
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.FRONTEND_URL,
        process.env.BACKEND_URL,
        "https://sandbox.sslcommerz.com",
        "https://securepay.sslcommerz.com",
      ].filter(Boolean);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiters ──────────────────────────────────────────────────────────
const aiLimiter = rateLimit({ windowMs: 60_000, max: 12 });
const paymentLimiter = rateLimit({ windowMs: 60_000, max: 10 });
app.use("/api/ai", aiLimiter);
app.use("/api/payment", paymentLimiter);

// ── Input sanitiser ────────────────────────────────────────────────────────
function sanitiseInput(text) {
  return String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/[{}[\]]/g, "")
    .slice(0, 800);
}

// ─────────────────────────────────────────────────────────────────────────
//  SECTION 1 — AI ENDPOINTS (Gemini 2.5 Flash)
// ─────────────────────────────────────────────────────────────────────────

// 1a. Conversational Gift Advisor
app.post("/api/ai/gift-chat", async (req, res) => {
  try {
    const { messages, products } = req.body;

    // FIX: Guard against missing or empty messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const slimProducts = (products || []).slice(0, 40).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      occasion: p.occasion,
      giftFor: p.giftFor,
      description: p.shortDescription,
    }));

    const systemPrompt = `You are the Prizzy AI Gift Advisor for the Bangladeshi market.
Use a warm, friendly tone and occasionally use Bengali words like "ভাই" (brother) or "আপু" (sister).
The user is looking for a gift. Ask ONE clarifying question if you need more details about the recipient, occasion, or budget (in BDT).
ALWAYS append a JSON block at the very end of your response exactly in this format:
\`\`\`json
{"recommendations": [{"productId": "p1", "matchScore": 95, "reason": "Why this fits"}]}
\`\`\`
Recommend 3-5 products max. DO NOT invent products. Only use this catalogue: ${JSON.stringify(slimProducts)}`;

    const formattedHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: sanitiseInput(msg.content) }],
    }));

    const lastMessage = sanitiseInput(messages[messages.length - 1].content);

    const chatModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const chat = chatModel.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (err) {
    console.error("Gemini API Error (Chat):", err);
    res.status(500).json({ error: "AI request failed", message: err.message });
  }
});

// 1b. Guided Tap-Based Picker
app.post("/api/ai/gift-guided", async (req, res) => {
  try {
    const { occasion, recipient, budgetMin, budgetMax, products } = req.body;

    // FIX: Validate required fields and guard against undefined products
    if (!occasion || !recipient) {
      return res
        .status(400)
        .json({ error: "occasion and recipient are required" });
    }

    const safeProducts = Array.isArray(products) ? products : [];
    const slimProducts = safeProducts
      .filter(
        (p) =>
          p.price >= (budgetMin || 0) && p.price <= (budgetMax || Infinity),
      )
      .slice(0, 30)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        occasion: p.occasion,
        giftFor: p.giftFor,
      }));

    const prompt = `Find the 4 best gifts for a ${occasion} for ${recipient} between ৳${budgetMin || 0} and ৳${budgetMax || 99999}.
Catalogue: ${JSON.stringify(slimProducts)}
Respond ONLY with a JSON object in this format, no markdown fences:
{"picks": [{"productId": "p1", "matchScore": 98, "reason": "Short reason"}]}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let rawText = result.response
      .text()
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // Extract the first JSON object in case the model prepended extra text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res
        .status(500)
        .json({ error: "AI returned non-JSON response", picks: [] });
    }
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (_) {
      return res
        .status(500)
        .json({ error: "AI response could not be parsed", picks: [] });
    }
    res.json(parsed);
  } catch (err) {
    console.error("Gemini API Error (Guided):", err);
    res.status(500).json({ error: "AI request failed", message: err.message });
  }
});

// 1c. Vendor Morning Insight
app.post("/api/ai/vendor-insight", async (req, res) => {
  try {
    const { shop_name, salesData } = req.body;

    if (!shop_name) {
      return res.status(400).json({ error: "shop_name is required" });
    }

    const prompt = `You are a premium business analyst for a Prizzy vendor named "${shop_name}".
Here is their recent performance data: ${JSON.stringify(salesData)}.
Analyze this data and provide a short, highly actionable morning digest.
Keep it encouraging, professional, and under 120 words. Mention real numbers.
Respond using this exact JSON schema:
{
  "headline": "A catchy summary of their performance",
  "insights": ["Insight 1 with metric", "Insight 2 with metric"],
  "occasionTip": "One specific tip on what to stock next based on upcoming Bangladeshi occasions"
}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(prompt);
    let insightText = result.response.text().trim();
    // Strip fences in case responseMimeType hint is ignored by the model
    insightText = insightText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    let parsed;
    try {
      parsed = JSON.parse(insightText);
    } catch (_) {
      // Graceful fallback — frontend useVendorAI already has its own fallback too
      parsed = {
        headline: `Business update for ${shop_name}`,
        insights: [
          "Review your recent orders and update your product listings.",
        ],
        occasionTip:
          "Eid season is approaching — stock up on premium gift boxes.",
      };
    }
    res.json(parsed);
  } catch (err) {
    console.error("Gemini API Error (Vendor Insight):", err);
    res.status(500).json({ error: "AI request failed", message: err.message });
  }
});

// 1d. Vendor Data Chatbot
app.post("/api/ai/vendor-chat", async (req, res) => {
  try {
    const { messages, shop_name, salesData } = req.body;

    // FIX: Guard against missing or empty messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }
    if (!shop_name) {
      return res.status(400).json({ error: "shop_name is required" });
    }

    const systemPrompt = `You are the Business Intelligence AI for "${shop_name}".
The vendor's current data is: ${JSON.stringify(salesData)}.
Answer the vendor's questions about their data, sales trends, and strategy.
Be concise, highly professional, and use the exact metrics provided. Do not make up numbers.`;

    const formattedHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: sanitiseInput(msg.content) }],
    }));

    const lastMessage = sanitiseInput(messages[messages.length - 1].content);

    const chatModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const chat = chatModel.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(lastMessage);

    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error("Gemini API Error (Vendor Chat):", err);
    res.status(500).json({ error: "AI request failed", message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────
//  SECTION 2 — PAYMENT GATEWAY ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────

// ── SSLCommerz — Initiate Payment ─────────────────────────────────────────
app.post("/api/payment/sslcommerz/initiate", async (req, res) => {
  try {
    const { orderNumber, amount, customerName, customerPhone, customerEmail } =
      req.body;

    if (!orderNumber || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment request" });
    }

    const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
    const STORE_PASS = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const IS_SANDBOX = process.env.SSLCOMMERZ_SANDBOX !== "false";

    const sslEndpoint = IS_SANDBOX
      ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
      : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

    const params = new URLSearchParams({
      store_id: STORE_ID,
      store_passwd: STORE_PASS,
      total_amount: String(amount),
      currency: "BDT",
      tran_id: orderNumber,
      success_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/success`,
      fail_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/fail`,
      cancel_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/cancel`,
      ipn_url: `${process.env.BACKEND_URL}/api/payment/sslcommerz/ipn`,
      cus_name: customerName || "Prizzy Customer",
      cus_email: customerEmail || "customer@prizzy.com",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: customerPhone || "01700000000",
      shipping_method: "NO",
      product_name: "Gift Items",
      product_category: "Gifts",
      product_profile: "general",
    });

    const response = await fetch(sslEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.status === "SUCCESS") {
      res.json({ success: true, gatewayUrl: data.GatewayPageURL });
    } else {
      res.status(400).json({
        success: false,
        error: data.failedreason || "SSLCommerz initiation failed",
      });
    }
  } catch (err) {
    console.error("SSLCommerz initiate error:", err);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

// ── SSLCommerz — Success callback ─────────────────────────────────────────
app.post("/api/payment/sslcommerz/success", async (req, res) => {
  const { tran_id, val_id, status } = req.body;

  // Always redirect the user first — DB update happens best-effort
  // (IPN will retry if this update fails)
  const redirectUrl = tran_id
    ? `${process.env.FRONTEND_URL}/order-success/${tran_id}?payment=success`
    : `${process.env.FRONTEND_URL}/checkout?payment=failed`;

  if ((status === "VALID" || status === "VALIDATED") && val_id && tran_id) {
    try {
      // Re-validate the transaction with SSLCommerz to prevent replay/tamper attacks
      const IS_SANDBOX = process.env.SSLCOMMERZ_SANDBOX !== "false";
      const validateUrl = IS_SANDBOX
        ? `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php`
        : `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php`;

      const validationResp = await fetch(
        `${validateUrl}?val_id=${val_id}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`,
      );
      const validationData = await validationResp.json();

      if (
        validationData.status === "VALID" ||
        validationData.status === "VALIDATED"
      ) {
        const { error: dbError } = await supabase
          .from("orders")
          .update({ payment_status: "paid", status: "confirmed" })
          .eq("order_number", tran_id);
        if (dbError)
          console.error("SSLCommerz success DB update error:", dbError);
      } else {
        console.error("SSLCommerz validation failed:", validationData);
      }
    } catch (err) {
      console.error("SSLCommerz re-validation error:", err);
    }
  }

  res.redirect(redirectUrl);
});

// ── SSLCommerz — Fail callback ────────────────────────────────────────────
app.post("/api/payment/sslcommerz/fail", async (req, res) => {
  const { tran_id } = req.body;
  // FIX: Wrapped in try/catch so a DB error doesn't crash the redirect
  try {
    if (tran_id) {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("order_number", tran_id);
    }
  } catch (err) {
    console.error("SSLCommerz fail DB update error:", err);
  }
  res.redirect(
    `${process.env.FRONTEND_URL}/checkout?payment=failed&order=${tran_id || ""}`,
  );
});

// ── SSLCommerz — Cancel callback ──────────────────────────────────────────
app.post("/api/payment/sslcommerz/cancel", async (req, res) => {
  const { tran_id } = req.body;
  res.redirect(
    `${process.env.FRONTEND_URL}/checkout?payment=cancelled&order=${tran_id || ""}`,
  );
});

// ── SSLCommerz — IPN (Instant Payment Notification) ──────────────────────
app.post("/api/payment/sslcommerz/ipn", async (req, res) => {
  const { tran_id, status, val_id } = req.body;
  if ((status === "VALID" || status === "VALIDATED") && val_id && tran_id) {
    try {
      const IS_SANDBOX = process.env.SSLCOMMERZ_SANDBOX !== "false";
      const validateUrl = IS_SANDBOX
        ? `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php`
        : `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php`;

      const validationResp = await fetch(
        `${validateUrl}?val_id=${val_id}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`,
      );
      const validationData = await validationResp.json();

      if (
        validationData.status === "VALID" ||
        validationData.status === "VALIDATED"
      ) {
        await supabase
          .from("orders")
          .update({ payment_status: "paid", status: "confirmed" })
          .eq("order_number", tran_id);
      } else {
        console.error("SSLCommerz IPN validation failed:", validationData);
      }
    } catch (err) {
      console.error("SSLCommerz IPN re-validation error:", err);
    }
  }
  res.json({ received: true });
});

// ── bKash — Token management ──────────────────────────────────────────────
let bkashToken = null;
let bkashTokenExpiry = 0;

async function getBkashToken() {
  if (bkashToken && Date.now() < bkashTokenExpiry) return bkashToken;

  const IS_SANDBOX = process.env.BKASH_SANDBOX !== "false";
  const baseUrl = IS_SANDBOX
    ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
    : "https://tokenized.pay.bka.sh/v1.2.0-beta";

  const resp = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      username: process.env.BKASH_USERNAME,
      password: process.env.BKASH_PASSWORD,
    },
    body: JSON.stringify({
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    }),
  });
  const data = await resp.json();
  if (data.statusCode === "0000") {
    bkashToken = data.id_token;
    bkashTokenExpiry = Date.now() + 3500 * 1000; // ~58 min
    return bkashToken;
  }
  throw new Error("bKash token grant failed: " + data.statusMessage);
}

// ── bKash — Initiate Payment ──────────────────────────────────────────────
app.post("/api/payment/bkash/create", async (req, res) => {
  try {
    const { orderNumber, amount } = req.body;
    if (!orderNumber || !amount || amount <= 0)
      return res.status(400).json({ error: "Invalid payment request" });

    const token = await getBkashToken();
    const IS_SANDBOX = process.env.BKASH_SANDBOX !== "false";
    const baseUrl = IS_SANDBOX
      ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
      : "https://tokenized.pay.bka.sh/v1.2.0-beta";

    const resp = await fetch(`${baseUrl}/tokenized/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "X-APP-Key": process.env.BKASH_APP_KEY,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: orderNumber,
        callbackURL: `${process.env.BACKEND_URL}/api/payment/bkash/callback`,
        amount: String(amount),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: orderNumber,
      }),
    });

    const data = await resp.json();
    if (data.statusCode === "0000") {
      res.json({
        success: true,
        bkashURL: data.bkashURL,
        paymentID: data.paymentID,
      });
    } else {
      res.status(400).json({ success: false, error: data.statusMessage });
    }
  } catch (err) {
    console.error("bKash create error:", err);
    res.status(500).json({ error: "bKash payment creation failed" });
  }
});

// ── bKash — Execute callback ──────────────────────────────────────────────
app.get("/api/payment/bkash/callback", async (req, res) => {
  const { paymentID, status } = req.query;
  if (status !== "success" || !paymentID) {
    return res.redirect(`${process.env.FRONTEND_URL}/checkout?payment=failed`);
  }

  try {
    const token = await getBkashToken();
    const IS_SANDBOX = process.env.BKASH_SANDBOX !== "false";
    const baseUrl = IS_SANDBOX
      ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
      : "https://tokenized.pay.bka.sh/v1.2.0-beta";

    const resp = await fetch(`${baseUrl}/tokenized/checkout/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "X-APP-Key": process.env.BKASH_APP_KEY,
      },
      body: JSON.stringify({ paymentID }),
    });

    const data = await resp.json();
    if (data.statusCode === "0000") {
      const orderNumber = data.merchantInvoiceNumber;
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          payment_ref: data.trxID,
        })
        .eq("order_number", orderNumber);

      return res.redirect(
        `${process.env.FRONTEND_URL}/order-success/${orderNumber}?payment=success`,
      );
    } else {
      return res.redirect(
        `${process.env.FRONTEND_URL}/checkout?payment=failed`,
      );
    }
  } catch (err) {
    console.error("bKash callback error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/checkout?payment=error`);
  }
});

// ── bKash — IPN ───────────────────────────────────────────────────────────
// bKash sends async transaction confirmations here after the callback completes.
app.post("/api/payment/bkash/ipn", async (req, res) => {
  // Always acknowledge receipt first — bKash will retry if we don't respond 200 quickly
  res.json({ received: true });

  // Process DB update asynchronously after acknowledging
  try {
    const { trxID, merchantInvoiceNumber, transactionStatus } = req.body;

    if (transactionStatus === "Completed" && trxID && merchantInvoiceNumber) {
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          payment_ref: trxID,
        })
        .eq("order_number", merchantInvoiceNumber);

      if (error) {
        console.error("bKash IPN DB update error:", error);
      }
    }
  } catch (err) {
    console.error("bKash IPN processing error:", err);
  }
});

// ─────────────────────────────────────────────────────────────────────────
//  SECTION 2.5 — TRANSACTIONAL EMAILS
// ─────────────────────────────────────────────────────────────────────────

app.post("/api/emails/order-confirmation", async (req, res) => {
  try {
    const { orderNumber, email, name, totalAmount, items } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });

    const itemsHtml = items
      .map(
        (item) =>
          `<li>${item.quantity}x ${item.product.name} - ৳${item.price * item.quantity}</li>`,
      )
      .join("");

    const mailOptions = {
      from: `"Prizzy Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: auto; border: 1px solid #FFE5EF; border-radius: 12px; padding: 24px;">
          <h2 style="color: #FF2D78; margin-top: 0;">Thank you for your order, ${name}! 🎉</h2>
          <p style="color: #333; line-height: 1.5;">We have successfully received your order <strong>${orderNumber}</strong>. We are getting it ready for dispatch right now!</p>

          <h3 style="color: #444; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">Order Summary</h3>
          <ul style="color: #555; padding-left: 20px;">
            ${itemsHtml}
          </ul>
          <p style="font-size: 18px; font-weight: bold; color: #111;">Total Amount: ৳${totalAmount}</p>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">You can track your order status in your profile dashboard.</p>
          <br/>
          <p style="color: #888; font-size: 12px; text-align: center;">Warm regards,<br/>The Prizzy Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ─────────────────────────────────────────────────────────────────────────
//  SECTION 3 — HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ── Global error handler (Express 5 auto-forwards async errors here) ──────
app.use((err, req, res, _next) => {
  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ error: err.message });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Prizzy Backend running on port ${PORT}`));
