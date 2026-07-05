# PRIZZY — Master Context Document
### Fullstack Migration + AI Features Plan
> Paste this entire file at the start of any chat with any AI model. It is the single source of truth.

---

## 0. What Prizzy Is

**Prizzy** is a multi-vendor gift e-commerce marketplace for the **Bangladeshi market** (currency: ৳ BDT). Customers browse and buy gifts; sellers list products in their own shops; an admin manages the platform.

**Current state:** React 19 frontend with 100% mock data in `src/mock.js`. No backend exists yet.

**Goal:** Migrate to a real fullstack app with:
- Node.js + Express backend (`server/index.js`)
- Supabase as the database + auth backend
- Gemini 1.5 Flash AI for customer gift recommendations and seller analytics

---

## 1. Repository Structure (as uploaded)

```
frontend/
  package.json                  ← React 19, CRA + craco, yarn
  tailwind.config.js            ← Brand tokens (see Section 3)
  components.json               ← ShadCN config
  craco.config.js               ← Build customisation
  public/index.html
  src/
    App.js                      ← Router root (all routes here)
    index.js                    ← React entry point
    index.css                   ← Tailwind + Poppins font + custom utilities
    App.css
    mock.js                     ← ALL current data lives here (replace with API calls)
    lib/utils.js                ← cn() utility (clsx + tailwind-merge)
    context/
      AuthContext.js            ← useAuth() — currently mock login/register
      CartContext.js            ← useCart() — localStorage-persisted cart + wishlist
    hooks/
      use-toast.js              ← Toast notification hook (ShadCN)
    components/
      ui/                       ← Full ShadCN/Radix UI component library
      layout/
        Layout.jsx              ← Outlet wrapper (Header + Footer + MobileBottomNav)
        Header.jsx              ← Sticky nav with search, cart, auth dropdown
        Footer.jsx
        MobileBottomNav.jsx
      home/
        HeroSlider.jsx          ← Autoplay banner carousel
        CategoryGrid.jsx        ← 10-category grid
        FlashSale.jsx           ← Countdown timer + product grid
        FeaturedProducts.jsx
        OccasionSection.jsx     ← Reusable section (Birthday, Anniversary, Eid)
        SellerSpotlight.jsx
        Features.jsx            ← Value props (delivery, secure pay, etc.)
      product/
        ProductCard.jsx         ← Reusable product card (wishlist + add-to-cart)
    pages/
      Home.jsx                  ← Assembles home sections
      ProductList.jsx           ← Filters (category, price, occasion, giftFor, search)
      ProductDetail.jsx         ← Full PDP with gallery, reviews, add-to-cart
      Cart.jsx                  ← Cart with qty controls, coupon input
      Checkout.jsx              ← Multi-step checkout (address → payment → confirm)
      OrderSuccess.jsx          ← Post-order confirmation
      Login.jsx                 ← Stub (renders nothing currently)
      Register.jsx              ← Stub
      UserProfile.jsx           ← Stub
      SellerDashboard.jsx       ← Stub: <Stub title="Seller Dashboard" />
      AdminDashboard.jsx        ← Stub: <Stub title="Admin Dashboard" />
      NotFound.jsx
      Stub.jsx                  ← Generic stub component

  plugins/
    health-check/               ← Webpack health plugin (don't touch)
```

---

## 2. Current Routes (`src/App.js`)

All routes wrap inside `<Layout />` (Header + Footer) except `/login` and `/register`:

```
/                           → Home.jsx
/products                   → ProductList.jsx
/products/:slug             → ProductDetail.jsx
/category/:slug             → ProductList.jsx
/cart                       → Cart.jsx
/checkout                   → Checkout.jsx
/order-success/:orderNumber → OrderSuccess.jsx
/profile                    → UserProfile.jsx (stub)
/seller/dashboard           → SellerDashboard.jsx (stub)
/admin/dashboard            → AdminDashboard.jsx (stub)
/login                      → Login.jsx (no Layout)
/register                   → Register.jsx (no Layout)
* (404)                     → NotFound.jsx
```

