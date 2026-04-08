-- =====================================================
-- SacShop.dz - Algerian E-commerce System Schema
-- Complete Database Schema v2.0
-- =====================================================

-- 1. Wilayas Table (58 Algerian Wilayas)
CREATE TABLE IF NOT EXISTS wilayas (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL
);

-- 2. Delivery Fees Table
CREATE TABLE IF NOT EXISTS delivery_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wilaya_id INTEGER REFERENCES wilayas(id) ON DELETE CASCADE,
    home_fee DECIMAL(10, 2) DEFAULT 600,
    desk_fee DECIMAL(10, 2) DEFAULT 400,
    UNIQUE(wilaya_id)
);

-- 3. Products Table (Enhanced)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2),          -- Original price for showing discount
    image_url TEXT,
    gallery JSONB DEFAULT '[]',            -- Array of additional image URLs
    category TEXT,
    tags TEXT[],
    colors JSONB DEFAULT '[]',             -- [{name: "أحمر", hex: "#ff0000"}]
    sizes JSONB DEFAULT '[]',              -- ["صغير", "متوسط", "كبير"]
    stock INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    weight_grams INTEGER DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customers Table (Auto-created on first order)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    wilaya_id INTEGER REFERENCES wilayas(id),
    address TEXT,
    is_vip BOOLEAN DEFAULT FALSE,          -- VIP status for exclusive offers
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_order_at TIMESTAMP WITH TIME ZONE
);

