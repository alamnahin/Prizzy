// Mock data for Prizzy e-commerce platform

export const LOGO_URL = 'https://customer-assets.emergentagent.com/job_d5d8da0f-075b-46d5-becb-685b2238c006/artifacts/7ozor44k_image.png';

export const categories = [
  { id: 'flowers', name: 'Flowers & Bouquets', slug: 'flowers-bouquets', icon: 'Flower2', image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=400&q=80', count: 124 },
  { id: 'chocolate', name: 'Chocolate & Sweets', slug: 'chocolate-sweets', icon: 'Candy', image: 'https://images.unsplash.com/photo-1599599811214-3d44be99547f?w=400&q=80', count: 86 },
  { id: 'jewelry', name: 'Jewelry & Accessories', slug: 'jewelry-accessories', icon: 'Gem', image: 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=400&q=80', count: 192 },
  { id: 'photo', name: 'Photo Gifts & Frames', slug: 'photo-frames', icon: 'Image', image: 'https://images.unsplash.com/photo-1508004680771-708b02aabdc0?w=400&q=80', count: 67 },
  { id: 'crafts', name: 'Handmade Crafts', slug: 'handmade-crafts', icon: 'Scissors', image: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=400&q=80', count: 45 },
  { id: 'cakes', name: 'Cakes & Bakery', slug: 'cakes-bakery', icon: 'Cake', image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&q=80', count: 73 },
  { id: 'toys', name: 'Soft Toys & Dolls', slug: 'soft-toys', icon: 'ToyBrick', image: 'https://images.unsplash.com/photo-1602734846297-9299fc2d4703?w=400&q=80', count: 58 },
  { id: 'hampers', name: 'Gift Baskets & Hampers', slug: 'gift-hampers', icon: 'ShoppingBasket', image: 'https://images.unsplash.com/photo-1508899203029-1c9eb493c9bd?w=400&q=80', count: 41 },
  { id: 'personalized', name: 'Personalized Gifts', slug: 'personalized-gifts', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1616241673111-508b4662c707?w=400&q=80', count: 109 },
  { id: 'candles', name: 'Candles & Home Decor', slug: 'candles-decor', icon: 'Flame', image: 'https://images.unsplash.com/photo-1613068431228-8cb6a1e92573?w=400&q=80', count: 52 },
];

export const heroBanners = [
  {
    id: 1,
    title: 'Gifts for Every Moment',
    subtitle: 'Discover thoughtful gifts for everyone you love',
    cta: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&q=80',
    badge: 'New Collection',
    link: '/products',
  },
  {
    id: 2,
    title: 'Mega Eid Sale',
    subtitle: 'Up to 50% off on Eid special gift hampers',
    cta: 'Explore Deals',
    image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1600&q=80',
    badge: 'Limited Time',
    link: '/products?occasion=Eid',
  },
  {
    id: 3,
    title: 'Wedding Season Specials',
    subtitle: 'Premium gift sets, curated for unforgettable moments',
    cta: 'View Collection',
    image: 'https://images.unsplash.com/photo-1544639044-4f142ceb6a2b?w=1600&q=80',
    badge: 'Featured',
    link: '/products?occasion=Wedding',
  },
  {
    id: 4,
    title: 'Birthday Surprises',
    subtitle: 'Make their day unforgettable with our birthday picks',
    cta: 'Shop Birthday',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1600&q=80',
    badge: 'Trending',
    link: '/products?occasion=Birthday',
  },
];

export const occasions = [
  { id: 'birthday', name: 'Birthday', emoji: 'Cake' },
  { id: 'anniversary', name: 'Anniversary', emoji: 'Heart' },
  { id: 'wedding', name: 'Wedding', emoji: 'Sparkles' },
  { id: 'eid', name: 'Eid', emoji: 'Moon' },
  { id: 'valentine', name: 'Valentine', emoji: 'HeartHandshake' },
  { id: 'newyear', name: 'New Year', emoji: 'PartyPopper' },
  { id: 'pohelaboishakh', name: 'Pohela Boishakh', emoji: 'Sun' },
  { id: 'newborn', name: 'New Born', emoji: 'Baby' },
];

export const sellers = [
  { id: 's1', shopName: 'Petal Paradise', shopLogo: 'https://images.unsplash.com/photo-1559779080-6970e0186790?w=200&q=80', rating: 4.9, products: 142, sales: 3240, category: 'Flowers', verified: true },
  { id: 's2', shopName: 'Cocoa Dreams', shopLogo: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&q=80', rating: 4.8, products: 86, sales: 2150, category: 'Chocolate', verified: true },
  { id: 's3', shopName: 'Glitter & Gold', shopLogo: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=200&q=80', rating: 4.7, products: 192, sales: 4680, category: 'Jewelry', verified: true },
  { id: 's4', shopName: 'Memory Lane Crafts', shopLogo: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=200&q=80', rating: 4.9, products: 67, sales: 1820, category: 'Personalized', verified: true },
  { id: 's5', shopName: 'Sweet Slice Bakery', shopLogo: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=200&q=80', rating: 4.6, products: 54, sales: 1340, category: 'Cakes', verified: true },
  { id: 's6', shopName: 'Cuddle Corner', shopLogo: 'https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=200&q=80', rating: 4.8, products: 78, sales: 2080, category: 'Toys', verified: true },
];

export const products = [
  {
    id: 'p1', slug: 'romantic-red-roses-bouquet',
    name: 'Romantic Red Roses Bouquet (24 stems)',
    seller: sellers[0],
    price: 2499, discountPrice: 1799, discountPercent: 28,
    images: ['https://images.unsplash.com/photo-1559779080-6970e0186790?w=600&q=80', 'https://images.unsplash.com/photo-1523693916903-027d144a2b7d?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1559779080-6970e0186790?w=600&q=80',
    category: 'flowers', occasion: ['Anniversary', 'Valentine', 'Birthday'], giftFor: ['Her'],
    rating: 4.9, numReviews: 248, stock: 24, sold: 1240, isFeatured: true,
    isCustomizable: true, deliveryTime: '1-2 days',
    shortDescription: 'Premium fresh red roses, hand-tied with elegant ribbon.',
  },
  {
    id: 'p2', slug: 'mixed-flower-bouquet-pastel',
    name: 'Mixed Pastel Flower Bouquet Delight',
    seller: sellers[0],
    price: 1899, discountPrice: 1399, discountPercent: 26,
    images: ['https://images.unsplash.com/photo-1523693916903-027d144a2b7d?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1523693916903-027d144a2b7d?w=600&q=80',
    category: 'flowers', occasion: ['Birthday', 'Anniversary'], giftFor: ['Her', 'Parents'],
    rating: 4.7, numReviews: 128, stock: 18, sold: 642, isFeatured: true,
    isCustomizable: true, deliveryTime: '1-2 days',
    shortDescription: 'A delightful mix of seasonal pastel flowers.',
  },
  {
    id: 'p3', slug: 'assorted-chocolate-box-premium',
    name: 'Premium Assorted Chocolate Gift Box',
    seller: sellers[1],
    price: 1599, discountPrice: 1199, discountPercent: 25,
    images: ['https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80',
    category: 'chocolate', occasion: ['Birthday', 'Eid', 'Anniversary'], giftFor: ['Him', 'Her', 'Parents'],
    rating: 4.8, numReviews: 312, stock: 56, sold: 1820, isFeatured: true,
    isCustomizable: false, deliveryTime: '2-3 days',
    shortDescription: '24 pieces of handcrafted Belgian chocolate assortment.',
  },
  {
    id: 'p4', slug: 'dairy-milk-festive-gift',
    name: 'Dairy Milk Festive Gift Tower',
    seller: sellers[1],
    price: 1299, discountPrice: 999, discountPercent: 23,
    images: ['https://images.unsplash.com/photo-1623660053975-cf75a8be0908?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1623660053975-cf75a8be0908?w=600&q=80',
    category: 'chocolate', occasion: ['Eid', 'Birthday'], giftFor: ['Kids', 'Him', 'Her'],
    rating: 4.6, numReviews: 186, stock: 88, sold: 980,
    isCustomizable: false, deliveryTime: '2-3 days',
    shortDescription: 'Festive tower of premium Dairy Milk chocolates.',
  },
  {
    id: 'p5', slug: 'rose-gold-necklace',
    name: 'Rose Gold Plated Pendant Necklace',
    seller: sellers[2],
    price: 3499, discountPrice: 2299, discountPercent: 34,
    images: ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80',
    category: 'jewelry', occasion: ['Anniversary', 'Wedding', 'Birthday'], giftFor: ['Her'],
    rating: 4.9, numReviews: 421, stock: 12, sold: 760, isFeatured: true,
    isCustomizable: false, deliveryTime: '3-4 days',
    shortDescription: 'Elegant rose gold pendant necklace, gift box included.',
  },
  {
    id: 'p6', slug: 'silver-charm-bracelet',
    name: 'Sterling Silver Charm Bracelet',
    seller: sellers[2],
    price: 2899, discountPrice: 1999, discountPercent: 31,
    images: ['https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=600&q=80',
    category: 'jewelry', occasion: ['Birthday', 'Anniversary'], giftFor: ['Her'],
    rating: 4.7, numReviews: 198, stock: 18, sold: 540,
    isCustomizable: true, deliveryTime: '3-4 days',
    shortDescription: 'Beautiful sterling silver charm bracelet, customizable.',
  },
  {
    id: 'p7', slug: 'diamond-stud-earrings',
    name: 'Sparkling Diamond-Cut Stud Earrings',
    seller: sellers[2],
    price: 4299, discountPrice: 2999, discountPercent: 30,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    category: 'jewelry', occasion: ['Wedding', 'Anniversary'], giftFor: ['Her'],
    rating: 4.8, numReviews: 167, stock: 22, sold: 410,
    isCustomizable: false, deliveryTime: '3-4 days',
    shortDescription: 'Brilliant cut stud earrings in premium gift packaging.',
  },
  {
    id: 'p8', slug: 'personalized-photo-frame',
    name: 'Personalized Wooden Photo Frame',
    seller: sellers[3],
    price: 999, discountPrice: 699, discountPercent: 30,
    images: ['https://images.unsplash.com/photo-1582053628662-c65b0e0544e9?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1582053628662-c65b0e0544e9?w=600&q=80',
    category: 'photo', occasion: ['Anniversary', 'Wedding', 'Birthday'], giftFor: ['Her', 'Him', 'Parents'],
    rating: 4.9, numReviews: 289, stock: 45, sold: 1100, isFeatured: true,
    isCustomizable: true, deliveryTime: '4-5 days',
    shortDescription: 'Customizable wooden frame with your favorite photo & message.',
  },
  {
    id: 'p9', slug: 'handmade-greeting-card',
    name: 'Handcrafted Greeting Card Set (5pcs)',
    seller: sellers[3],
    price: 599, discountPrice: 399, discountPercent: 33,
    images: ['https://images.unsplash.com/photo-1680183718072-e9b55b649698?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1680183718072-e9b55b649698?w=600&q=80',
    category: 'crafts', occasion: ['Birthday', 'Anniversary'], giftFor: ['Her', 'Him'],
    rating: 4.6, numReviews: 92, stock: 67, sold: 320,
    isCustomizable: true, deliveryTime: '2-3 days',
    shortDescription: 'Set of 5 beautifully handcrafted greeting cards.',
  },
  {
    id: 'p10', slug: 'scented-candle-luxury-set',
    name: 'Luxury Scented Candle Gift Set',
    seller: sellers[5],
    price: 1799, discountPrice: 1299, discountPercent: 28,
    images: ['https://images.unsplash.com/photo-1528351655744-27cc30462816?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1528351655744-27cc30462816?w=600&q=80',
    category: 'candles', occasion: ['Anniversary', 'Birthday'], giftFor: ['Her', 'Parents'],
    rating: 4.7, numReviews: 156, stock: 34, sold: 480,
    isCustomizable: false, deliveryTime: '2-3 days',
    shortDescription: 'Set of 3 luxury scented candles in elegant packaging.',
  },
  {
    id: 'p11', slug: 'chocolate-birthday-cake',
    name: 'Chocolate Truffle Birthday Cake (1kg)',
    seller: sellers[4],
    price: 1299, discountPrice: 999, discountPercent: 23,
    images: ['https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80',
    category: 'cakes', occasion: ['Birthday'], giftFor: ['Him', 'Her', 'Kids', 'Parents'],
    rating: 4.8, numReviews: 234, stock: 15, sold: 890, isFeatured: true,
    isCustomizable: true, deliveryTime: 'Same day',
    shortDescription: 'Rich chocolate truffle cake, customize with name & message.',
  },
  {
    id: 'p12', slug: 'red-velvet-cake',
    name: 'Classic Red Velvet Cake (1kg)',
    seller: sellers[4],
    price: 1399, discountPrice: 1099, discountPercent: 21,
    images: ['https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80',
    category: 'cakes', occasion: ['Anniversary', 'Birthday'], giftFor: ['Her', 'Him'],
    rating: 4.7, numReviews: 178, stock: 12, sold: 540,
    isCustomizable: true, deliveryTime: 'Same day',
    shortDescription: 'Moist red velvet cake with cream cheese frosting.',
  },
  {
    id: 'p13', slug: 'cupcake-box-assorted',
    name: 'Assorted Cupcake Gift Box (12 pcs)',
    seller: sellers[4],
    price: 999, discountPrice: 799, discountPercent: 20,
    images: ['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80',
    category: 'cakes', occasion: ['Birthday'], giftFor: ['Kids', 'Her'],
    rating: 4.6, numReviews: 134, stock: 26, sold: 420,
    isCustomizable: false, deliveryTime: 'Same day',
    shortDescription: '12 assorted gourmet cupcakes in gift packaging.',
  },
  {
    id: 'p14', slug: 'teddy-bear-large',
    name: 'Giant Cuddly Teddy Bear (3ft)',
    seller: sellers[5],
    price: 2499, discountPrice: 1799, discountPercent: 28,
    images: ['https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=600&q=80',
    category: 'toys', occasion: ['Birthday', 'Valentine', 'Anniversary'], giftFor: ['Her', 'Kids'],
    rating: 4.9, numReviews: 312, stock: 18, sold: 720, isFeatured: true,
    isCustomizable: false, deliveryTime: '2-3 days',
    shortDescription: '3ft tall ultra-soft teddy bear with red ribbon.',
  },
  {
    id: 'p15', slug: 'plush-bunny-rabbit',
    name: 'Adorable Plush Bunny Rabbit Toy',
    seller: sellers[5],
    price: 1199, discountPrice: 899, discountPercent: 25,
    images: ['https://images.unsplash.com/photo-1615486363973-f79d875780cf?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1615486363973-f79d875780cf?w=600&q=80',
    category: 'toys', occasion: ['Birthday', 'Easter'], giftFor: ['Kids', 'Her'],
    rating: 4.7, numReviews: 142, stock: 36, sold: 380,
    isCustomizable: false, deliveryTime: '2-3 days',
    shortDescription: 'Soft plush bunny rabbit, perfect for kids and adults.',
  },
  {
    id: 'p16', slug: 'luxury-gift-hamper',
    name: 'Luxury Festive Gift Hamper',
    seller: sellers[3],
    price: 3999, discountPrice: 2899, discountPercent: 28,
    images: ['https://images.unsplash.com/photo-1664849271854-26ed0d81d813?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1664849271854-26ed0d81d813?w=600&q=80',
    category: 'hampers', occasion: ['Eid', 'Anniversary', 'Wedding'], giftFor: ['Parents', 'Him', 'Her'],
    rating: 4.8, numReviews: 178, stock: 14, sold: 290, isFeatured: true,
    isCustomizable: true, deliveryTime: '3-4 days',
    shortDescription: 'Premium hamper with chocolates, dry fruits, and more.',
  },
  {
    id: 'p17', slug: 'spa-gift-basket',
    name: 'Relaxing Spa Day Gift Basket',
    seller: sellers[3],
    price: 2299, discountPrice: 1699, discountPercent: 26,
    images: ['https://images.unsplash.com/photo-1577403349502-058e4a149b3f?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1577403349502-058e4a149b3f?w=600&q=80',
    category: 'hampers', occasion: ['Birthday', 'Anniversary'], giftFor: ['Her', 'Parents'],
    rating: 4.6, numReviews: 98, stock: 22, sold: 210,
    isCustomizable: false, deliveryTime: '3-4 days',
    shortDescription: 'Indulgent spa basket with bath bombs, candles & oils.',
  },
  {
    id: 'p18', slug: 'personalized-name-mug',
    name: 'Personalized Name & Photo Mug',
    seller: sellers[3],
    price: 599, discountPrice: 399, discountPercent: 33,
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
    category: 'personalized', occasion: ['Birthday', 'Anniversary'], giftFor: ['Him', 'Her', 'Parents'],
    rating: 4.7, numReviews: 256, stock: 78, sold: 1340, isFeatured: true,
    isCustomizable: true, deliveryTime: '3-4 days',
    shortDescription: 'Custom ceramic mug with your photo & name printed.',
  },
  {
    id: 'p19', slug: 'custom-t-shirt',
    name: 'Custom Printed Cotton T-Shirt',
    seller: sellers[3],
    price: 899, discountPrice: 699, discountPercent: 22,
    images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80',
    category: 'personalized', occasion: ['Birthday', 'Anniversary'], giftFor: ['Him', 'Her'],
    rating: 4.5, numReviews: 89, stock: 124, sold: 680,
    isCustomizable: true, deliveryTime: '4-5 days',
    shortDescription: 'Premium cotton t-shirt with your custom design.',
  },
  {
    id: 'p20', slug: 'anniversary-couple-set',
    name: 'Anniversary Couple Gift Set',
    seller: sellers[3],
    price: 2799, discountPrice: 1999, discountPercent: 29,
    images: ['https://images.unsplash.com/photo-1664849173063-8d8244ac3933?w=600&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1664849173063-8d8244ac3933?w=600&q=80',
    category: 'personalized', occasion: ['Anniversary', 'Wedding'], giftFor: ['Her', 'Him'],
    rating: 4.8, numReviews: 167, stock: 19, sold: 320, isFeatured: true,
    isCustomizable: true, deliveryTime: '4-5 days',
    shortDescription: 'Curated couple gift set for special anniversaries.',
  },
];

// Helpers
export const getProductBySlug = (slug) => products.find(p => p.slug === slug);
export const getProductsByCategory = (categorySlug) => products.filter(p => p.category === categorySlug);
export const getFeaturedProducts = () => products.filter(p => p.isFeatured);
export const getProductsByOccasion = (occasion) => products.filter(p => p.occasion.includes(occasion));

// Coupons
export const coupons = [
  { code: 'PRIZZY10', discountType: 'percentage', discountValue: 10, minimumOrderAmount: 1000, description: '10% off on orders above ৳1000' },
  { code: 'WELCOME20', discountType: 'percentage', discountValue: 20, minimumOrderAmount: 2000, description: '20% off for first-time customers' },
  { code: 'EID30', discountType: 'percentage', discountValue: 30, minimumOrderAmount: 3000, description: '30% off on Eid special hampers' },
];

// Mock current user (for demo)
export const mockUser = {
  id: 'u1',
  name: 'Demo User',
  email: 'demo@prizzy.com',
  phone: '+880 1700-000000',
  avatar: null,
  role: 'customer',
  addresses: [
    { id: 'a1', label: 'Home', street: 'House 42, Road 11, Banani', city: 'Dhaka', district: 'Dhaka', postalCode: '1213', isDefault: true },
  ],
};

// Mock orders
export const mockOrders = [
  {
    id: 'o1', orderNumber: 'PRZ-2024-00123', date: '2024-12-15',
    items: [
      { product: products[0], quantity: 1, price: 1799 },
      { product: products[2], quantity: 2, price: 1199 },
    ],
    subtotal: 4197, shippingFee: 60, discount: 0, totalAmount: 4257,
    paymentMethod: 'bkash', paymentStatus: 'paid', orderStatus: 'delivered',
  },
  {
    id: 'o2', orderNumber: 'PRZ-2024-00124', date: '2024-12-20',
    items: [
      { product: products[4], quantity: 1, price: 2299 },
    ],
    subtotal: 2299, shippingFee: 60, discount: 200, totalAmount: 2159,
    paymentMethod: 'sslcommerz', paymentStatus: 'paid', orderStatus: 'shipped',
  },
  {
    id: 'o3', orderNumber: 'PRZ-2024-00125', date: '2024-12-22',
    items: [
      { product: products[10], quantity: 1, price: 999 },
      { product: products[13], quantity: 1, price: 1799 },
    ],
    subtotal: 2798, shippingFee: 60, discount: 0, totalAmount: 2858,
    paymentMethod: 'cod', paymentStatus: 'pending', orderStatus: 'placed',
  },
];

// Mock reviews
export const mockReviews = [
  { id: 'r1', productId: 'p1', user: 'Sadia A.', rating: 5, comment: 'Absolutely stunning bouquet! My wife loved it. Fast delivery and fresh roses.', date: '2 days ago', verified: true },
  { id: 'r2', productId: 'p1', user: 'Rifat H.', rating: 5, comment: 'Best gift I have ever sent. Highly recommend Prizzy for special occasions.', date: '5 days ago', verified: true },
  { id: 'r3', productId: 'p1', user: 'Mehnaz K.', rating: 4, comment: 'Beautiful roses, packaging was lovely. Will order again.', date: '1 week ago', verified: true },
];

// Seller dashboard mock
export const sellerStats = {
  totalSales: 142, totalRevenue: 285600, pendingOrders: 8, productsListed: 67,
  monthlyRevenue: [
    { day: '1', revenue: 4200 }, { day: '5', revenue: 6800 }, { day: '10', revenue: 5400 },
    { day: '15', revenue: 8900 }, { day: '20', revenue: 7200 }, { day: '25', revenue: 10400 }, { day: '30', revenue: 9600 },
  ],
  ordersByStatus: [
    { status: 'Placed', count: 8 }, { status: 'Processing', count: 12 },
    { status: 'Shipped', count: 6 }, { status: 'Delivered', count: 116 },
  ],
};

// Admin dashboard mock
export const adminStats = {
  totalRevenue: 2856000, totalOrders: 1420, totalUsers: 3680, totalSellers: 86,
  pendingApprovals: { sellers: 4, products: 18, withdrawals: 6 },
};
