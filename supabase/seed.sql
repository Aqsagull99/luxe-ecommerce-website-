-- ============================================================================
-- Maison Luxe — Seed Data
-- ============================================================================
-- Run after the migration has been applied and an auth user exists for reviews.
-- Adjust the user UUID in the product_reviews INSERT to match a real auth.uid().
-- ============================================================================

-- Clear existing data (order matters for FK constraints)
DELETE FROM payment_transactions;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM wishlist_items;
DELETE FROM product_reviews;
DELETE FROM product_images;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM coupons;
DELETE FROM addresses;
DELETE FROM categories;
DELETE FROM profiles;

-- ============================================================================
-- Categories
-- ============================================================================
INSERT INTO categories (id, name, slug, description, image_url, sort_order, is_active, meta_title, meta_description)
VALUES
  (
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Living Room',
    'living-room',
    'Sofas, coffee tables, and accent pieces to make your living space shine.',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    1,
    true,
    'Living Room Furniture & Decor | Maison Luxe',
    'Shop premium living room furniture including sofas, coffee tables, and accent decor.'
  ),
  (
    'a1b2c3d4-0001-4000-8000-000000000002',
    'Bedroom',
    'bedroom',
    'Transform your bedroom into a serene sanctuary with our curated collection.',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
    2,
    true,
    'Bedroom Furniture & Bedding | Maison Luxe',
    'Luxurious bedroom furniture, bedding sets, and nightstands for a restful retreat.'
  ),
  (
    'a1b2c3d4-0001-4000-8000-000000000003',
    'Decor',
    'decor',
    'Curated accents — from rugs and vases to wall art and textiles.',
    'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80',
    3,
    true,
    'Home Decor Accents | Maison Luxe',
    'Discover elegant home decor including rugs, vases, wall hangings, and textiles.'
  ),
  (
    'a1b2c3d4-0001-4000-8000-000000000004',
    'Lighting',
    'lighting',
    'Chandeliers, lamps, and smart lighting for every room.',
    'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&q=80',
    4,
    true,
    'Lighting Fixtures & Lamps | Maison Luxe',
    'Premium lighting solutions including chandeliers, floor lamps, and smart LED strips.'
  );

-- ============================================================================
-- Products
-- ============================================================================

-- -------------------------------------------------------
-- Living Room
-- -------------------------------------------------------
INSERT INTO products (id, name, slug, description, short_description, category_id, price, sale_price, cost_price, sku, barcode, stock_quantity, low_stock_threshold, weight, dimensions, tags, is_active, is_featured, is_new_arrival, is_best_seller, rating_avg, rating_count, meta_title, meta_description, meta_keywords)
VALUES
  (
    'b1c2d3e4-0002-4000-8000-000000000001',
    'Meridian Velvet Sofa',
    'meridian-velvet-sofa',
    'The Meridian Velvet Sofa is a statement piece for the modern living room. Upholstered in premium Belgian velvet with a solid kiln-dried hardwood frame, it offers plush foam-and-fibre seating with reinforced stitching. Available in three rich colours.',
    'Premium Belgian velvet sofa with a solid hardwood frame and plush seating.',
    'a1b2c3d4-0001-4000-8000-000000000001',
    24999.00,
    21999.00,
    14000.00,
    'ML-SOF-001',
    '8901234567890',
    15,
    3,
    45.50,
    '{"length": 220, "width": 95, "height": 85, "unit": "cm"}',
    ARRAY['velvet', 'sofa', 'living-room', 'featured', 'best-seller'],
    true, true, false, true,
    4.70, 28,
    'Meridian Velvet Sofa | Maison Luxe',
    'Shop the Meridian Velvet Sofa — premium Belgian velvet, kiln-dried hardwood frame, available in walnut, ivory, and charcoal.',
    'velvet sofa, luxury sofa, living room seating, premium sofa'
  ),
  (
    'b1c2d3e4-0002-4000-8000-000000000002',
    'Artisan Coffee Table',
    'artisan-coffee-table',
    'Handcrafted from reclaimed mango wood with a live-edge finish, the Artisan Coffee Table brings warmth and character to any living room. The lower shelf offers extra storage for books or magazines.',
    'Handcrafted reclaimed mango wood coffee table with live-edge finish.',
    'a1b2c3d4-0001-4000-8000-000000000001',
    12500.00,
    NULL,
    7000.00,
    'ML-CTB-002',
    '8901234567891',
    22,
    5,
    18.00,
    '{"length": 120, "width": 60, "height": 45, "unit": "cm"}',
    ARRAY['wooden', 'coffee-table', 'living-room', 'handcrafted'],
    true, true, true, false,
    4.50, 15,
    'Artisan Coffee Table | Maison Luxe',
    'Handcrafted mango wood coffee table with live edge and lower storage shelf.',
    'coffee table, mango wood, handcrafted, live edge, living room table'
  ),
  (
    'b1c2d3e4-0002-4000-8000-000000000003',
    'Bamboo Floor Lamp',
    'bamboo-floor-lamp',
    'A sculptural floor lamp featuring natural bamboo wrapped around a brushed brass stem. The linen drum shade diffuses light beautifully, making it perfect for reading corners or ambient living room lighting.',
    'Natural bamboo and brushed brass floor lamp with linen drum shade.',
    'a1b2c3d4-0001-4000-8000-000000000001',
    8999.00,
    NULL,
    4800.00,
    'ML-LMP-003',
    '8901234567892',
    30,
    5,
    5.50,
    '{"height": 160, "shade_diameter": 40, "unit": "cm"}',
    ARRAY['floor-lamp', 'bamboo', 'living-room', 'lighting'],
    true, false, true, false,
    4.30, 10,
    'Bamboo Floor Lamp | Maison Luxe',
    'Natural bamboo floor lamp with brushed brass stem and linen drum shade.',
    'floor lamp, bamboo lamp, living room lighting, brass lamp'
  );