**New routes to add (Phase 1):**
- `/ai-gift-finder` → `AiGiftFinder.jsx` (inside Layout)

---

## 3. Design System — LOCKED, Never Change

### Brand Colours (in `tailwind.config.js`)
```
brand.pink:         #FF2D78    → bg-brand-pink / text-brand-pink
brand.pinkLight:    #FF5C95
brand.pinkDark:     #E61A66
brand.purple:       #6B21A8    → bg-brand-purple / text-brand-purple
brand.purpleLight:  #8B3FCE
brand.purpleDark:   #4C148A
brand.dark:         #1A1A2E    → bg-brand-dark / text-brand-dark
brand.lightGray:    #F5F5F5
```

### Gradients
```css
bg-brand-gradient         → linear-gradient(135deg, #FF2D78 0%, #6B21A8 100%)
bg-brand-gradient-soft    → linear-gradient(135deg, #FFE5EF 0%, #F3E8FF 100%)
bg-brand-gradient-reverse → linear-gradient(135deg, #6B21A8 0%, #FF2D78 100%)
```

### Typography
- Font: **Poppins** (loaded via Google Fonts in `index.css`)
- Section headings: `text-2xl font-bold text-brand-dark`
- Gradient text: `text-gradient font-extrabold` (utility in `index.css`)

### Spacing / Shape
- Cards: `rounded-2xl`
- Buttons & pills: `rounded-full`
- Shadows: `shadow-brand` / `shadow-brand-lg`

### Component Patterns (copy these, never invent alternatives)
```jsx
// Primary button
<button className="bg-brand-gradient text-white font-semibold px-6 py-3 rounded-full hover:opacity-90">

// Card
<div className="bg-white rounded-2xl border border-gray-100 hover:border-brand-pink/30 hover:shadow-brand p-4">

// Badge / pill
<span className="bg-brand-pink/10 text-brand-pink text-xs font-semibold px-3 py-1 rounded-full">

// Section heading
<h2 className="text-2xl font-bold text-brand-dark">

// Gradient text
<span className="text-gradient font-extrabold">
```

---

## 4. Key Context Files — Data Shapes

### `src/mock.js` exports (these become Supabase tables)

```typescript
// categories (10 items)
{ id, name, slug, icon, image, count }

// heroBanners (4 items)
{ id, title, subtitle, cta, image, badge, link }

// occasions (8 items)
{ id, name, emoji }

// sellers (6 items)
{ id, shop_name, shopLogo, rating, products, sales, category, verified }

// products (many items) — FULL SHAPE:
{
  id: string                  // "p1"
  slug: string                // "romantic-red-roses-bouquet"
  name: string
  seller: { shop_name, shopLogo, ... }  // joined from sellers
  price: number               // original BDT price
  discountPrice: number       // sale price
  discountPercent: number
  category: string            // "flowers" | "chocolate" | "jewelry" | "photo" | "crafts" | "cakes" | "toys" | "hampers" | "personalized" | "candles"
  occasion: string[]          // ["Birthday", "Anniversary", "Eid", "Wedding", "Valentine", "New Year", "Pohela Boishakh", "New Born"]
  giftFor: string[]           // ["Her", "Him", "Parents", "Kids", "Friends"]
  rating: number
  numReviews: number
  stock: number
  sold: number
  isFeatured: boolean
  isCustomizable: boolean
  deliveryTime: string        // "1-2 days"
  shortDescription: string
  thumbnail: string           // Unsplash URL
  images: string[]
}

// coupons
{ code, discountType: "percentage"|"flat", discountValue, minimumOrder, maximumDiscount }

// mockUser
{ id, name, email, phone, avatar, role: "customer", addresses: [...], loyaltyPoints, memberSince }

// mockOrders (array)
{ id, orderNumber, date, status, items, subtotal, shippingFee, discount, totalAmount, paymentMethod, paymentStatus, orderStatus }

// mockReviews
{ id, productId, user, rating, comment, date, verified }

// sellerStats (vendor dashboard mock)
{ totalSales, totalRevenue, pendingOrders, productsListed, monthlyRevenue: [...], ordersByStatus: [...] }

// adminStats
{ totalRevenue, totalOrders, totalUsers, totalSellers, pendingApprovals: { sellers, products, withdrawals } }
```

