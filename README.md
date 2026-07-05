# Prizzy — Production-Ready Gift Marketplace 🎁

A full-stack e-commerce gift marketplace for the Bangladeshi market.  
**Stack:** React · Express · Supabase (PostgreSQL + RLS) · Gemini 2.5 Flash AI · SSLCommerz · bKash

---

## What Changed in This Release

### 🤖 AI — Migrated to Gemini 2.5 Flash (Free Tier)
All AI features now route through the Express backend using **Gemini 2.5 Flash**:
- `useGiftAI.js` — conversational advisor & guided picker → calls `/api/ai/gift-chat` & `/api/ai/gift-guided`
- `useVendorAI.js` — vendor insight & vendor chatbot → calls `/api/ai/vendor-insight` & `/api/ai/vendor-chat`

**No Anthropic SDK** or `REACT_APP_ANTHROPIC_KEY` needed anymore.

### 💳 Payment Gateway — SSLCommerz + bKash (Live)
`Checkout.jsx` now supports three real payment paths:

| Method | Flow |
|---|---|
| Cash on Delivery | Direct order via Supabase RPC, no redirect |
| SSLCommerz | Order created → redirect to SSL gateway → IPN callback updates DB |
| bKash | Order created → redirect to bKash URL → callback executes payment → DB updated |

### 🐛 Bugs Fixed
| Bug | Fix |
|---|---|
| `useGiftAI` calling Anthropic directly (broken in production) | Routes to Gemini backend |
| `useVendorAI` calling Anthropic directly | Routes to Gemini backend |
| Checkout price tampering vulnerability (client-side totals trusted) | Totals recalculated server-side in `place_order()` RPC |
| `payment_reference` column mismatch | Uses correct `payment_ref` column name |
| Payment redirect handling — no error recovery on return | `useSearchParams` detects `?payment=failed/cancelled` and shows inline error |

---

## Project Structure

```
Prizzy-production/
├── frontend/               # React (CRA + CRACO + Tailwind)
│   └── src/
│       ├── hooks/
│       │   ├── useGiftAI.js        ← Gemini-powered (calls backend)
│       │   ├── useVendorAI.js      ← Gemini-powered (calls backend)
│       │   └── useSupabaseData.js  ← All Supabase queries + RPC
│       ├── pages/
│       │   └── Checkout.jsx        ← SSLCommerz + bKash + COD
│       └── context/
│           └── AuthContext.js      ← Profile enrichment + real-time sync
├── server/                 # Express backend
│   ├── index.js            ← AI endpoints + payment gateway endpoints
│   ├── package.json
│   └── .env.example        ← All required env vars
└── db/
    ├── 001_complete_schema.sql     ← Full Supabase schema
    └── 002_payment_gateway_support.sql  ← Migration: payment indexes
```

---

## Environment Variables

### Frontend (`frontend/.env`)
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_API_URL=https://your-backend.railway.app   # or http://localhost:3001
```

### Backend (`server/.env`)
```env
# AI
GEMINI_API_KEY=your_gemini_api_key   # Get free at aistudio.google.com

# Supabase (use service_role for payment status updates)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# SSLCommerz — https://developer.sslcommerz.com
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_SANDBOX=true   # Set to false for production

# bKash Tokenized — https://developer.bka.sh
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password
BKASH_SANDBOX=true   # Set to false for production

# URLs (used for payment callbacks)
BACKEND_URL=https://your-backend.railway.app
FRONTEND_URL=https://prizzy-sigma.vercel.app
PORT=3001
```

---

## Supabase Storage — Required Setup

The app uses Supabase Storage for seller shop logos and cover photos. **This bucket must be created manually** — it is not part of the SQL schema.

### Create the `shop-images` bucket

1. Open your Supabase project → **Storage** in the left sidebar
2. Click **New bucket**
3. Name: `shop-images`
4. Toggle **Public bucket** → ON (images are served publicly via CDN URL)
5. Click **Save**

That's it. The frontend upload code will work automatically once the bucket exists. If you skip this step, sellers will see an error when trying to upload a logo or cover photo.

> **Optional:** Add a 5 MB file-size policy in the bucket's Policies tab to match the frontend validation.

---

## Local Development

```bash
# 1. Database — run in Supabase SQL Editor (in this order)
#    db/001_complete_schema.sql            (full schema + RLS)
#    db/002_payment_gateway_support.sql    (payment indexes)
#    db/003_fix_rls_and_shop_follows.sql   (RLS fix + shop follows)

# 2. Backend
cd server
cp .env.example .env   # fill in your keys
npm install
npm start              # runs on :3001

# 3. Frontend
cd frontend
cp .env.example .env   # fill in your keys
yarn install
yarn start             # runs on :3000
```

---

## Payment Gateway Setup

### SSLCommerz (Sandbox → Live)
1. Sign up at [developer.sslcommerz.com](https://developer.sslcommerz.com)
2. Get sandbox `STORE_ID` and `STORE_PASSWORD`
3. Add your backend URL in SSLCommerz dashboard for IPN: `https://your-backend.com/api/payment/sslcommerz/ipn`
4. Set `SSLCOMMERZ_SANDBOX=false` when going live

### bKash Tokenized Checkout (Sandbox → Live)
1. Apply at [developer.bka.sh](https://developer.bka.sh)
2. Get sandbox credentials
3. Set callback URL in bKash dashboard: `https://your-backend.com/api/payment/bkash/callback`
4. Set `BKASH_SANDBOX=false` when going live

---

## Deployment

**Frontend** → Vercel (set env vars in Vercel dashboard)  
**Backend** → Railway / Render / Fly.io (set env vars in platform dashboard)  
**Database** → Supabase (already hosted)

> The backend must have a publicly accessible URL for payment gateway callbacks to work.

### Pre-deploy checklist

- [ ] `FRONTEND_URL` set in backend env (e.g. `https://your-app.vercel.app`) — drives CORS + payment redirects
- [ ] `BACKEND_URL` set in backend env — drives payment callback URLs
- [ ] `SSLCOMMERZ_SANDBOX=false` and live credentials for production
- [ ] `BKASH_SANDBOX=false` and live credentials for production
- [ ] SSLCommerz dashboard → IPN URL set to `https://your-backend.com/api/payment/sslcommerz/ipn`
- [ ] bKash dashboard → callback URL set to `https://your-backend.com/api/payment/bkash/callback`
- [ ] Supabase Auth → Site URL set to your production frontend URL
- [ ] Supabase Auth → Email confirmation enabled (disable only for local dev)
- [ ] `shop-images` Storage bucket created and set to public (see above)
- [ ] `og:url` in `frontend/public/index.html` updated to your real domain
- [ ] `og:image` (`public/og-image.png`) added — 1200×630 px recommended