-- -------------------------------------------------------
-- Bedroom
-- -------------------------------------------------------
INSERT INTO products (id, name, slug, description, short_description, category_id, price, sale_price, cost_price, sku, barcode, stock_quantity, low_stock_threshold, weight, dimensions, tags, is_active, is_featured, is_new_arrival, is_best_seller, rating_avg, rating_count, meta_title, meta_description, meta_keywords)
VALUES
  (
    'b1c2d3e4-0002-4000-8000-000000000004',
    'Serene King Bed Frame',
    'serene-king-bed-frame',
    'The Serene King Bed Frame combines a low-profile silhouette with button-tufted upholstery in linen-weave fabric. The sturdy wooden slat system supports memory-foam mattresses without requiring a box spring.',
    'Button-tufted linen-weave king bed frame with wooden slat support.',
    'a1b2c3d4-0001-4000-8000-000000000002',
    22000.00,
    18999.00,
    12500.00,
    'ML-BED-004',
    '8901234567893',
    10,
    2,
    60.00,
    '{"length": 215, "width": 195, "height": 120, "unit": "cm"}',
    ARRAY['bed-frame', 'king', 'linen', 'bedroom', 'featured'],
    true, true, false, true,
    4.80, 35,
    'Serene King Bed Frame | Maison Luxe',
    'Button-tufted linen-weave king bed frame with low profile and wooden slat support.',
    'king bed frame, tufted bed, linen upholstered bed, bedroom furniture'
  ),
  (
    'b1c2d3e4-0002-4000-8000-000000000005',
    'Linen Blend Duvet Set',
    'linen-blend-duvet-set',
    'Crafted from a sustainable blend of French flax linen and organic cotton, this duvet set gets softer with every wash. Set includes one duvet cover and two pillow shams in an envelope closure.',
    'French flax linen and organic cotton duvet set — king size.',
    'a1b2c3d4-0001-4000-8000-000000000002',
    5500.00,
    NULL,
    2900.00,
    'ML-DUV-005',
    '8901234567894',
    50,
    10,
    2.00,
    '{"size": "king", "thread_count": 300, "unit": "na"}',
    ARRAY['duvet', 'linen', 'bedding', 'bedroom', 'new-arrival'],
    true, false, true, false,
    4.40, 12,
    'Linen Blend Duvet Set King | Maison Luxe',
    'French flax linen and organic cotton king duvet set — envelope closure, stonewashed finish.',
    'linen duvet set, king bedding, organic cotton duvet, luxury bedding'
  ),
  (
    'b1c2d3e4-0002-4000-8000-000000000006',
    'Walnut Nightstand',
    'walnut-nightstand',
    'A mid-century inspired nightstand crafted from solid American walnut with tapered legs and a single smooth-gliding drawer. The open lower shelf is perfect for a stack of books or a decorative basket.',
    'Solid American walnut nightstand with tapered legs and drawer.',
    'a1b2c3d4-0001-4000-8000-000000000002',
    6500.00,
    NULL,
    3500.00,
    'ML-NST-006',
    '8901234567895',
    25,
    5,
    12.00,
    '{"width": 50, "depth": 40, "height": 60, "unit": "cm"}',
    ARRAY['nightstand', 'walnut', 'bedroom', 'mid-century'],
    true, false, false, false,
    4.60, 18,
    'Walnut Nightstand | Maison Luxe',
    'Mid-century inspired solid walnut nightstand with tapered legs and drawer.',
    'walnut nightstand, mid century nightstand, bedroom side table'
  );