---

## 5. Context Files — Current Implementations

### `src/context/AuthContext.js`
```javascript
// State: user (null | object)
// Methods: login(email, password), register(data), logout()
// Storage: localStorage key "prizzy_user"
// Currently: uses mockUser — needs to be replaced with Supabase auth
export const useAuth = () => useContext(AuthContext);
```

### `src/context/CartContext.js`
```javascript
// State: items[], wishlist[], coupon
// Methods: addToCart(product, qty, personalMessage), updateQty, removeFromCart,
//          clearCart, toggleWishlist, inWishlist(productId), setCoupon
// Computed: subtotal, shippingFee (৳60 flat), discount, total, itemCount
// Storage: localStorage keys "prizzy_cart", "prizzy_wishlist"
// ⚠️ Cart data should eventually sync to Supabase for logged-in users
export const useCart = () => useContext(CartContext);
```

### `src/components/product/ProductCard.jsx`
```javascript
// Props: product (full product object), compact (boolean, default false)
// Uses: useCart (addToCart, toggleWishlist, inWishlist), use-toast
// Renders: image, discount badge, wishlist heart, hover add-to-cart, rating, price, seller name
// Link: navigates to /products/${product.slug}
```

---

## 6. Installed Libraries (from package.json)

### Already installed — USE THESE:
```
axios ^1.8.4                ← HTTP client
react-router-dom ^7.5.1    ← Routing
recharts ^3.8.1             ← Charts (for seller dashboard)
react-hook-form ^7.56.2    ← Forms
zod ^3.24.4                ← Validation
lucide-react ^0.507.0      ← Icons
@radix-ui/* (full suite)   ← Headless UI primitives
ShadCN components in src/components/ui/ (accordion, dialog, tabs, select, input, button, card, toast, calendar, carousel, form, etc.)
date-fns ^4.1.0
```

### NOT installed yet — add when needed:
```bash
# Supabase client
npm install @supabase/supabase-js

# Backend (in /server):
npm install express cors dotenv @google/generative-ai express-rate-limit
```

---

