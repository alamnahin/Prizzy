// server/seed.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// Initialize Supabase with the MASTER KEY (Service Role)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- THE DATA PAYLOAD ---
// 1. Categories
const categories = [
  { id: "flowers", name: "Flowers & Bouquets", slug: "flowers", icon: "🌸" },
  { id: "cakes", name: "Cakes & Treats", slug: "cakes", icon: "🎂" },
  { id: "custom", name: "Personalized", slug: "custom", icon: "✨" },
  { id: "hampers", name: "Gift Hampers", slug: "hampers", icon: "🎁" },
];

// 2. Generate UUIDs for Sellers to map them to Products
const sellerId1 = crypto.randomUUID();
const sellerId2 = crypto.randomUUID();

const sellers = [
  {
    id: sellerId1,
    shop_name: "Petal Paradise",
    rating: 4.9,
    verified: true,
    category: "flowers",
  },
  {
    id: sellerId2,
    shop_name: "Cocoa Dreams",
    rating: 4.8,
    verified: true,
    category: "cakes",
  },
];

// 3. Products
const products = [
  {
    id: crypto.randomUUID(),
    slug: "premium-red-roses-bouquet",
    name: "Premium Red Roses Bouquet",
    seller_id: sellerId1, // Linked to Petal Paradise
    price: 2500,
    discount_price: 2100,
    category: "flowers",
    occasion: ["Anniversary", "Valentine", "Birthday"],
    gift_for: ["Her", "Parents"],
    rating: 4.9,
    num_reviews: 128,
    stock: 50,
    sold: 340,
    is_customizable: true,
    thumbnail:
      "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?q=80&w=1200&auto=format&fit=crop",
    ],
    short_description:
      "A luxurious arrangement of 24 fresh red roses wrapped in premium matte paper.",
  },
  {
    id: crypto.randomUUID(),
    slug: "black-forest-cake-1kg",
    name: "Black Forest Signature Cake (1kg)",
    seller_id: sellerId2, // Linked to Cocoa Dreams
    price: 1800,
    discount_price: 1650,
    category: "cakes",
    occasion: ["Birthday", "Anniversary"],
    gift_for: ["Him", "Her", "Kids"],
    rating: 4.7,
    num_reviews: 85,
    stock: 10,
    sold: 156,
    is_customizable: true,
    thumbnail:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop",
    ],
    short_description:
      "Classic black forest cake with layers of fresh cherry compote and rich chocolate.",
  },
  {
    id: crypto.randomUUID(),
    slug: "personalized-led-lamp",
    name: "Personalized 3D LED Illusion Lamp",
    seller_id: sellerId1,
    price: 1500,
    discount_price: 1200,
    category: "custom",
    occasion: ["Birthday", "Wedding"],
    gift_for: ["Him", "Her"],
    rating: 4.8,
    num_reviews: 42,
    stock: 100,
    sold: 89,
    is_customizable: true,
    thumbnail:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop",
    ],
    short_description:
      "Engrave your favorite photo or name on this beautiful acrylic LED lamp.",
  },
];

// --- THE MIGRATION ENGINE ---
async function runSeed() {
  console.log("🚀 Starting Database Seed...");

  // Insert Categories
  const { error: catErr } = await supabase
    .from("categories")
    .upsert(categories);
  if (catErr) return console.error("❌ Categories Error:", catErr);
  console.log("✅ Categories inserted!");

  // Insert Sellers
  const { error: selErr } = await supabase.from("sellers").upsert(sellers);
  if (selErr) return console.error("❌ Sellers Error:", selErr);
  console.log("✅ Sellers inserted!");

  // Insert Products
  const { error: prodErr } = await supabase.from("products").upsert(products);
  if (prodErr) return console.error("❌ Products Error:", prodErr);
  console.log("✅ Products inserted!");

  console.log(
    "🎉 Seeding Complete! Your Supabase database is now fully populated.",
  );
}

runSeed();