-- -------------------------------------------------------
-- Decor
-- -------------------------------------------------------
INSERT INTO products (id, name, slug, description, short_description, category_id, price, sale_price, cost_price, sku, barcode, stock_quantity, low_stock_threshold, weight, dimensions, tags, is_active, is_featured, is_new_arrival, is_best_seller, rating_avg, rating_count, meta_title, meta_description, meta_keywords)
VALUES
  (
    'b1c2d3e4-0002-4000-8000-000000000007',
    'Moroccan Kilim Rug',
    'moroccan-kilim-rug',
    'Handwoven by artisans in the Atlas Mountains, this flat-weave kilim rug uses natural wool dyed with vegetable pigments. Geometric diamond patterns in muted terracotta, indigo, and ivory make it a versatile layering piece.',
    'Handwoven natural wool kilim rug with geometric diamond pattern.',
    'a1b2c3d4-0001-4000-8000-000000000003',
    9999.00,
    8499.00,
    5500.00,
    'ML-RUG-007',
    '8901234567896',
    18,
    3,
    8.00,
    '{"length": 240, "width": 150, "unit": "cm"}',
    ARRAY['rug', 'kilim', 'moroccan', 'decor', 'featured', 'handwoven'],
    true, true, false, true,
    4.80, 40,
    'Moroccan Kilim Rug | Maison Luxe',
    'Handwoven Moroccan wool kilim rug with geometric diamond patterns — terracotta, indigo, ivory.',
    'moroccan rug, kilim rug, wool rug, handwoven rug, geometric rug'
  ),
  (
    'b1c2d3e4-0002-4000-8000-000000000008',
    'Abstract Ceramic Vase Set',
    'abstract-ceramic-vase-set',
    'A set of three hand-thrown ceramic vases with organic, asymmetric forms. Each piece features a reactive glaze that creates unique colour variation — no two sets are exactly alike.',
    'Set of three hand-thrown ceramic vases with reactive glaze.',
    'a1b2c3d4-0001-4000-8000-000000000003',
    3200.00,
    NULL,
    1600.00,
    'ML-VAS-008',
    '8901234567897',
    40,
    8,
    3.50,
    '{"heights": "25, 35, 45", "unit": "cm"}',
    ARRAY['vase', 'ceramic', 'abstract', 'decor', 'new-arrival'],
    true, false, true, false,
    4.20, 8,
    'Abstract Ceramic Vase Set | Maison Luxe',
    'Hand-thrown ceramic vase set with reactive glaze — organic forms, unique finish.',
    'ceramic vases, abstract vases, hand thrown pottery, decorative vases'
  ),
  (
    'b1c2d3e4-0002-4000-8000-000000000009',
    'Macrame Wall Hanging',
    'macrame-wall-hanging',
    'A large-scale macrame wall hanging made from unbleached organic cotton cord. The intricate knotted pattern is inspired by traditional South American fibre art and adds warmth and texture to any wall.',
    'Large macrame wall hanging in unbleached organic cotton cord.',
    'a1b2c3d4-0001-4000-8000-000000000003',
    4500.00,
    NULL,
    2200.00,
    'ML-WAL-009',
    '8901234567898',
    20,
    5,
    1.20,
    '{"width": 80, "length": 120, "unit": "cm"}',
    ARRAY['macrame', 'wall-art', 'cotton', 'decor', 'boho'],
    true, false, false, false,
    4.50, 14,
    'Macrame Wall Hanging | Maison Luxe',
    'Large macrame wall hanging made from unbleached organic cotton — boho texture.',
    'macrame wall hanging, cotton wall art, boho decor, woven wall art'
  );