## 7. Fullstack Architecture — Target State

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (port 3000)                  │
│  React 19 + Tailwind + ShadCN + React Router v7         │
│                                                          │
│  Auth: @supabase/supabase-js (replaces AuthContext mock) │
│  Data: axios calls to Express API (replaces mock.js)    │
│  AI:   axios calls to /api/ai/* endpoints               │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP (axios)
┌─────────────────────▼───────────────────────────────────┐
│              BACKEND  server/index.js (port 3001)        │
│  Express + cors + express-rate-limit                     │
│                                                          │
│  Routes:                                                 │
│    POST /api/ai/gift-chat       ← Customer AI chat       │
│    POST /api/ai/gift-guided     ← Tap-based picker       │
│    POST /api/ai/vendor-insight  ← Daily seller digest    │
│    POST /api/ai/vendor-chat     ← Seller AI chatbot      │
│                                                          │
│  GET  /api/products             ← (Phase 2: real data)   │
│  POST /api/orders               ← (Phase 2)              │
│  GET  /api/orders/:id           ← (Phase 2)              │
└──────────────┬──────────────────┬───────────────────────┘
               │                  │
┌──────────────▼────┐   ┌────────▼──────────────────────┐
│  Supabase          │   │  Google Gemini 1.5 Flash       │
│  - Auth            │   │  (GEMINI_API_KEY)              │
│  - PostgreSQL DB   │   │  Free tier: 15 RPM, 1M TPD    │
│  - Storage (imgs)  │   └───────────────────────────────┘
└───────────────────┘
```

---

## 8. Supabase Database Schema (to create)

```sql
-- Run in Supabase SQL editor

-- Categories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  image TEXT,
  count INT DEFAULT 0
);

-- Sellers / Shops
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  shop_name TEXT NOT NULL,
  shop_logo TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  seller_id UUID REFERENCES sellers(id),
  price INT NOT NULL,               -- in BDT paisa or whole taka
  discount_price INT,
  discount_percent INT DEFAULT 0,
  category TEXT,
  occasion TEXT[],                  -- Postgres array
  gift_for TEXT[],
  rating DECIMAL(2,1) DEFAULT 0,
  num_reviews INT DEFAULT 0,
  stock INT DEFAULT 0,
  sold INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_customizable BOOLEAN DEFAULT false,
  delivery_time TEXT,
  short_description TEXT,
  thumbnail TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,             -- array of {product_id, name, price, qty, personalMessage}
  subtotal INT NOT NULL,
  shipping_fee INT DEFAULT 60,
  discount INT DEFAULT 0,
  total_amount INT NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'placed',
  shipping_address JSONB,
  coupon_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES products(id),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'flat')),
  discount_value INT NOT NULL,
  minimum_order INT DEFAULT 0,
  maximum_discount INT,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ
);

-- Wishlist (persistent across devices)
CREATE TABLE wishlists (
  user_id UUID REFERENCES auth.users(id),
  product_id TEXT REFERENCES products(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);
```

### Supabase RLS Policies (add these after creating tables)
```sql
-- Products: public read
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products" ON products FOR SELECT USING (true);

-- Orders: users see own orders only
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own orders" ON orders FOR ALL USING (auth.uid() = user_id);

-- Wishlists: users manage own
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);
```

---

## 9. Environment Variables

### Frontend `.env` (in `frontend/`)
```
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### Backend `.env` (in `server/`)
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Get Gemini key free:** https://aistudio.google.com/app/apikey
**Get Supabase keys:** https://supabase.com/dashboard → Project Settings → API

---

## 10. Backend — `server/index.js` (full spec)

### Setup
```javascript
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

app.use(cors({ origin: ['http://localhost:3000', 'https://prizzy-sigma.vercel.app'] }));
app.use(express.json({ limit: '2mb' }));

// Rate limit: protect free Gemini tier (15 RPM)
const aiLimiter = rateLimit({ windowMs: 60_000, max: 12 });
app.use('/api/ai', aiLimiter);

// Input sanitiser — run on all user text before it enters prompts
function sanitiseInput(text) {
  return String(text).replace(/<[^>]*>/g, '').replace(/[{}[\]]/g, '').slice(0, 800);
}

// Error wrapper
async function safeHandler(fn, res) {
  try { await fn(); }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed', message: err.message });
  }
}
```

### Endpoints

#### `POST /api/ai/gift-chat`
Conversational customer gift advisor.

**Request:** `{ messages: [{role, content}], products: [...] }`

**Logic:**
1. Slice products to 40 max, map to slim shape `{id, slug, name, price, category, occasion, giftFor, rating, description, deliveryTime}`
2. Build system prompt (Prizzy gift advisor, Bangladeshi market, warm tone, Bengali words like "ভাই", "আপু")
3. Start Gemini chat with full message history
4. Rules in prompt: respond in warm English+Bengali, ALWAYS append `\`\`\`json {"recommendations": [{productId, matchScore, reason}]}\`\`\`` block, recommend 3–5 products, ask ONE clarifying question if missing recipient/occasion/budget, never invent products
5. Return: `{ reply: string }` — frontend parses the JSON block out of the reply text

**Frontend parsing helpers:**
```javascript
function parseRecommendations(text) {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  if (!match) return [];
  try { return JSON.parse(match[1]).recommendations || []; } catch { return []; }
}
function getDisplayText(text) {
  return text.replace(/```json\n[\s\S]*?\n```/g, '').trim();
}
```

---

#### `POST /api/ai/gift-guided`
Structured (tap-based) one-shot recommendation.

**Request:** `{ occasion, recipient, budgetMin, budgetMax, products }`

**Logic:**
1. Filter products to budget range, slice to 30
2. One-shot Gemini prompt: pick best 4 for occasion + recipient
3. Return `{ picks: [{productId, matchScore, reason}] }` — pure JSON, no chat
4. Strip markdown fences before JSON.parse

---

#### `POST /api/ai/vendor-insight`
Daily AI morning digest for a seller.

**Request:** `{ shop_name, salesData: {revenueThisMonth, revenueLastMonth, orderCount, topProducts, categoryBreakdown, repeatCustomerRate, avgOrderValue}, upcomingOccasions }`

**Logic:**
1. One-shot Gemini prompt: business analyst, reference real numbers, under 120 words
2. Return `{ headline, insights: string[], occasionTip, tags: string[] }`
3. **Frontend must cache in localStorage with 24h TTL** — don't call on every mount

---

#### `POST /api/ai/vendor-chat`
Vendor asks freeform questions about their own data.

**Request:** `{ messages, shop_name, salesData }`

**Logic:** Same pattern as gift-chat, system prompt focuses on business analytics. Don't make up numbers not in the data.

---

## 11. Frontend — New Files to Create

### File structure additions
```
src/
  pages/
    AiGiftFinder.jsx              ← Phase 1: tab-toggle between chat and guided
  components/
    ai/
      GiftChatInterface.jsx       ← Conversational chat UI (Phase 1)
      GuidedGiftFlow.jsx          ← 3-step tap flow (Phase 1)
      AiProductCard.jsx           ← Product card with matchScore + reason (Phase 1)
      AiInsightPanel.jsx          ← Vendor morning digest display (Phase 2)
      VendorAiChat.jsx            ← Vendor chatbot (Phase 2)
  hooks/
    useGiftAI.js                  ← sendMessage() + useGuidedGift() (Phase 1)
    useVendorAI.js                ← getInsight() + sendVendorMessage() (Phase 2)
    useSupabase.js                ← Supabase client singleton (Phase 2)
```

### Route addition in `App.js`
```jsx
import AiGiftFinder from "./pages/AiGiftFinder";
// Inside <Route element={<Layout />}>:
<Route path="/ai-gift-finder" element={<AiGiftFinder />} />
```

### AI FAB on `Home.jsx`
Add between `<HeroSlider />` and `<Features />`:
```jsx
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

// In JSX:
<section className="max-w-7xl mx-auto px-4 my-4">
  <button
    onClick={() => navigate('/ai-gift-finder')}
    className="w-full bg-brand-gradient rounded-2xl p-4 flex items-center gap-4 hover:opacity-95 shadow-brand-lg text-left"
  >
    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
      <Sparkles size={24} className="text-white" />
    </div>
    <div className="flex-1">
      <h3 className="text-white font-bold text-base">AI Gift Finder</h3>
      <p className="text-white/80 text-sm">Tell me who it's for — I'll find the perfect gift ✨</p>
    </div>
    <span className="text-white/70 text-xl">›</span>
  </button>
</section>
```

### `useGiftAI.js` API hook
```javascript
// API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001'
// useGiftAI(): { messages, loading, error, sendMessage(userText), reset }
// useGuidedGift(): { result, loading, error, getRecommendations({occasion, recipient, budgetMin, budgetMax}) }
// Both import { products } from '../mock' (until Supabase integration)
```

### `AiProductCard.jsx` props
```javascript
// Props: { product (full product object), matchScore (number), reason (string) }
// Extends ProductCard visual language
// Adds: sparkle badge top-left showing "{matchScore}% match" (bg-brand-gradient)
// Adds: AI reason in soft gradient pill (bg-brand-gradient-soft text-brand-purple)
// Same hover add-to-cart pattern as ProductCard
```

### `GiftChatInterface.jsx` behaviour
- Full chat bubble UI (user right, AI left)
- Show starter chips before first message: ["Gift for mum's birthday...", "Anniversary gift for my wife...", etc.]
- After AI reply: call `parseRecommendations()` to extract product cards
- Render `<AiProductCard />` grid below the AI bubble
- Show animated loading dots (3 bouncing dots in brand-purple) while waiting
- Auto-scroll to bottom on each new message
- Strip JSON block from display using `getDisplayText()`

### `GuidedGiftFlow.jsx` — 3-step tap flow
- Step 1: Occasion chips (Birthday, Anniversary, Eid, Wedding, Valentine, etc.)
- Step 2: Recipient chips (Partner, Mum, Dad, Friend, Kids, Boss)
- Step 3: Budget range slider (min ৳500 – max ৳10,000)
- Submit → `getRecommendations()` → show `<AiProductCard />` grid
- Progress indicator at top

### `AiGiftFinder.jsx`
- Tab toggle: "Chat with AI" | "Quick Pick" (guided flow)
- Renders `<GiftChatInterface />` or `<GuidedGiftFlow />` based on tab
- URL: `/ai-gift-finder` (no `?mode=guided` query needed — just tabs)
- Page header: gradient background, Sparkles icon, "AI Gift Advisor" title

---

## 12. AuthContext Migration to Supabase

Replace mock login with real Supabase auth. The shape of `user` must stay compatible.

```javascript
// src/lib/supabase.js (new file)
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// src/context/AuthContext.js — replace bodies of login/register/logout:
const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  setUser(data.user);
  return { success: true };
};

const register = async ({ email, password, name }) => {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) return { success: false, error: error.message };
  setUser(data.user);
  return { success: true };
};

const logout = async () => {
  await supabase.auth.signOut();
  setUser(null);
};

// Replace useEffect that reads localStorage:
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user ?? null));
  const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
    setUser(session?.user ?? null);
  });
  return () => sub.subscription.unsubscribe();
}, []);
```

---

## 13. Data Migration Plan (mock.js → Supabase)

### Step 1: Seed script
Create `server/seed.js` — reads from `src/mock.js` (or a copy), inserts into Supabase using service role key.

### Step 2: Replace each data import
| Currently | Replace with |
|-----------|-------------|
| `import { products } from '../mock'` | `GET /api/products` or `supabase.from('products').select(...)` |
| `import { categories } from '../mock'` | `GET /api/categories` or direct Supabase query |
| `import { sellers } from '../mock'` | Supabase query |
| `import { mockUser } from '../mock'` | `supabase.auth.getUser()` |
| Coupon validation in CartContext | `GET /api/coupons/:code` → Supabase lookup |

### Step 3: Product API endpoint (backend)
```javascript
// GET /api/products
app.get('/api/products', async (req, res) => {
  const { category, occasion, giftFor, minPrice, maxPrice, q, limit = 40, offset = 0 } = req.query;
  // Build Supabase query with filters, return { products, total }
});
```

---

## 14. Phased Build Plan

### Phase 1 — Customer AI (ship first, ~2–3 days)
**Backend:**
- [ ] Create `server/` directory, init npm
- [ ] `npm install express cors dotenv @google/generative-ai express-rate-limit`
- [ ] Write `server/index.js` with `POST /api/ai/gift-chat` and `POST /api/ai/gift-guided`
- [ ] Add `.env` with `GEMINI_API_KEY`
- [ ] Test endpoints with Postman/curl

**Frontend:**
- [ ] `src/hooks/useGiftAI.js` (sendMessage + useGuidedGift)
- [ ] `src/components/ai/AiProductCard.jsx`
- [ ] `src/components/ai/GiftChatInterface.jsx`
- [ ] `src/components/ai/GuidedGiftFlow.jsx`
- [ ] `src/pages/AiGiftFinder.jsx`
- [ ] Add route `/ai-gift-finder` to `App.js`
- [ ] Add AI FAB to `Home.jsx`
- [ ] `.env` with `REACT_APP_API_URL=http://localhost:3001`
- [ ] Test end-to-end: chat → AI response → product cards

### Phase 2 — Vendor Intelligence (~2 days)
- [ ] `POST /api/ai/vendor-insight` endpoint
- [ ] `POST /api/ai/vendor-chat` endpoint
- [ ] `src/components/ai/AiInsightPanel.jsx`
- [ ] `src/components/ai/VendorAiChat.jsx`
- [ ] Rebuild `src/pages/SellerDashboard.jsx` with KPIs + recharts + AI panel
- [ ] Cache vendor insight in localStorage with 24h TTL
- [ ] `src/hooks/useVendorAI.js`

### Phase 3 — Supabase Integration (~3–5 days)
- [ ] Create Supabase project, run schema SQL (Section 8)
- [ ] Write `server/seed.js` to populate from mock data
- [ ] `src/lib/supabase.js` client singleton
- [ ] Migrate `AuthContext.js` to real Supabase auth
- [ ] `GET /api/products` endpoint (with filters)
- [ ] Replace all `mock.js` imports in pages with API calls
- [ ] Migrate cart wishlist to Supabase for logged-in users
- [ ] Persist orders to Supabase `orders` table on checkout success

### Phase 4 — Personalisation (after Phase 3 is stable)
- [ ] Home hero banners rotated based on `user.lastPurchaseCategory`
- [ ] Trending section reordered by AI match to user profile
- [ ] Admin dashboard (real data from Supabase)
- [ ] Seller product management (CRUD on products table)
- [ ] Review submission (real reviews table)

---

## 15. Common Mistakes — Avoid These

| Mistake | Fix |
|---------|-----|
| Putting `GEMINI_API_KEY` in the frontend | Always proxy through the Node server. Never put it in `REACT_APP_*` |
| Sending entire products array to Gemini | Slice to 40 max. Full catalogue exceeds token limits |
| Calling vendor insight on every component mount | Cache in localStorage with 24h TTL |
| Showing raw `` ```json `` block in chat UI | Always call `getDisplayText()` to strip it before rendering |
| Hardcoding `http://localhost:3001` in components | Use `process.env.REACT_APP_API_URL` with fallback |
| Not sanitising user input | Run `sanitiseInput()` on all user text before prompts |
| Inventing new Tailwind colours or gradients | Use only brand tokens from Section 3 |
| Changing font, border-radius, or gradient | The design system is locked |
| Using `border-[#FF2D78]` inline | Use `border-brand-pink` class |
| Using `useEffect` with no loading state | Always show loading indicator — Gemini takes 1–3s |
| Storing supabase service role key in frontend | Only use `SUPABASE_ANON_KEY` in frontend; service role only in backend |

---

## 16. Quick Reference — What Each File Does

| File | Purpose | Status |
|------|---------|--------|
| `src/mock.js` | All platform data (products, sellers, orders, etc.) | Exists — replace with API |
| `src/context/AuthContext.js` | Auth state + login/register/logout | Exists — mock, needs Supabase |
| `src/context/CartContext.js` | Cart + wishlist state (localStorage) | Exists — works, can keep |
| `src/components/product/ProductCard.jsx` | Reusable product card | Exists — don't modify |
| `src/components/layout/Header.jsx` | Sticky nav, search, auth | Exists — don't modify |
| `src/pages/SellerDashboard.jsx` | Seller dashboard | Stub — rebuild in Phase 2 |
| `src/pages/AdminDashboard.jsx` | Admin dashboard | Stub — Phase 4 |
| `src/pages/Login.jsx` | Login page | Stub — implement in Phase 3 |
| `src/pages/Register.jsx` | Register page | Stub — implement in Phase 3 |
| `src/pages/UserProfile.jsx` | Profile + wishlist | Stub — Phase 3 |
| `server/index.js` | Express backend | Does not exist yet — create |
| `server/.env` | Backend secrets | Does not exist yet — create |
| `src/hooks/useGiftAI.js` | AI gift chat API calls | Does not exist yet — Phase 1 |
| `src/pages/AiGiftFinder.jsx` | AI gift finder page | Does not exist yet — Phase 1 |

---

## 17. Running Locally

```bash
# Terminal 1 — Frontend
cd frontend
yarn install
yarn start         # http://localhost:3000

# Terminal 2 — Backend (after creating server/)
cd server
npm install
node index.js      # http://localhost:3001
```

---

*Prizzy AI — Same look. Smarter gifts. Happier customers. Growing vendors.*
*Last updated: context built from repo scan of frontend.zip + prompt.md*