-- 5. Orders Table (Enhanced)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL,
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT NOT NULL,
    wilaya_id INTEGER REFERENCES wilayas(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    size TEXT,
    color TEXT,
    product_price DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    applied_offer_id UUID,                 -- Reference to applied VIP offer
    status TEXT DEFAULT 'new',            -- new, confirmed, processing, shipped, delivered, cancelled
    delivery_type TEXT DEFAULT 'home',    -- home, desk
    is_fake BOOLEAN DEFAULT FALSE,
    is_duplicate BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. VIP Offers Table (Exclusive offers for returning customers)
CREATE TABLE IF NOT EXISTS vip_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,                   -- "عرض رمضان الحصري"
    description TEXT,                      -- Description shown to customer
    discount_type TEXT NOT NULL,           -- 'percentage' or 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL, -- 20 (for 20%) or 500 (for 500 DZD)
    min_orders INTEGER DEFAULT 1,          -- Min past orders to qualify
    min_spent DECIMAL(10, 2) DEFAULT 0,    -- Min total spend to qualify
    product_ids UUID[],                    -- NULL = all products, else specific products
    wilaya_ids INTEGER[],                  -- NULL = all wilayas, else specific wilayas
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER,                      -- NULL = unlimited
    uses_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Settings Table (Full branding & config control)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Wilayas (58 Algerian Wilayas)
INSERT INTO wilayas (id, name, name_ar) VALUES
(1, 'Adrar', 'أدرار'), (2, 'Chlef', 'الشلف'), (3, 'Laghouat', 'الأغواط'),
(4, 'Oum El Bouaghi', 'أم البواقي'), (5, 'Batna', 'باتنة'), (6, 'Béjaïa', 'بجاية'),
(7, 'Biskra', 'بسكرة'), (8, 'Béchar', 'بشار'), (9, 'Blida', 'البليدة'),
(10, 'Bouira', 'البويرة'), (11, 'Tamanrasset', 'تمنراست'), (12, 'Tébessa', 'تبسة'),
(13, 'Tlemcen', 'تلمسان'), (14, 'Tiaret', 'تيارت'), (15, 'Tizi Ouzou', 'تيزي وزو'),
(16, 'Alger', 'الجزائر'), (17, 'Djelfa', 'الجلفة'), (18, 'Jijel', 'جيجل'),
(19, 'Sétif', 'سطيف'), (20, 'Saïda', 'سعيدة'), (21, 'Skikda', 'سكيكدة'),
(22, 'Sidi Bel Abbès', 'سيدي بلعباس'), (23, 'Annaba', 'عنابة'), (24, 'Guelma', 'قالمة'),
(25, 'Constantine', 'قسنطينة'), (26, 'Médéa', 'المدية'), (27, 'Mostaganem', 'مستغانم'),
(28, 'M''Sila', 'المسيلة'), (29, 'Mascara', 'معسكر'), (30, 'Ouargla', 'ورقلة'),
(31, 'Oran', 'وهران'), (32, 'El Bayadh', 'البيض'), (33, 'Illizi', 'إليزي'),
(34, 'Bordj Bou Arreridj', 'برج بوعريريج'), (35, 'Boumerdès', 'بومرداس'),
(36, 'El Tarf', 'الطارف'), (37, 'Tindouf', 'تندوف'), (38, 'Tissemsilt', 'تيسمسيلت'),
(39, 'El Oued', 'الوادي'), (40, 'Khenchela', 'خنشلة'), (41, 'Souk Ahras', 'سوق أهراس'),
(42, 'Tipaza', 'تيبازة'), (43, 'Mila', 'ميلة'), (44, 'Aïn Defla', 'عين الدفلى'),
(45, 'Naâma', 'النعامة'), (46, 'Aïn Témouchent', 'عين تموشنت'), (47, 'Ghardaïa', 'غرداية'),
(48, 'Relizane', 'غليزان'), (49, 'El M''Ghair', 'المغير'), (50, 'El Meniaa', 'المنيعة'),
(51, 'Ouled Djellal', 'أولاد جلال'), (52, 'Bordj Baji Mokhtar', 'برج باجي مختار'),
(53, 'Béni Abbès', 'بني عباس'), (54, 'Timimoun', 'تيميمون'), (55, 'Touggourt', 'تقرت'),
(56, 'Djanet', 'جانت'), (57, 'In Salah', 'عين صالح'), (58, 'In Guezzam', 'عين قزام')
ON CONFLICT (id) DO NOTHING;

-- Default Delivery Fees for all wilayas (600 home, 400 desk)
INSERT INTO delivery_fees (wilaya_id, home_fee, desk_fee)
SELECT id, 600, 400 FROM wilayas
ON CONFLICT (wilaya_id) DO NOTHING;

-- Default Settings
INSERT INTO settings (key, value) VALUES
('branding', '{
  "storeName": "SacShop",
  "logo": "",
  "favicon": "",
  "primaryColor": "#10a37f",
  "secondaryColor": "#f4f4f4",
  "fontFamily": "Tajawal",
  "heroTitle": "أفضل حقائبك بنقرة واحدة",
  "heroSubtitle": "تشكيلة واسعة من الحقائب والأكياس بجودة عالية وتوصيل لجميع ولايات الجزائر",
  "whatsappNumber": "213XXXXXXXXX"
}'),
('marketing', '{
  "fbPixelId": "",
  "tiktokPixelId": "",
  "googleAnalyticsId": ""
}'),
('vip', '{
  "minOrdersForVip": 2,
  "vipBadgeText": "زبون مميز",
  "vipWelcomeMessage": "مرحباً بك من جديد! لديك عروض حصرية بانتظارك."
}'),
('email', '{
  "fromName": "SacShop.dz",
  "fromEmail": "noreply@sacshop.dz",
  "orderConfirmTemplate": "مرحباً {name}،\n\nشكراً لطلبك رقم #{order_number}.\n\nسنتواصل معك قريباً لتأكيد التوصيل.\n\nفريق SacShop.dz"
}')
ON CONFLICT (key) DO NOTHING;

-- Sample VIP Offer
INSERT INTO vip_offers (title, description, discount_type, discount_value, min_orders, is_active, expires_at)
VALUES (
  'عرض الزبون المميز',
  'مبروك! بما أنك من زبائننا الكرام، استمتع بخصم حصري على طلبك القادم.',
  'percentage',
  15,
  2,
  true,
  NOW() + INTERVAL '90 days'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_offers ENABLE ROW LEVEL SECURITY;

-- Public can read products
CREATE POLICY "public_read_products" ON products FOR SELECT USING (is_published = true);

-- Public can insert orders
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);

-- Public can read active VIP offers (for displaying on product page)
CREATE POLICY "public_read_active_offers" ON vip_offers FOR SELECT USING (is_active = true);

-- Public can read settings (for branding)  
CREATE POLICY "public_read_settings" ON settings FOR SELECT USING (true);

-- Public can read wilayas and delivery fees
CREATE POLICY "public_read_wilayas" ON wilayas FOR SELECT USING (true);

-- =====================================================
-- HELPFUL FUNCTIONS
-- =====================================================

-- Function: Auto-create or update customer on order
CREATE OR REPLACE FUNCTION upsert_customer_on_order()
RETURNS TRIGGER AS $$
DECLARE
  existing_customer_id UUID;
BEGIN
  SELECT id INTO existing_customer_id 
  FROM customers WHERE phone = NEW.customer_phone;
  
  IF existing_customer_id IS NULL THEN
    INSERT INTO customers (name, phone, email, wilaya_id, address, total_orders, total_spent, last_order_at)
    VALUES (NEW.customer_name, NEW.customer_phone, NEW.customer_email, NEW.wilaya_id, NEW.customer_address, 1, NEW.total_price, NOW())
    RETURNING id INTO existing_customer_id;
  ELSE
    UPDATE customers SET
      email = COALESCE(NEW.customer_email, customers.email),
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total_price,
      last_order_at = NOW(),
      is_vip = CASE WHEN total_orders + 1 >= 2 THEN true ELSE is_vip END
    WHERE id = existing_customer_id;
  END IF;
  
  NEW.customer_id = existing_customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run upsert_customer on every new order
DROP TRIGGER IF EXISTS on_order_insert ON orders;
CREATE TRIGGER on_order_insert
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION upsert_customer_on_order();