-- -------------------------------------------------------
-- Lighting
-- -------------------------------------------------------
INSERT INTO products (id, name, slug, description, short_description, category_id, price, sale_price, cost_price, sku, barcode, stock_quantity, low_stock_threshold, weight, dimensions, tags, is_active, is_featured, is_new_arrival, is_best_seller, rating_avg, rating_count, meta_title, meta_description, meta_keywords)
VALUES
  (
    'b1c2d3e4-0002-4000-8000-000000000010',
    'Crystal Chandelier',
    'crystal-chandelier',
    'A show-stopping 6-light chandelier featuring hand-cut K9 crystal droplets suspended from a brushed gold frame. Dimmable and compatible with standard E14 bulbs. Ideal for dining rooms, foyers, or master bedrooms.',
    'Hand-cut K9 crystal 6-light chandelier with brushed gold frame.',
    'a1b2c3d4-0001-4000-8000-000000000004',
    18500.00,
    15999.00,
    10000.00,
    'ML-CHN-010',
    '8901234567899',
    8,
    2,
    12.00,
    '{"width": 70, "height": 80, "unit": "cm"}',
    ARRAY['chandelier', 'crystal', 'gold', 'lighting', 'featured'],
    true, true, false, true,
    4.90, 50,
    'Crystal Chandelier 6-Light | Maison Luxe',
    'Hand-cut K9 crystal chandelier with brushed gold frame — dimmable, 6-light.',
    'crystal chandelier, gold chandelier, K9 crystal, luxury lighting'
  ),
  (
    'b1c2d3e4-0002-4000-8000-000000000011',
    'Brass Table Lamp',
    'brass-table-lamp',
    'A timeless table lamp turned from solid brass with a patinated antique finish. Topped with a tailored off-white linen shade and a brass finial. Adds a warm, ambient glow to bedside tables or console desks.',
    'Solid brass table lamp with antique patina finish and linen shade.',
    'a1b2c3d4-0001-4000-8000-000000000004',
    7200.00,
    NULL,
    3900.00,
    'ML-TBL-011',
    '8901234567900',
    35,
    5,
    3.80,
    '{"height": 65, "shade_diameter": 30, "unit": "cm"}',
    ARRAY['table-lamp', 'brass', 'antique', 'lighting', 'bedroom'],
    true, false, false, false,
    4.50, 20,
    'Brass Table Lamp | Maison Luxe',
    'Solid brass table lamp with antique patina finish and off-white linen shade.',
    'brass lamp, table lamp, antique brass, bedside lamp, linen shade'
  ),
  (
    'b1c2d3e4-0002-4000-8000-000000000012',
    'LED Smart Strip',
    'led-smart-strip',
    'Colour-changing RGBIC LED strip with built-in Wi-Fi. Syncs with Alexa and Google Home, supports music-sync mode, and can be cut to custom lengths. Includes adhesive backing and a 2-metre extension.',
    'RGBIC Wi-Fi LED strip with Alexa/Google Home support and music sync.',
    'a1b2c3d4-0001-4000-8000-000000000004',
    3999.00,
    2999.00,
    1800.00,
    'ML-LED-012',
    '8901234567901',
    60,
    10,
    0.40,
    '{"length": 500, "unit": "cm"}',
    ARRAY['led-strip', 'smart', 'rgbic', 'lighting', 'new-arrival'],
    true, false, true, false,
    4.10, 22,
    'LED Smart Strip RGBIC 5m | Maison Luxe',
    'RGBIC LED strip with Wi-Fi, Alexa/Google Home support, and music-sync mode — 5 metres.',
    'LED strip, smart lighting, RGBIC, Alexa light, Google Home light'
  );

