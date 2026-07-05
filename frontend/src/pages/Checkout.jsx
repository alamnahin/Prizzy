import { supabase } from "../lib/supabase";
import { placeOrder, useAddresses } from "../hooks/useSupabaseData";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  Home,
  Check,
  MapPin,
  CreditCard,
  Smartphone,
  Truck,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "../hooks/use-toast";

const STEPS = ["Delivery Address", "Review Order", "Payment"];
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3001";

const Checkout = () => {
  const { items, subtotal, shippingFee, discount, total, coupon, clearCart } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const {
    addresses,
    loading: addressesLoading,
    addAddress,
  } = useAddresses(user?.id);

  const [address, setAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "Dhaka",
    district: "Dhaka",
    postalCode: "",
  });
  const [payment, setPayment] = useState("cod");

  // Handle redirect back from payment gateways
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "failed") {
      setPaymentError(
        "Payment was declined. Please try again or choose a different method.",
      );
      setStep(2);
    } else if (paymentStatus === "cancelled") {
      setPaymentError(
        "Payment was cancelled. You can retry or choose Cash on Delivery.",
      );
      setStep(2);
    }
  }, [searchParams]);

  // Pre-select default address once addresses load
  useEffect(() => {
    if (addresses && addresses.length > 0 && !address) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      setAddress(def);
      setShowAddForm(false);
    } else if (!addressesLoading && (!addresses || addresses.length === 0)) {
      setShowAddForm(true);
    }
  }, [addresses, addressesLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (items.length === 0 && !searchParams.get("payment")) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-dark mb-3">
          Your cart is empty
        </h1>
        <Link
          to="/products"
          className="inline-block bg-brand-gradient text-white font-semibold px-6 py-3 rounded-full"
        >
          Browse Gifts
        </Link>
      </div>
    );
  }

  const next = () => {
    if (step === 0) {
      // FIX: validate against newAddr when no saved address is selected
      if (
        !address &&
        (!newAddr.name || !newAddr.phone || !newAddr.street || !newAddr.city)
      ) {
        toast({ title: "Please fill in all required delivery address fields" });
        return;
      }
      if (!address) {
        setAddress({ ...newAddr, id: "new", isDefault: true, label: "Home" });
      }
    }
    setStep(step + 1);
  };

  // ── Core order placement helper ──────────────────────────────────────────
  const placeOrderAndNavigate = async (selectedAddress, paymentMethod) => {
    const shippingInfo = {
      name: selectedAddress.name,
      phone: selectedAddress.phone,
      address: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.district}${
        selectedAddress.postalCode ? " - " + selectedAddress.postalCode : ""
      }`,
    };

    const result = await placeOrder(
      items,
      { subtotal, shippingFee, discount },
      shippingInfo,
      {
        paymentMethod,
        couponCode: coupon?.code || null,
      },
    );

    return result;
  };

  // Helper to trigger confirmation email
  const sendConfirmationEmail = async (orderNumber, addressData) => {
    if (!user?.email) return; // Skip if user has no email
    try {
      await fetch(`${API_BASE}/api/emails/order-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          email: user.email,
          name: addressData.name,
          totalAmount: total,
          items: items,
        }),
      });
    } catch (e) {
      console.error("Failed to send email", e);
    }
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    setPaymentError(null);

    try {
      const productIds = items.map((item) => item.product.id);
      const { data: stockData, error: stockError } = await supabase
        .from("products")
        .select("id, name, stock")
        .in("id", productIds);

      if (!stockError && stockData) {
        const outOfStockItems = [];
        for (const item of items) {
          const dbProduct = stockData.find((p) => p.id === item.product.id);
          // If the product is missing or requested quantity exceeds available stock
          if (!dbProduct || dbProduct.stock < item.quantity) {
            outOfStockItems.push(item.product.name);
          }
        }

        if (outOfStockItems.length > 0) {
          setProcessing(false);
          toast({
            title: "Stock Unavailable",
            description: `Not enough stock for: ${outOfStockItems.join(
              ", ",
            )}. Please reduce quantity in your cart.`,
            variant: "destructive",
          });
          return; // Stop checkout process immediately
        }
      }
    } catch (err) {
      console.error("Pre-flight stock check failed", err);
      // We log it and let it pass; the DB RPC will still act as a hard fallback
    }

    // 2. Persist a brand-new address (only when user explicitly filled the form)
    let selectedAddress = address || newAddr;
    if (user && showAddForm && (!address || address.id === "new")) {
      const { data: saved } = await addAddress(user.id, {
        ...newAddr,
        isDefault: !addresses || addresses.length === 0,
        label: "Home",
      });
      if (saved) selectedAddress = { ...newAddr, ...saved };
    }

    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    const cleanPhone = selectedAddress.phone.replace(/[\s-]/g, "");

    if (!bdPhoneRegex.test(cleanPhone)) {
      setProcessing(false);
      toast({
        title: "Invalid Phone Number",
        description:
          "Please provide a valid 11-digit Bangladeshi number (e.g., 01712345678).",
        variant: "destructive",
      });
      return;
    }
    // Update the address object with the cleaned number so the DB gets a clean format
    selectedAddress.phone = cleanPhone;

    // ── COD path — place order directly ─────────────────────────────────
    if (payment === "cod") {
      const result = await placeOrderAndNavigate(selectedAddress, "cod");
      if (result.success) {
        const lastOrder = {
          orderNumber: result.orderNumber,
          items,
          address: selectedAddress,
          payment,
          total,
          subtotal,
          shippingFee,
          discount,
          date: new Date().toISOString(),
        };
        localStorage.setItem("prizzy_last_order", JSON.stringify(lastOrder));
        clearCart();
        sendConfirmationEmail(result.orderNumber, selectedAddress);
        setProcessing(false);
        toast({
          title: "Order Confirmed! 🎉",
          description: `Order ${result.orderNumber} successfully placed.`,
        });
        navigate(`/order-success/${result.orderNumber}`);
      } else {
        setProcessing(false);
        toast({
          title: "Checkout Failed",
          description: result.error,
          variant: "destructive",
        });
      }
      return;
    }

    // ── Online payment paths — create order first, then redirect ─────────
    const result = await placeOrderAndNavigate(selectedAddress, payment);
    if (!result.success) {
      setProcessing(false);
      toast({
        title: "Order creation failed",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    // Save order info before redirect (cart will be cleared on return)
    const lastOrder = {
      orderNumber: result.orderNumber,
      items,
      address: selectedAddress,
      payment,
      total,
      subtotal,
      shippingFee,
      discount,
      date: new Date().toISOString(),
    };
    localStorage.setItem("prizzy_last_order", JSON.stringify(lastOrder));

    if (payment === "sslcommerz") {
      try {
        const resp = await fetch(
          `${API_BASE}/api/payment/sslcommerz/initiate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderNumber: result.orderNumber,
              amount: total,
              customerName: selectedAddress.name,
              customerPhone: selectedAddress.phone,
              customerEmail: user?.email || "",
            }),
          },
        );
        const payData = await resp.json();
        if (payData.success && payData.gatewayUrl) {
          clearCart();
          window.location.href = payData.gatewayUrl;
        } else {
          throw new Error(
            payData.error || "Could not initiate SSLCommerz payment",
          );
        }
      } catch (err) {
        setProcessing(false);
        setPaymentError(err.message);
      }
      return;
    }

    if (payment === "bkash") {
      try {
        const resp = await fetch(`${API_BASE}/api/payment/bkash/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber: result.orderNumber,
            amount: total,
          }),
        });
        const payData = await resp.json();
        if (payData.success && payData.bkashURL) {
          clearCart();
          window.location.href = payData.bkashURL;
        } else {
          throw new Error(payData.error || "Could not initiate bKash payment");
        }
      } catch (err) {
        setProcessing(false);
        setPaymentError(err.message);
      }
      return;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="flex items-center hover:text-brand-pink">
          <Home size={14} />
        </Link>
        <ChevronRight size={14} />
        <Link to="/cart" className="hover:text-brand-pink">
          Cart
        </Link>
        <ChevronRight size={14} />
        <span className="text-brand-dark font-medium">Checkout</span>
      </nav>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 bg-white border border-gray-100 rounded-2xl p-4 md:p-6">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  i <= step
                    ? "bg-brand-gradient text-white shadow-brand"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? <Check size={18} /> : i + 1}
              </div>
              <span
                className={`hidden md:block font-semibold text-sm ${
                  i <= step ? "text-brand-dark" : "text-gray-400"
                }`}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 md:mx-4 rounded-full ${
                  i < step ? "bg-brand-gradient" : "bg-gray-100"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Step 0 — Address */}
          {step === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-lg text-brand-dark mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-brand-pink" /> Delivery
                Address
              </h2>

              {!addressesLoading && (addresses || []).length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        address?.id === a.id
                          ? "border-brand-pink bg-brand-pink/5"
                          : "border-gray-200 hover:border-brand-pink/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-pink-500"
                        checked={address?.id === a.id}
                        onChange={() => {
                          setAddress(a);
                          setShowAddForm(false);
                        }}
                      />
                      <div className="flex-1 text-sm">
                        <p className="font-semibold text-brand-dark">
                          {a.name}{" "}
                          <span className="text-xs font-normal text-gray-500 ml-1">
                            {a.label}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          {a.street}, {a.city}
                        </p>
                        <p className="text-gray-500">{a.phone}</p>
                      </div>
                      {a.is_default && (
                        <span className="text-[10px] font-bold bg-brand-pink/10 text-brand-pink px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </label>
                  ))}
                  <button
                    onClick={() => {
                      setAddress(null);
                      setShowAddForm(true);
                    }}
                    className="flex items-center gap-2 text-sm text-brand-pink font-semibold hover:underline"
                  >
                    <Plus size={14} /> Use a different address
                  </button>
                </div>
              )}

              {showAddForm && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field
                    label="Full Name"
                    value={newAddr.name}
                    onChange={(v) => setNewAddr({ ...newAddr, name: v })}
                  />
                  <Field
                    label="Phone Number"
                    value={newAddr.phone}
                    onChange={(v) => setNewAddr({ ...newAddr, phone: v })}
                  />
                  <Field
                    label="Street Address"
                    value={newAddr.street}
                    onChange={(v) => setNewAddr({ ...newAddr, street: v })}
                    className="md:col-span-2"
                  />
                  <Field
                    label="City"
                    value={newAddr.city}
                    onChange={(v) => setNewAddr({ ...newAddr, city: v })}
                  />
                  <Field
                    label="District"
                    value={newAddr.district}
                    onChange={(v) => setNewAddr({ ...newAddr, district: v })}
                  />
                  <Field
                    label="Postal Code (optional)"
                    value={newAddr.postalCode}
                    onChange={(v) => setNewAddr({ ...newAddr, postalCode: v })}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Review */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-lg text-brand-dark mb-4">
                Review Your Order
              </h2>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 py-4">
                    <img
                      src={item.product.thumbnail || item.product.image}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-brand-dark line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} • by{" "}
                        {item.product.sellerName || "Verified Seller"}
                      </p>
                      {item.personalMessage && (
                        <p className="text-xs italic text-gray-500 mt-1">
                          "{item.personalMessage}"
                        </p>
                      )}
                    </div>
                    <p className="font-bold text-brand-pink">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-brand-gradient-soft rounded-xl p-3">
                <p className="text-sm font-semibold text-brand-dark">
                  Shipping to:
                </p>
                <p className="text-xs text-gray-600">
                  {(address || newAddr).name} • {(address || newAddr).phone}
                </p>
                <p className="text-xs text-gray-600">
                  {(address || newAddr).street}, {(address || newAddr).city}
                </p>
              </div>
            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-lg text-brand-dark mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-brand-pink" /> Payment
                Method
              </h2>

              {paymentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="space-y-3">
                <PayOption
                  icon={CreditCard}
                  label="Pay Online (SSLCommerz)"
                  desc="Visa, Mastercard, AMEX, internet banking, mobile banking"
                  value="sslcommerz"
                  current={payment}
                  setPayment={setPayment}
                />
                <PayOption
                  icon={Smartphone}
                  label="bKash"
                  desc="Pay securely with your bKash wallet"
                  value="bkash"
                  current={payment}
                  setPayment={setPayment}
                  accent="#E2136E"
                />
                <PayOption
                  icon={Truck}
                  label="Cash on Delivery"
                  desc="Pay when you receive your gift — no upfront payment needed"
                  value="cod"
                  current={payment}
                  setPayment={setPayment}
                />
              </div>

              {(payment === "sslcommerz" || payment === "bkash") && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  <strong>Secure payment:</strong> You will be redirected to the{" "}
                  {payment === "sslcommerz" ? "SSLCommerz" : "bKash"} secure
                  payment page to complete your transaction.
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border-2 border-gray-200 rounded-full font-semibold text-brand-dark hover:border-brand-pink hover:text-brand-pink"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                className="px-7 py-3 bg-brand-gradient text-white font-bold rounded-full flex items-center gap-2 hover:opacity-90 shadow-brand"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="px-7 py-3 bg-brand-gradient text-white font-bold rounded-full flex items-center gap-2 hover:opacity-90 shadow-brand disabled:opacity-60"
              >
                {processing
                  ? "Processing…"
                  : payment === "cod"
                    ? `Place Order • ৳${total.toLocaleString()}`
                    : `Pay ৳${total.toLocaleString()} →`}
              </button>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="self-start lg:sticky lg:top-44">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-bold text-brand-dark mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <Row
                label={`Items (${items.length})`}
                value={`৳${subtotal.toLocaleString()}`}
              />
              <Row label="Shipping" value={`৳${shippingFee}`} />
              {discount > 0 && (
                <Row
                  label="Discount"
                  value={`-৳${discount.toLocaleString()}`}
                  accent
                />
              )}
            </div>
            <div className="flex items-baseline justify-between border-t border-gray-100 pt-4 mt-4">
              <span className="font-bold text-brand-dark">Total</span>
              <span className="text-2xl font-extrabold text-brand-pink">
                ৳{total.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
              <Check size={12} className="text-green-500" />
              <span>Secure checkout powered by SSLCommerz &amp; bKash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, className = "" }) => (
  <div className={className}>
    <label className="text-xs font-semibold text-gray-600 mb-1 block">
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-pink text-sm"
    />
  </div>
);

const Row = ({ label, value, accent }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-500">{label}</span>
    <span
      className={`font-semibold ${accent ? "text-green-600" : "text-brand-dark"}`}
    >
      {value}
    </span>
  </div>
);

const PayOption = ({
  icon: Icon,
  label,
  desc,
  value,
  current,
  setPayment,
  accent,
}) => (
  <label
    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${
      current === value
        ? "border-brand-pink bg-brand-pink/5"
        : "border-gray-100 hover:border-brand-pink/30"
    }`}
  >
    <input
      type="radio"
      name="payment"
      checked={current === value}
      onChange={() => setPayment(value)}
      className="sr-only"
    />
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        current === value
          ? "border-brand-pink bg-brand-pink"
          : "border-gray-300"
      }`}
    >
      {current === value && <Check size={12} className="text-white" />}
    </div>
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: accent ? `${accent}15` : "#FFE5EF" }}
    >
      <Icon size={18} style={{ color: accent || "#FF2D78" }} />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-sm text-brand-dark">{label}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </label>
);

export default Checkout;
