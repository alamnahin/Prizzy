// server/seed-full.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🚀 Initializing Mass Migration Engine...");

// --- 1. RAW MOCK DATA ---
const categories = [
  {
    id: "flowers",
    name: "Flowers & Bouquets",
    slug: "flowers-bouquets",
    icon: "Flower2",
    image:
      "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=400&q=80",
    count: 124,
  },
  {
    id: "chocolate",
    name: "Chocolate & Sweets",
    slug: "chocolate-sweets",
    icon: "Candy",
    image:
      "https://images.unsplash.com/photo-1599599811214-3d44be99547f?w=400&q=80",
    count: 86,
  },
  {
    id: "jewelry",
    name: "Jewelry & Accessories",
    slug: "jewelry-accessories",
    icon: "Gem",
    image:
      "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=400&q=80",
    count: 192,
  },
  {
    id: "photo",
    name: "Photo Gifts & Frames",
    slug: "photo-frames",
    icon: "Image",
    image:
      "https://images.unsplash.com/photo-1508004680771-708b02aabdc0?w=400&q=80",
    count: 67,
  },
  {
    id: "crafts",
    name: "Handmade Crafts",
    slug: "handmade-crafts",
    icon: "Scissors",
    image:
      "https://images.unsplash.com/photo-1620619767323-b95a89183081?w=400&q=80",
    count: 45,
  },
  {
    id: "cakes",
    name: "Cakes & Bakery",
    slug: "cakes-bakery",
    icon: "Cake",
    image:
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&q=80",
    count: 73,
  },
  {
    id: "toys",
    name: "Soft Toys & Dolls",
    slug: "soft-toys",
    icon: "ToyBrick",
    image:
      "https://images.unsplash.com/photo-1602734846297-9299fc2d4703?w=400&q=80",
    count: 58,
  },
  {
    id: "hampers",
    name: "Gift Baskets & Hampers",
    slug: "gift-hampers",
    icon: "ShoppingBasket",
    image:
      "https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?w=400&q=80",
    count: 41,
  },
  {
    id: "personalized",
    name: "Personalized Gifts",
    slug: "personalized-gifts",
    icon: "Sparkles",
    image:
      "https://images.unsplash.com/photo-1616241673111-508b4662c707?w=400&q=80",
    count: 109,
  },
  {
    id: "candles",
    name: "Candles & Home Decor",
    slug: "candles-decor",
    icon: "Flame",
    image:
      "https://images.unsplash.com/photo-1613068431228-8cb6a1e92573?w=400&q=80",
    count: 52,
  },
];

// Generate UUID Maps for relational integrity
const sellerIdMap = {
  s1: crypto.randomUUID(),
  s2: crypto.randomUUID(),
  s3: crypto.randomUUID(),
  s4: crypto.randomUUID(),
  s5: crypto.randomUUID(),
  s6: crypto.randomUUID(),
};

const sellers = [
  {
    id: "s1",
    shop_name: "Petal Paradise",
    shop_logo:
      "https://images.unsplash.com/photo-1559779080-6970e0186790?w=200&q=80",
    rating: 4.9,
    category: "flowers",
    verified: true,
  },
  {
    id: "s2",
    shop_name: "Cocoa Dreams",
    shop_logo:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&q=80",
    rating: 4.8,
    category: "chocolate",
    verified: true,
  },
  {
    id: "s3",
    shop_name: "Glitter & Gold",
    shop_logo:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=200&q=80",
    rating: 4.7,
    category: "jewelry",
    verified: true,
  },
  {
    id: "s4",
    shop_name: "Memory Lane Crafts",
    shop_logo:
      "https://images.unsplash.com/photo-1620619767323-b95a89183081?w=200&q=80",
    rating: 4.9,
    category: "personalized",
    verified: true,
  },
  {
    id: "s5",
    shop_name: "Sweet Slice Bakery",
    shop_logo:
      "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=200&q=80",
    rating: 4.6,
    category: "cakes",
    verified: true,
  },
  {
    id: "s6",
    shop_name: "Cuddle Corner",
    shop_logo:
      "https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=200&q=80",
    rating: 4.8,
    category: "toys",
    verified: true,
  },
];

const productIdMap = {};
for (let i = 1; i <= 20; i++) {
  productIdMap[`p${i}`] = crypto.randomUUID();
}

