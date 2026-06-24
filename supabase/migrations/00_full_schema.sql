-- =====================================================
-- SAC SHOP - FULL DATABASE SCHEMA
-- Target: Professional Algerian E-commerce System
-- =====================================================

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    compare_price DECIMAL(10, 2),
    category TEXT,
    sizes JSONB DEFAULT '[]'::jsonb,
    colors JSONB DEFAULT '[]'::jsonb,
    quantity_tiers JSONB DEFAULT '[]'::jsonb,
    printing_config JSONB DEFAULT '{}'::jsonb,
    custom_variants JSONB DEFAULT '[]'::jsonb, -- NEW: Dynamic product variants
    variant_images JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    stock INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customers Table (Auto-syncs with orders)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    address TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    is_vip BOOLEAN DEFAULT FALSE,
    last_order_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders Table (Direct Order System)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT,
    product_id UUID REFERENCES products(id), -- Null if multiple items
    quantity INTEGER,
    size TEXT,
    color TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'new', -- new, confirmed, processing, shipped, delivered, cancelled
    is_fake BOOLEAN DEFAULT FALSE,
    is_duplicate BOOLEAN DEFAULT FALSE,
    cart_items JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb, -- NEW: Printing details, custom options, etc.
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VIP Offers Table
CREATE TABLE IF NOT EXISTS vip_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- percentage, fixed
    discount_value DECIMAL(10, 2) NOT NULL,
    min_orders INTEGER DEFAULT 1,
    min_spent DECIMAL(10, 2) DEFAULT 0,
    product_ids UUID[],
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER,
    uses_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Settings Table (Branding & Global Config)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_products" ON products FOR SELECT USING (is_published = true);
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read_customers" ON customers FOR SELECT USING (true);
CREATE POLICY "public_read_settings" ON settings FOR SELECT USING (true);
CREATE POLICY "public_read_vip_offers" ON vip_offers FOR SELECT USING (is_active = true);

-- Admin Override Policies
CREATE POLICY "admin_all_products" ON products FOR ALL USING (true);
CREATE POLICY "admin_all_orders" ON orders FOR ALL USING (true);
CREATE POLICY "admin_all_customers" ON customers FOR ALL USING (true);
CREATE POLICY "admin_all_settings" ON settings FOR ALL USING (true);

-- =====================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto-sync customer stats on Order Insert
CREATE OR REPLACE FUNCTION upsert_customer_on_order()
RETURNS TRIGGER AS $$
DECLARE
  existing_customer_id UUID;
BEGIN
  SELECT id INTO existing_customer_id FROM customers WHERE phone = NEW.customer_phone;
  IF existing_customer_id IS NULL THEN
    INSERT INTO customers (name, phone, email, address, total_orders, total_spent, last_order_at)
    VALUES (NEW.customer_name, NEW.customer_phone, NEW.customer_email, NEW.customer_address, 1, NEW.total_price, NOW())
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

CREATE TRIGGER on_order_insert BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION upsert_customer_on_order();

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_orders_phone ON orders(customer_phone);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_orders_status ON orders(status);