-- ============================================================================
-- Product Images
-- ============================================================================
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary)
VALUES
  -- Meridian Velvet Sofa (3 images)
  ('c1d2e3f4-0003-4000-8000-000000000001', 'b1c2d3e4-0002-4000-8000-000000000001', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 'Meridian Velvet Sofa - Walnut front view', 1, true),
  ('c1d2e3f4-0003-4000-8000-000000000002', 'b1c2d3e4-0002-4000-8000-000000000001', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80', 'Meridian Velvet Sofa - Ivory angle', 2, false),
  ('c1d2e3f4-0003-4000-8000-000000000003', 'b1c2d3e4-0002-4000-8000-000000000001', 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80', 'Meridian Velvet Sofa - Charcoal detail', 3, false),

  -- Artisan Coffee Table (2 images)
  ('c1d2e3f4-0003-4000-8000-000000000004', 'b1c2d3e4-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&q=80', 'Artisan Coffee Table top view', 1, true),
  ('c1d2e3f4-0003-4000-8000-000000000005', 'b1c2d3e4-0002-4000-8000-000000000002', 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80', 'Artisan Coffee Table with decor', 2, false),

  -- Bamboo Floor Lamp (2 images)
  ('c1d2e3f4-0003-4000-8000-000000000006', 'b1c2d3e4-0002-4000-8000-000000000003', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', 'Bamboo Floor Lamp lit', 1, true),
  ('c1d2e3f4-0003-4000-8000-000000000007', 'b1c2d3e4-0002-4000-8000-000000000003', 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80', 'Bamboo Floor Lamp in corner', 2, false),

  -- Serene King Bed Frame (2 images)
  ('c1d2e3f4-0003-4000-8000-000000000008', 'b1c2d3e4-0002-4000-8000-000000000004', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', 'Serene King Bed Frame styled', 1, true),
  ('c1d2e3f4-0003-4000-8000-000000000009', 'b1c2d3e4-0002-4000-8000-000000000004', 'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?w=800&q=80', 'Serene King Bed Frame detail', 2, false),

  -- Linen Blend Duvet Set (1 image)
  ('c1d2e3f4-0003-4000-8000-000000000010', 'b1c2d3e4-0002-4000-8000-000000000005', 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80', 'Linen Blend Duvet Set on bed', 1, true),

  -- Walnut Nightstand (1 image)
  ('c1d2e3f4-0003-4000-8000-000000000011', 'b1c2d3e4-0002-4000-8000-000000000006', 'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?w=800&q=80', 'Walnut Nightstand beside bed', 1, true),

  -- Moroccan Kilim Rug (2 images)
  ('c1d2e3f4-0003-4000-8000-000000000012', 'b1c2d3e4-0002-4000-8000-000000000007', 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80', 'Moroccan Kilim Rug on floor', 1, true),
  ('c1d2e3f4-0003-4000-8000-000000000013', 'b1c2d3e4-0002-4000-8000-000000000007', 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80', 'Moroccan Kilim Rug pattern detail', 2, false),

  -- Abstract Ceramic Vase Set (1 image)
  ('c1d2e3f4-0003-4000-8000-000000000014', 'b1c2d3e4-0002-4000-8000-000000000008', 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80', 'Abstract Ceramic Vase Set on shelf', 1, true),

  -- Macrame Wall Hanging (1 image)
  ('c1d2e3f4-0003-4000-8000-000000000015', 'b1c2d3e4-0002-4000-8000-000000000009', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', 'Macrame Wall Hanging on wall', 1, true),

  -- Crystal Chandelier (2 images)
  ('c1d2e3f4-0003-4000-8000-000000000016', 'b1c2d3e4-0002-4000-8000-000000000010', 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=800&q=80', 'Crystal Chandelier lit', 1, true),
  ('c1d2e3f4-0003-4000-8000-000000000017', 'b1c2d3e4-0002-4000-8000-000000000010', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80', 'Crystal Chandelier detail', 2, false),

  -- Brass Table Lamp (1 image)
  ('c1d2e3f4-0003-4000-8000-000000000018', 'b1c2d3e4-0002-4000-8000-000000000011', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80', 'Brass Table Lamp on desk', 1, true),

  -- LED Smart Strip (1 image)
  ('c1d2e3f4-0003-4000-8000-000000000019', 'b1c2d3e4-0002-4000-8000-000000000012', 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&q=80', 'LED Smart Strip behind TV', 1, true);

-- ============================================================================
-- Product Variants
-- ============================================================================
INSERT INTO product_variants (id, product_id, name, sku, price_modifier, stock_quantity, color, size, material, finish, image_url, is_active)
VALUES
  -- Meridian Velvet Sofa — 3 colours
  ('d1e2f3a4-0004-4000-8000-000000000001', 'b1c2d3e4-0002-4000-8000-000000000001', 'Walnut', 'ML-SOF-001-WAL', 0, 6, '#5C3A29', '3-Seater', 'Belgian Velvet', 'Matte', '', true),
  ('d1e2f3a4-0004-4000-8000-000000000002', 'b1c2d3e4-0002-4000-8000-000000000001', 'Ivory', 'ML-SOF-001-IVO', 0, 5, '#F5F0E8', '3-Seater', 'Belgian Velvet', 'Matte', '', true),
  ('d1e2f3a4-0004-4000-8000-000000000003', 'b1c2d3e4-0002-4000-8000-000000000001', 'Charcoal', 'ML-SOF-001-CHA', 0, 4, '#36454F', '3-Seater', 'Belgian Velvet', 'Matte', '', true),

  -- Artisan Coffee Table — 2 sizes
  ('d1e2f3a4-0004-4000-8000-000000000004', 'b1c2d3e4-0002-4000-8000-000000000002', 'Standard 120cm', 'ML-CTB-002-STD', 0, 15, NULL, '120cm', 'Mango Wood', 'Matte Lacquer', '', true),
  ('d1e2f3a4-0004-4000-8000-000000000005', 'b1c2d3e4-0002-4000-8000-000000000002', 'Large 150cm', 'ML-CTB-002-LRG', 1500, 7, NULL, '150cm', 'Mango Wood', 'Matte Lacquer', '', true),

  -- Serene King Bed Frame — 2 colours
  ('d1e2f3a4-0004-4000-8000-000000000006', 'b1c2d3e4-0002-4000-8000-000000000004', 'Oatmeal Linen', 'ML-BED-004-OAT', 0, 5, '#D4C9B5', 'King', 'Linen Weave', 'Upholstered', '', true),
  ('d1e2f3a4-0004-4000-8000-000000000007', 'b1c2d3e4-0002-4000-8000-000000000004', 'Slate Grey', 'ML-BED-004-SLT', 0, 5, '#708090', 'King', 'Linen Weave', 'Upholstered', '', true),

  -- Linen Blend Duvet Set — 2 colours
  ('d1e2f3a4-0004-4000-8000-000000000008', 'b1c2d3e4-0002-4000-8000-000000000005', 'Stonewashed White', 'ML-DUV-005-WHT', 0, 25, '#F8F8F8', 'King', 'Linen-Cotton Blend', 'Stonewashed', '', true),
  ('d1e2f3a4-0004-4000-8000-000000000009', 'b1c2d3e4-0002-4000-8000-000000000005', 'Dusty Rose', 'ML-DUV-005-ROS', 0, 25, '#C9A9A9', 'King', 'Linen-Cotton Blend', 'Stonewashed', '', true),

  -- Walnut Nightstand — single variant
  ('d1e2f3a4-0004-4000-8000-000000000010', 'b1c2d3e4-0002-4000-8000-000000000006', 'Standard', 'ML-NST-006-STD', 0, 25, NULL, '50x40x60 cm', 'American Walnut', 'Matte Lacquer', '', true),

  -- Moroccan Kilim Rug — 2 sizes
  ('d1e2f3a4-0004-4000-8000-000000000011', 'b1c2d3e4-0002-4000-8000-000000000007', '150 x 240 cm', 'ML-RUG-007-SML', 0, 10, NULL, '150x240 cm', 'Natural Wool', 'Flat-weave', '', true),
  ('d1e2f3a4-0004-4000-8000-000000000012', 'b1c2d3e4-0002-4000-8000-000000000007', '200 x 300 cm', 'ML-RUG-007-LRG', 3000, 8, NULL, '200x300 cm', 'Natural Wool', 'Flat-weave', '', true),

  -- Brass Table Lamp — single variant
  ('d1e2f3a4-0004-4000-8000-000000000013', 'b1c2d3e4-0002-4000-8000-000000000011', 'Antique Brass', 'ML-TBL-011-BRS', 0, 35, '#C5A67C', '65 cm', 'Solid Brass', 'Antique Patina', '', true),

  -- LED Smart Strip — 2 lengths
  ('d1e2f3a4-0004-4000-8000-000000000014', 'b1c2d3e4-0002-4000-8000-000000000012', '5 metres', 'ML-LED-012-5M', 0, 40, NULL, '5m', 'Silicone + PCB', 'Matte', '', true),
  ('d1e2f3a4-0004-4000-8000-000000000015', 'b1c2d3e4-0002-4000-8000-000000000012', '10 metres', 'ML-LED-012-10M', 2500, 20, NULL, '10m', 'Silicone + PCB', 'Matte', '', true);

-- ============================================================================
-- Coupons
-- ============================================================================
INSERT INTO coupons (id, code, type, value, min_order_amount, max_uses, used_count, is_active, expires_at)
VALUES
  (
    'e1f2a3b4-0005-4000-8000-000000000001',
    'WELCOME10',
    'percentage',
    10.00,
    1000.00,
    500,
    42,
    true,
    '2027-12-31 23:59:59+05'
  ),
  (
    'e1f2a3b4-0005-4000-8000-000000000002',
    'FREESHIP',
    'free_shipping',
    0.00,
    2500.00,
    200,
    85,
    true,
    '2027-06-30 23:59:59+05'
  );

-- ============================================================================
-- Sample Reviews (skip — create user first, then run manually)
-- ============================================================================