const rawProducts = [
  {
    id: "p1",
    slug: "romantic-red-roses-bouquet",
    name: "Romantic Red Roses Bouquet (24 stems)",
    sellerId: "s1",
    price: 2499,
    discountPrice: 1799,
    discountPercent: 28,
    category: "flowers",
    occasion: ["Anniversary", "Valentine", "Birthday"],
    giftFor: ["Her"],
    rating: 4.9,
    numReviews: 248,
    stock: 24,
    sold: 1240,
    isFeatured: true,
    isCustomizable: true,
    deliveryTime: "1-2 days",
    thumbnail:
      "https://images.unsplash.com/photo-1559779080-6970e0186790?w=600&q=80",
    shortDescription: "Premium fresh red roses, hand-tied with elegant ribbon.",
  },
  {
    id: "p2",
    slug: "mixed-flower-bouquet-pastel",
    name: "Mixed Pastel Flower Bouquet Delight",
    sellerId: "s1",
    price: 1899,
    discountPrice: 1399,
    discountPercent: 26,
    category: "flowers",
    occasion: ["Birthday", "Anniversary"],
    giftFor: ["Her", "Parents"],
    rating: 4.7,
    numReviews: 128,
    stock: 18,
    sold: 642,
    isFeatured: true,
    isCustomizable: true,
    deliveryTime: "1-2 days",
    thumbnail:
      "https://images.unsplash.com/photo-1523693916903-027d144a2b7d?w=600&q=80",
    shortDescription: "A delightful mix of seasonal pastel flowers.",
  },
  {
    id: "p3",
    slug: "assorted-chocolate-box-premium",
    name: "Premium Assorted Chocolate Gift Box",
    sellerId: "s2",
    price: 1599,
    discountPrice: 1199,
    discountPercent: 25,
    category: "chocolate",
    occasion: ["Birthday", "Eid", "Anniversary"],
    giftFor: ["Him", "Her", "Parents"],
    rating: 4.8,
    numReviews: 312,
    stock: 56,
    sold: 1820,
    isFeatured: true,
    isCustomizable: false,
    deliveryTime: "2-3 days",
    thumbnail:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80",
    shortDescription: "24 pieces of handcrafted Belgian chocolate assortment.",
  },
  {
    id: "p4",
    slug: "dairy-milk-festive-gift",
    name: "Dairy Milk Festive Gift Tower",
    sellerId: "s2",
    price: 1299,
    discountPrice: 999,
    discountPercent: 23,
    category: "chocolate",
    occasion: ["Eid", "Birthday"],
    giftFor: ["Kids", "Him", "Her"],
    rating: 4.6,
    numReviews: 186,
    stock: 88,
    sold: 980,
    isCustomizable: false,
    deliveryTime: "2-3 days",
    thumbnail:
      "https://images.unsplash.com/photo-1623660053975-cf75a8be0908?w=600&q=80",
    shortDescription: "Festive tower of premium Dairy Milk chocolates.",
  },
  {
    id: "p5",
    slug: "rose-gold-necklace",
    name: "Rose Gold Plated Pendant Necklace",
    sellerId: "s3",
    price: 3499,
    discountPrice: 2299,
    discountPercent: 34,
    category: "jewelry",
    occasion: ["Anniversary", "Wedding", "Birthday"],
    giftFor: ["Her"],
    rating: 4.9,
    numReviews: 421,
    stock: 12,
    sold: 760,
    isFeatured: true,
    isCustomizable: false,
    deliveryTime: "3-4 days",
    thumbnail:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80",
    shortDescription: "Elegant rose gold pendant necklace, gift box included.",
  },
  {
    id: "p6",
    slug: "silver-charm-bracelet",
    name: "Sterling Silver Charm Bracelet",
    sellerId: "s3",
    price: 2899,
    discountPrice: 1999,
    discountPercent: 31,
    category: "jewelry",
    occasion: ["Birthday", "Anniversary"],
    giftFor: ["Her"],
    rating: 4.7,
    numReviews: 198,
    stock: 18,
    sold: 540,
    isCustomizable: true,
    deliveryTime: "3-4 days",
    thumbnail:
      "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=600&q=80",
    shortDescription: "Beautiful sterling silver charm bracelet, customizable.",
  },
  {
    id: "p7",
    slug: "diamond-stud-earrings",
    name: "Sparkling Diamond-Cut Stud Earrings",
    sellerId: "s3",
    price: 4299,
    discountPrice: 2999,
    discountPercent: 30,
    category: "jewelry",
    occasion: ["Wedding", "Anniversary"],
    giftFor: ["Her"],
    rating: 4.8,
    numReviews: 167,
    stock: 22,
    sold: 410,
    isCustomizable: false,
    deliveryTime: "3-4 days",
    thumbnail:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80",
    shortDescription: "Brilliant cut stud earrings in premium gift packaging.",
  },
  {
    id: "p8",
    slug: "personalized-photo-frame",
    name: "Personalized Wooden Photo Frame",
    sellerId: "s4",
    price: 999,
    discountPrice: 699,
    discountPercent: 30,
    category: "photo",
    occasion: ["Anniversary", "Wedding", "Birthday"],
    giftFor: ["Her", "Him", "Parents"],
    rating: 4.9,
    numReviews: 289,
    stock: 45,
    sold: 1100,
    isFeatured: true,
    isCustomizable: true,
    deliveryTime: "4-5 days",
    thumbnail:
      "https://images.unsplash.com/photo-1582053628662-c65b0e0544e9?w=600&q=80",
    shortDescription:
      "Customizable wooden frame with your favorite photo & message.",
  },
  {
    id: "p9",
    slug: "handmade-greeting-card",
    name: "Handcrafted Greeting Card Set (5pcs)",
    sellerId: "s4",
    price: 599,
    discountPrice: 399,
    discountPercent: 33,
    category: "crafts",
    occasion: ["Birthday", "Anniversary"],
    giftFor: ["Her", "Him"],
    rating: 4.6,
    numReviews: 92,
    stock: 67,
    sold: 320,
    isCustomizable: true,
    deliveryTime: "2-3 days",
    thumbnail:
      "https://images.unsplash.com/photo-1680183718072-e9b55b649698?w=600&q=80",
    shortDescription: "Set of 5 beautifully handcrafted greeting cards.",
  },
  {
    id: "p10",
    slug: "scented-candle-luxury-set",
    name: "Luxury Scented Candle Gift Set",
    sellerId: "s6",
    price: 1799,
    discountPrice: 1299,
    discountPercent: 28,
    category: "candles",
    occasion: ["Anniversary", "Birthday"],
    giftFor: ["Her", "Parents"],
    rating: 4.7,
    numReviews: 156,
    stock: 34,
    sold: 480,
    isCustomizable: false,
    deliveryTime: "2-3 days",
    thumbnail:
      "https://images.unsplash.com/photo-1528351655744-27cc30462816?w=600&q=80",
    shortDescription: "Set of 3 luxury scented candles in elegant packaging.",
  },
  {
    id: "p11",
    slug: "chocolate-birthday-cake",
    name: "Chocolate Truffle Birthday Cake (1kg)",
    sellerId: "s5",
    price: 1299,
    discountPrice: 999,
    discountPercent: 23,
    category: "cakes",
    occasion: ["Birthday"],
    giftFor: ["Him", "Her", "Kids", "Parents"],
    rating: 4.8,
    numReviews: 234,
    stock: 15,
    sold: 890,
    isFeatured: true,
    isCustomizable: true,
    deliveryTime: "Same day",
    thumbnail:
      "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80",
    shortDescription:
      "Rich chocolate truffle cake, customize with name & message.",
  },
  {
    id: "p12",
    slug: "red-velvet-cake",
    name: "Classic Red Velvet Cake (1kg)",
    sellerId: "s5",
    price: 1399,
    discountPrice: 1099,
    discountPercent: 21,
    category: "cakes",
    occasion: ["Anniversary", "Birthday"],
    giftFor: ["Her", "Him"],
    rating: 4.7,
    numReviews: 178,
    stock: 12,
    sold: 540,
    isCustomizable: true,
    deliveryTime: "Same day",
    thumbnail:
      "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80",
    shortDescription: "Moist red velvet cake with cream cheese frosting.",
  },
  {
    id: "p13",
    slug: "cupcake-box-assorted",
    name: "Assorted Cupcake Gift Box (12 pcs)",
    sellerId: "s5",
    price: 999,
    discountPrice: 799,
    discountPercent: 20,
    category: "cakes",
    occasion: ["Birthday"],
    giftFor: ["Kids", "Her"],
    rating: 4.6,
    numReviews: 134,
    stock: 26,
    sold: 420,
    isCustomizable: false,
    deliveryTime: "Same day",
    thumbnail:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80",
    shortDescription: "12 assorted gourmet cupcakes in gift packaging.",
  },
  {
    id: "p14",
    slug: "teddy-bear-large",
    name: "Giant Cuddly Teddy Bear (3ft)",
    sellerId: "s6",
    price: 2499,
    discountPrice: 1799,
    discountPercent: 28,
    category: "toys",
    occasion: ["Birthday", "Valentine", "Anniversary"],
    giftFor: ["Her", "Kids"],
    rating: 4.9,
    numReviews: 312,
    stock: 18,
    sold: 720,
    isFeatured: true,
    isCustomizable: false,
    deliveryTime: "2-3 days",
    thumbnail:
      "https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=600&q=80",
    shortDescription: "3ft tall ultra-soft teddy bear with red ribbon.",
  },
  {
    id: "p15",
    slug: "plush-bunny-rabbit",
    name: "Adorable Plush Bunny Rabbit Toy",
    sellerId: "s6",
    price: 1199,
    discountPrice: 899,
    discountPercent: 25,
    category: "toys",
    occasion: ["Birthday", "Easter"],
    giftFor: ["Kids", "Her"],
    rating: 4.7,
    numReviews: 142,
    stock: 36,
    sold: 380,
    isCustomizable: false,
    deliveryTime: "2-3 days",
    thumbnail:
      "https://images.unsplash.com/photo-1615486363973-f79d875780cf?w=600&q=80",
    shortDescription: "Soft plush bunny rabbit, perfect for kids and adults.",
  },
  {
    id: "p16",
    slug: "luxury-gift-hamper",
    name: "Luxury Festive Gift Hamper",
    sellerId: "s4",
    price: 3999,
    discountPrice: 2899,
    discountPercent: 28,
    category: "hampers",
    occasion: ["Eid", "Anniversary", "Wedding"],
    giftFor: ["Parents", "Him", "Her"],
    rating: 4.8,
    numReviews: 178,
    stock: 14,
    sold: 290,
    isFeatured: true,
    isCustomizable: true,
    deliveryTime: "3-4 days",
    thumbnail:
      "https://images.unsplash.com/photo-1664849271854-26ed0d81d813?w=600&q=80",
    shortDescription: "Premium hamper with chocolates, dry fruits, and more.",
  },
  {
    id: "p17",
    slug: "spa-gift-basket",
    name: "Relaxing Spa Day Gift Basket",
    sellerId: "s4",
    price: 2299,
    discountPrice: 1699,
    discountPercent: 26,
    category: "hampers",
    occasion: ["Birthday", "Anniversary"],
    giftFor: ["Her", "Parents"],
    rating: 4.6,
    numReviews: 98,
    stock: 22,
    sold: 210,
    isCustomizable: false,
    deliveryTime: "3-4 days",
    thumbnail:
      "https://images.unsplash.com/photo-1577403349502-058e4a149b3f?w=600&q=80",
    shortDescription: "Indulgent spa basket with bath bombs, candles & oils.",
  },
  {
    id: "p18",
    slug: "personalized-name-mug",
    name: "Personalized Name & Photo Mug",
    sellerId: "s4",
    price: 599,
    discountPrice: 399,
    discountPercent: 33,
    category: "personalized",
    occasion: ["Birthday", "Anniversary"],
    giftFor: ["Him", "Her", "Parents"],
    rating: 4.7,
    numReviews: 256,
    stock: 78,
    sold: 1340,
    isFeatured: true,
    isCustomizable: true,
    deliveryTime: "3-4 days",
    thumbnail:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
    shortDescription: "Custom ceramic mug with your photo & name printed.",
  },
  {
    id: "p19",
    slug: "custom-t-shirt",
    name: "Custom Printed Cotton T-Shirt",
    sellerId: "s4",
    price: 899,
    discountPrice: 699,
    discountPercent: 22,
    category: "personalized",
    occasion: ["Birthday", "Anniversary"],
    giftFor: ["Him", "Her"],
    rating: 4.5,
    numReviews: 89,
    stock: 124,
    sold: 680,
    isCustomizable: true,
    deliveryTime: "4-5 days",
    thumbnail:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
    shortDescription: "Premium cotton t-shirt with your custom design.",
  },
  {
    id: "p20",
    slug: "anniversary-couple-set",
    name: "Anniversary Couple Gift Set",
    sellerId: "s4",
    price: 2799,
    discountPrice: 1999,
    discountPercent: 29,
    category: "personalized",
    occasion: ["Anniversary", "Wedding"],
    giftFor: ["Her", "Him"],
    rating: 4.8,
    numReviews: 167,
    stock: 19,
    sold: 320,
    isFeatured: true,
    isCustomizable: true,
    deliveryTime: "4-5 days",
    thumbnail:
      "https://images.unsplash.com/photo-1664849173063-8d8244ac3933?w=600&q=80",
    shortDescription: "Curated couple gift set for special anniversaries.",
  },
];

