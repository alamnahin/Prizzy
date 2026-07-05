-- ============================================================
-- PRIZZY - Full Seed Data
-- Paste into Supabase SQL Editor and Run.
-- Run AFTER 001_complete_schema.sql
-- ============================================================

-- ─── STEP 1: Create demo auth users ──────────────────────────
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000000','petal@prizzy.com',crypt('Demo1234!',gen_salt('bf')),NOW(),'{"name":"Petal Paradise Owner","role":"seller"}'::jsonb,'authenticated','authenticated',NOW(),NOW(),'','','',''),
  ('22222222-2222-2222-2222-222222222222','00000000-0000-0000-0000-000000000000','cocoa@prizzy.com',crypt('Demo1234!',gen_salt('bf')),NOW(),'{"name":"Cocoa Dreams Owner","role":"seller"}'::jsonb,'authenticated','authenticated',NOW(),NOW(),'','','',''),
  ('33333333-3333-3333-3333-333333333333','00000000-0000-0000-0000-000000000000','glitter@prizzy.com',crypt('Demo1234!',gen_salt('bf')),NOW(),'{"name":"Glitter and Gold Owner","role":"seller"}'::jsonb,'authenticated','authenticated',NOW(),NOW(),'','','',''),
  ('44444444-4444-4444-4444-444444444444','00000000-0000-0000-0000-000000000000','memory@prizzy.com',crypt('Demo1234!',gen_salt('bf')),NOW(),'{"name":"Memory Lane Owner","role":"seller"}'::jsonb,'authenticated','authenticated',NOW(),NOW(),'','','',''),
  ('55555555-5555-5555-5555-555555555555','00000000-0000-0000-0000-000000000000','sweetslice@prizzy.com',crypt('Demo1234!',gen_salt('bf')),NOW(),'{"name":"Sweet Slice Owner","role":"seller"}'::jsonb,'authenticated','authenticated',NOW(),NOW(),'','','',''),
  ('66666666-6666-6666-6666-666666666666','00000000-0000-0000-0000-000000000000','cuddle@prizzy.com',crypt('Demo1234!',gen_salt('bf')),NOW(),'{"name":"Cuddle Corner Owner","role":"seller"}'::jsonb,'authenticated','authenticated',NOW(),NOW(),'','','',''),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-0000-0000-000000000000','admin@prizzy.com',crypt('Demo1234!',gen_salt('bf')),NOW(),'{"name":"Prizzy Admin","role":"admin"}'::jsonb,'authenticated','authenticated',NOW(),NOW(),'','','',''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','00000000-0000-0000-0000-000000000000','demo@prizzy.com',crypt('Demo1234!',gen_salt('bf')),NOW(),'{"name":"Demo User","role":"customer"}'::jsonb,'authenticated','authenticated',NOW(),NOW(),'','','','')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id) VALUES
  ('11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','{"sub":"11111111-1111-1111-1111-111111111111","email":"petal@prizzy.com"}','email',NOW(),NOW(),NOW(),'11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222','{"sub":"22222222-2222-2222-2222-222222222222","email":"cocoa@prizzy.com"}','email',NOW(),NOW(),NOW(),'22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333333','33333333-3333-3333-3333-333333333333','{"sub":"33333333-3333-3333-3333-333333333333","email":"glitter@prizzy.com"}','email',NOW(),NOW(),NOW(),'33333333-3333-3333-3333-333333333333'),
  ('44444444-4444-4444-4444-444444444444','44444444-4444-4444-4444-444444444444','{"sub":"44444444-4444-4444-4444-444444444444","email":"memory@prizzy.com"}','email',NOW(),NOW(),NOW(),'44444444-4444-4444-4444-444444444444'),
  ('55555555-5555-5555-5555-555555555555','55555555-5555-5555-5555-555555555555','{"sub":"55555555-5555-5555-5555-555555555555","email":"sweetslice@prizzy.com"}','email',NOW(),NOW(),NOW(),'55555555-5555-5555-5555-555555555555'),
  ('66666666-6666-6666-6666-666666666666','66666666-6666-6666-6666-666666666666','{"sub":"66666666-6666-6666-6666-666666666666","email":"cuddle@prizzy.com"}','email',NOW(),NOW(),NOW(),'66666666-6666-6666-6666-666666666666'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","email":"admin@prizzy.com"}','email',NOW(),NOW(),NOW(),'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","email":"demo@prizzy.com"}','email',NOW(),NOW(),NOW(),'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 2: Fix profile roles ────────────────────────────────