const mockOrders = [
  {
    id: "o1",
    orderNumber: "PRZ-2024-00123",
    date: "2024-12-15",
    items: [
      { productId: "p1", sellerId: "s1", quantity: 1, price: 1799 },
      { productId: "p3", sellerId: "s2", quantity: 2, price: 1199 },
    ],
    subtotal: 4197,
    shippingFee: 60,
    discount: 0,
    totalAmount: 4257,
    paymentMethod: "bkash",
    paymentStatus: "paid",
    orderStatus: "delivered",
  },
  {
    id: "o2",
    orderNumber: "PRZ-2024-00124",
    date: "2024-12-20",
    items: [{ productId: "p5", sellerId: "s3", quantity: 1, price: 2299 }],
    subtotal: 2299,
    shippingFee: 60,
    discount: 200,
    totalAmount: 2159,
    paymentMethod: "sslcommerz",
    paymentStatus: "paid",
    orderStatus: "shipped",
  },
  {
    id: "o3",
    orderNumber: "PRZ-2024-00125",
    date: "2024-12-22",
    items: [
      { productId: "p11", sellerId: "s5", quantity: 1, price: 999 },
      { productId: "p14", sellerId: "s6", quantity: 1, price: 1799 },
    ],
    subtotal: 2798,
    shippingFee: 60,
    discount: 0,
    totalAmount: 2858,
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "placed",
  },
];