UPDATE public.profiles SET role = 'seller' WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
UPDATE public.profiles SET role = 'admin' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- ─── STEP 3: Insert sellers (valid UUIDs) ─────────────────────
INSERT INTO public.sellers (id, user_id, shop_name, shop_logo, category, description, phone, bkash_number, rating, total_sales, total_revenue, is_verified, is_approved, status) VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1','11111111-1111-1111-1111-111111111111','Petal Paradise','https://images.unsplash.com/photo-1559779080-6970e0186790?w=200&q=80','Flowers','Premium fresh flowers and bouquets delivered with love across Bangladesh.','+8801700000001','+8801700000001',4.9,3240,8102160,true,true,'active'),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2','22222222-2222-2222-2222-222222222222','Cocoa Dreams','https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&q=80','Chocolates','Handcrafted Belgian chocolates and sweet gift boxes for every occasion.','+8801700000002','+8801700000002',4.8,2150,3225000,true,true,'active'),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3','33333333-3333-3333-3333-333333333333','Glitter & Gold','https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=200&q=80','Jewelry','Elegant jewelry and accessories for life''s most precious moments.','+8801700000003','+8801700000003',4.7,4680,14040000,true,true,'active'),
  ('a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4','44444444-4444-4444-4444-444444444444','Memory Lane Crafts','https://images.unsplash.com/photo-1620619767323-b95a89183081?w=200&q=80','Gifts','Personalized gifts and handmade crafts that tell your unique story.','+8801700000004','+8801700000004',4.9,1820,3640000,true,true,'active'),
  ('a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5','55555555-5555-5555-5555-555555555555','Sweet Slice Bakery','https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=200&q=80','Cakes','Freshly baked custom cakes and pastries delivered same day in Dhaka.','+8801700000005','+8801700000005',4.6,1340,1474000,true,true,'active'),
  ('a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6','66666666-6666-6666-6666-666666666666','Cuddle Corner','https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=200&q=80','Toys','Adorable plush toys and soft gifts that bring joy to all ages.','+8801700000006','+8801700000006',4.8,2080,4160000,true,true,'active')
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 4: Categories ───────────────────────────────────────
INSERT INTO public.categories (id, name, slug, image, sort_order) VALUES
  ('flowers',     'Flowers & Bouquets',    'flowers',           'https://images.unsplash.com/photo-1487530811015-780fb09f9d07?w=400&q=80', 1),
  ('cakes',       'Cakes & Desserts',      'cakes',             'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', 2),
  ('chocolates',  'Chocolates & Sweets',   'chocolates',        'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80', 3),
  ('accessories', 'Fashion & Accessories', 'accessories',       'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&q=80', 4),
  ('electronics', 'Gadgets & Electronics', 'electronics',       'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', 5),
  ('perfumes',    'Perfumes & Beauty',     'perfumes',          'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80', 6),
  ('hampers',     'Gift Hampers',          'hampers',           'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&q=80', 7),
  ('toys',        'Toys & Games',          'toys',              'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80', 8),
  ('jewelry',     'Jewelry & Watches',     'jewelry',           'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80', 9),
  ('stationery',  'Stationery & Books',    'stationery',        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80', 10),
  ('chocolate',   'Chocolate & Sweets',    'chocolate',         'https://images.unsplash.com/photo-1599599811214-3d44be99547f?w=400&q=80', 11),
  ('photo',       'Photo Gifts & Frames',  'photo-frames',      'https://images.unsplash.com/photo-1508004680771-708b02aabdc0?w=400&q=80', 12),
  ('crafts',      'Handmade Crafts',       'handmade-crafts',   'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=400&q=80', 13),
  ('personalized','Personalized Gifts',    'personalized-gifts','https://images.unsplash.com/photo-1616241673111-508b4662c707?w=400&q=80', 14),
  ('candles',     'Candles & Home Decor',  'candles-decor',     'https://images.unsplash.com/photo-1613068431228-8cb6a1e92573?w=400&q=80', 15)
ON CONFLICT (id) DO NOTHING;

-- ─── STEP 5: Products (all valid UUIDs) ──────────────────────
INSERT INTO public.products (id, seller_id, name, slug, category, thumbnail, images, short_description, description, price, discount_price, discount_percent, stock, sold, rating, num_reviews, occasion, gift_for, delivery_time, is_customizable, is_featured, is_active) VALUES

('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1','a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1','Romantic Red Roses Bouquet (24 stems)','romantic-red-roses-bouquet','flowers','https://images.unsplash.com/photo-1559779080-6970e0186790?w=600&q=80','["https://images.unsplash.com/photo-1559779080-6970e0186790?w=600&q=80","https://images.unsplash.com/photo-1523693916903-027d144a2b7d?w=600&q=80"]','Premium fresh red roses, hand-tied with elegant ribbon.','A breathtaking bouquet of 24 premium red roses, hand-picked fresh daily and tied with an elegant satin ribbon. Perfect for anniversaries, Valentine''s Day, or any moment you want to say I love you.',2499,1799,28,24,1240,4.9,248,'["Anniversary","Valentine","Birthday"]','["Her"]','1-2 days',true,true,true),

('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2','a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1','Mixed Pastel Flower Bouquet Delight','mixed-flower-bouquet-pastel','flowers','https://images.unsplash.com/photo-1523693916903-027d144a2b7d?w=600&q=80','["https://images.unsplash.com/photo-1523693916903-027d144a2b7d?w=600&q=80"]','A delightful mix of seasonal pastel flowers.','Brighten someone''s day with this gorgeous mixed pastel bouquet. Featuring a hand-selected mix of seasonal blooms in soft pastel hues, perfect for birthdays, get-well wishes, or just because.',1899,1399,26,18,642,4.7,128,'["Birthday","Anniversary"]','["Her","Parents"]','1-2 days',true,false,true),

('b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3','a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2','Premium Assorted Chocolate Gift Box','assorted-chocolate-box-premium','chocolate','https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80','["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&q=80"]','24 pieces of handcrafted Belgian chocolate assortment.','Indulge in the finest Belgian chocolate experience with our 24-piece assorted gift box. Includes dark, milk, and white chocolate varieties with exotic fillings — hazelnut, raspberry, caramel, and more.',1599,1199,25,56,1820,4.8,312,'["Birthday","Eid","Anniversary"]','["Him","Her","Parents"]','2-3 days',false,true,true),

('b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4','a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2','Dairy Milk Festive Gift Tower','dairy-milk-festive-gift','chocolate','https://images.unsplash.com/photo-1623660053975-cf75a8be0908?w=600&q=80','["https://images.unsplash.com/photo-1623660053975-cf75a8be0908?w=600&q=80"]','Festive tower of premium Dairy Milk chocolates.','Stack up the sweetness with our Dairy Milk Festive Gift Tower. A beautiful tiered arrangement of Cadbury Dairy Milk chocolate bars in assorted flavors, perfect for Eid, birthdays, and celebrations.',1299,999,23,88,980,4.6,186,'["Eid","Birthday"]','["Kids","Him","Her"]','2-3 days',false,false,true),

('b5b5b5b5-b5b5-b5b5-b5b5-b5b5b5b5b5b5','a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3','Rose Gold Plated Pendant Necklace','rose-gold-necklace','jewelry','https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80','["https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80"]','Elegant rose gold pendant necklace, gift box included.','This stunning rose gold plated pendant necklace is a timeless piece of jewelry. Features a delicate chain with an elegant pendant. Comes in a premium velvet gift box — perfect for anniversaries, weddings, or birthdays.',3499,2299,34,12,760,4.9,421,'["Anniversary","Wedding","Birthday"]','["Her"]','3-4 days',false,true,true),

('b6b6b6b6-b6b6-b6b6-b6b6-b6b6b6b6b6b6','a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3','Sterling Silver Charm Bracelet','silver-charm-bracelet','jewelry','https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=600&q=80','["https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=600&q=80"]','Beautiful sterling silver charm bracelet, customizable.','Add a touch of elegance with this beautiful sterling silver charm bracelet. Choose from a selection of meaningful charms to create a truly personal gift.',2899,1999,31,18,540,4.7,198,'["Birthday","Anniversary"]','["Her"]','3-4 days',true,false,true),

('b7b7b7b7-b7b7-b7b7-b7b7-b7b7b7b7b7b7','a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3','Sparkling Diamond-Cut Stud Earrings','diamond-stud-earrings','jewelry','https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80','["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"]','Brilliant cut stud earrings in premium gift packaging.','These brilliant diamond-cut stud earrings catch the light beautifully from every angle. Crafted in premium silver with a secure butterfly clasp, presented in a luxury gift box.',4299,2999,30,22,410,4.8,167,'["Wedding","Anniversary"]','["Her"]','3-4 days',false,false,true),

('b8b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8','a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4','Personalized Wooden Photo Frame','personalized-photo-frame','photo','https://images.unsplash.com/photo-1582053628662-c65b0e0544e9?w=600&q=80','["https://images.unsplash.com/photo-1582053628662-c65b0e0544e9?w=600&q=80"]','Customizable wooden frame with your favorite photo and message.','Preserve your most cherished memories in this beautifully crafted personalized wooden photo frame. Engrave a name, date, or heartfelt message to create a truly one-of-a-kind gift.',999,699,30,45,1100,4.9,289,'["Anniversary","Wedding","Birthday"]','["Her","Him","Parents"]','4-5 days',true,true,true),

('b9b9b9b9-b9b9-b9b9-b9b9-b9b9b9b9b9b9','a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4','Handcrafted Greeting Card Set (5pcs)','handmade-greeting-card','crafts','https://images.unsplash.com/photo-1680183718072-e9b55b649698?w=600&q=80','["https://images.unsplash.com/photo-1680183718072-e9b55b649698?w=600&q=80"]','Set of 5 beautifully handcrafted greeting cards.','Each card in this set is lovingly handcrafted with premium paper, ribbons, and embellishments. Perfect for birthdays, anniversaries, or any occasion that calls for a personal touch.',599,399,33,67,320,4.6,92,'["Birthday","Anniversary"]','["Her","Him"]','2-3 days',true,false,true),

('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0','a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6','Luxury Scented Candle Gift Set','scented-candle-luxury-set','candles','https://images.unsplash.com/photo-1528351655744-27cc30462816?w=600&q=80','["https://images.unsplash.com/photo-1528351655744-27cc30462816?w=600&q=80"]','Set of 3 luxury scented candles in elegant packaging.','Transform any space into a sanctuary with our Luxury Scented Candle Gift Set. Includes 3 hand-poured soy wax candles: Rose & Oud, Vanilla & Sandalwood, and Jasmine & Mint. Burns for 40+ hours each.',1799,1299,28,34,480,4.7,156,'["Anniversary","Birthday"]','["Her","Parents"]','2-3 days',false,false,true),

('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1','a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5','Chocolate Truffle Birthday Cake (1kg)','chocolate-birthday-cake','cakes','https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80','["https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80"]','Rich chocolate truffle cake, customize with name and message.','Celebrate in style with our decadent Chocolate Truffle Cake. Made with premium Belgian chocolate and rich truffle filling, this 1kg masterpiece is freshly baked to order. Add a personalized message and name.',1299,999,23,15,890,4.8,234,'["Birthday"]','["Him","Her","Kids","Parents"]','Same day',true,true,true),

('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2','a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5','Classic Red Velvet Cake (1kg)','red-velvet-cake','cakes','https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80','["https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80"]','Moist red velvet cake with cream cheese frosting.','Our iconic Red Velvet Cake features 3 layers of moist red velvet sponge with rich cream cheese frosting. Freshly baked same day, delivered to your door.',1399,1099,21,12,540,4.7,178,'["Anniversary","Birthday"]','["Her","Him"]','Same day',true,false,true),

('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3','a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5','Assorted Cupcake Gift Box (12 pcs)','cupcake-box-assorted','cakes','https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80','["https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80"]','12 assorted gourmet cupcakes in gift packaging.','Treat someone special to a dozen gourmet cupcakes in assorted flavors: red velvet, chocolate fudge, lemon zest, strawberry cream, and more. Beautifully packaged in a premium gift box.',999,799,20,26,420,4.6,134,'["Birthday"]','["Kids","Her"]','Same day',false,false,true),

('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4','a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6','Giant Cuddly Teddy Bear (3ft)','teddy-bear-large','toys','https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=600&q=80','["https://images.unsplash.com/photo-1556012018-50c5c0da73bf?w=600&q=80"]','3ft tall ultra-soft teddy bear with red ribbon.','This giant 3ft teddy bear is the ultimate gift for someone you adore. Made from ultra-soft premium plush fabric with a signature red satin ribbon. Perfect for Valentine''s Day, birthdays, or anniversaries.',2499,1799,28,18,720,4.9,312,'["Birthday","Valentine","Anniversary"]','["Her","Kids"]','2-3 days',false,true,true),

('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5','a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6','Adorable Plush Bunny Rabbit Toy','plush-bunny-rabbit','toys','https://images.unsplash.com/photo-1615486363973-f79d875780cf?w=600&q=80','["https://images.unsplash.com/photo-1615486363973-f79d875780cf?w=600&q=80"]','Soft plush bunny rabbit, perfect for kids and adults.','Meet your new cuddly companion — our Adorable Plush Bunny Rabbit! Made from hypoallergenic super-soft plush material, safe for all ages. Available in pink and white.',1199,899,25,36,380,4.7,142,'["Birthday"]','["Kids","Her"]','2-3 days',false,false,true),

('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6','a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4','Luxury Festive Gift Hamper','luxury-gift-hamper','hampers','https://images.unsplash.com/photo-1664849271854-26ed0d81d813?w=600&q=80','["https://images.unsplash.com/photo-1664849271854-26ed0d81d813?w=600&q=80"]','Premium hamper with chocolates, dry fruits, and more.','The ultimate expression of generosity — our Luxury Festive Gift Hamper features premium Belgian chocolates, exotic dry fruits, artisan biscuits, gourmet tea, and a personalized greeting card in a wicker basket.',3999,2899,28,14,290,4.8,178,'["Eid","Anniversary","Wedding"]','["Parents","Him","Her"]','3-4 days',true,true,true),

('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7','a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4','Relaxing Spa Day Gift Basket','spa-gift-basket','hampers','https://images.unsplash.com/photo-1577403349502-058e4a149b3f?w=600&q=80','["https://images.unsplash.com/photo-1577403349502-058e4a149b3f?w=600&q=80"]','Indulgent spa basket with bath bombs, candles and oils.','Give the gift of relaxation with this luxurious Spa Day Gift Basket. Includes: 3 bath bombs, 2 scented candles, lavender body oil, rose face mask, and a plush bath glove.',2299,1699,26,22,210,4.6,98,'["Birthday","Anniversary"]','["Her","Parents"]','3-4 days',false,false,true),

('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8','a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4','Personalized Name & Photo Mug','personalized-name-mug','personalized','https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80','["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80"]','Custom ceramic mug with your photo and name printed.','Start every morning with a smile using this Personalized Name & Photo Mug. Upload your favorite photo and add a name or message — printed on a high-quality 11oz ceramic mug. Microwave and dishwasher safe.',599,399,33,78,1340,4.7,256,'["Birthday","Anniversary"]','["Him","Her","Parents"]','3-4 days',true,true,true),

('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9','a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4','Custom Printed Cotton T-Shirt','custom-t-shirt','personalized','https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80','["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80"]','Premium cotton t-shirt with your custom design.','Express yourself with our Custom Printed Cotton T-Shirt. Made from 100% combed cotton. Upload any photo, artwork, or text and we print it with vibrant, long-lasting colors. Available in S to XXL.',899,699,22,124,680,4.5,89,'["Birthday","Anniversary"]','["Him","Her"]','4-5 days',true,false,true),

('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0','a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4','Anniversary Couple Gift Set','anniversary-couple-set','personalized','https://images.unsplash.com/photo-1664849173063-8d8244ac3933?w=600&q=80','["https://images.unsplash.com/photo-1664849173063-8d8244ac3933?w=600&q=80"]','Curated couple gift set for special anniversaries.','Celebrate your love story with our Anniversary Couple Gift Set. Includes a personalized photo frame, matching couple mugs, a handwritten greeting card, and a box of premium chocolates. All beautifully gift-boxed.',2799,1999,29,19,320,4.8,167,'["Anniversary","Wedding"]','["Her","Him"]','4-5 days',true,true,true)

ON CONFLICT (id) DO NOTHING;

-- ─── STEP 6: Demo customer address ───────────────────────────
INSERT INTO public.addresses (user_id, label, name, phone, street, city, district, postal_code, is_default)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Home','Demo User','+8801700000000','House 42, Road 11, Banani','Dhaka','Dhaka','1213',true)
ON CONFLICT DO NOTHING;

-- ─── STEP 7: Coupons ─────────────────────────────────────────
INSERT INTO public.coupons (code, description, discount_type, discount_value, minimum_order_amount, maximum_discount, usage_limit) VALUES
  ('WELCOME20','20% off your first order',  'percentage',20, 500, 500, NULL),
  ('PRIZZY10', '10% off on any order',       'percentage',10, 300, 300, NULL),
  ('FLAT200',  '৳200 off orders over ৳2000','fixed',     200,2000,NULL, NULL),
  ('EID50',    '50% off Eid specials',       'percentage',50,1000,1000, 200),
  ('NEWUSER',  '৳150 off for new users',     'fixed',     150, 800,NULL, NULL),
  ('EID30',    '30% off on Eid hampers',     'percentage',30,3000,1500, 200)
ON CONFLICT (code) DO NOTHING;

-- ─── DONE ─────────────────────────────────────────────────────
-- Login credentials:
--   demo@prizzy.com       / Demo1234!  (customer)
--   admin@prizzy.com      / Demo1234!  (admin)
--   petal@prizzy.com      / Demo1234!  (seller)
--   cocoa@prizzy.com      / Demo1234!  (seller)
--   glitter@prizzy.com    / Demo1234!  (seller)
--   memory@prizzy.com     / Demo1234!  (seller)
--   sweetslice@prizzy.com / Demo1234!  (seller)
--   cuddle@prizzy.com     / Demo1234!  (seller)
-- ─────────────────────────────────────────────────────────────