const orderIdMap = {
  o1: crypto.randomUUID(),
  o2: crypto.randomUUID(),
  o3: crypto.randomUUID(),
};

// --- 2. FORMAT DATA FOR SUPABASE ---
const dbSellers = sellers.map((s) => ({
  id: sellerIdMap[s.id],
  shop_name: s.shop_name,
  shop_logo: s.shop_logo,
  rating: s.rating,
  category: s.category,
  verified: s.verified,
}));

const dbProducts = rawProducts.map((p) => ({
  id: productIdMap[p.id],
  slug: p.slug,
  name: p.name,
  seller_id: sellerIdMap[p.sellerId],
  price: p.price,
  discount_price: p.discountPrice,
  discount_percent: p.discountPercent,
  category: p.category,
  occasion: p.occasion,
  gift_for: p.giftFor,
  rating: p.rating,
  num_reviews: p.numReviews,
  stock: p.stock,
  sold: p.sold,
  is_featured: p.isFeatured || false,
  is_customizable: p.isCustomizable,
  delivery_time: p.deliveryTime,
  short_description: p.shortDescription,
  thumbnail: p.thumbnail,
  images: [p.thumbnail], // Using thumbnail for simplicity
}));

const dbOrders = mockOrders.map((o) => ({
  id: orderIdMap[o.id],
  order_number: o.orderNumber,
  user_id: null, // Allow unauthenticated orders for now
  total_amount: o.totalAmount,
  status: o.orderStatus,
  shipping_address: "House 42, Road 11, Banani, Dhaka, Dhaka - 1213",
  phone_number: "+880 1700-000000",
  created_at: new Date(o.date).toISOString(),
}));

const dbOrderItems = [];
mockOrders.forEach((o) => {
  o.items.forEach((item) => {
    dbOrderItems.push({
      order_id: orderIdMap[o.id],
      product_id: productIdMap[item.productId],
      seller_id: sellerIdMap[item.sellerId],
      quantity: item.quantity,
      price_at_time: item.price,
    });
  });
});

// --- 3. MIGRATION EXECUTION ---
async function runMassSeed() {
  console.log("🔥 Erasing old data to prevent duplicates...");
  // Clear out old data so we don't hit Unique Slug constraints
  await supabase
    .from("order_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("orders")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("products")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("sellers")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("categories").delete().neq("id", "fake-id");

  console.log("📦 Seeding 10 Categories...");
  const { error: catErr } = await supabase
    .from("categories")
    .upsert(categories);
  if (catErr) return console.error("❌ Categories Error:", catErr.message);

  console.log("🏪 Seeding 6 Sellers...");
  const { error: selErr } = await supabase.from("sellers").upsert(dbSellers);
  if (selErr) return console.error("❌ Sellers Error:", selErr.message);

  console.log("🎁 Seeding 20 Products...");
  const { error: prodErr } = await supabase.from("products").upsert(dbProducts);
  if (prodErr) return console.error("❌ Products Error:", prodErr.message);

  console.log("🛒 Seeding 3 Orders...");
  const { error: ordErr } = await supabase.from("orders").upsert(dbOrders);
  if (ordErr) return console.error("❌ Orders Error:", ordErr.message);

  console.log("🧾 Seeding Order Items...");
  const { error: itemErr } = await supabase
    .from("order_items")
    .upsert(dbOrderItems);
  if (itemErr) return console.error("❌ Order Items Error:", itemErr.message);

  console.log(
    "🎉 MASS MIGRATION COMPLETE! ALL 20 PRODUCTS ARE NOW IN SUPABASE!",
  );
}

runMassSeed();
