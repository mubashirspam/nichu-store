-- ═══════════════════════════════════════════════════════════════
-- NIZAM STORE - Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. PROFILES ────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 2. PRODUCTS ────────────────────────────────────────────
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  features JSONB NOT NULL DEFAULT '[]',
  icon_name TEXT NOT NULL DEFAULT 'Dumbbell',
  color TEXT NOT NULL DEFAULT 'emerald',
  badge TEXT,
  file_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 3. CART ITEMS ──────────────────────────────────────────
CREATE TABLE public.cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 4. ORDERS ──────────────────────────────────────────────
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  offer_code_id UUID,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 5. ORDER ITEMS ─────────────────────────────────────────
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 6. OFFER CODES ────────────────────────────────────────
CREATE TABLE public.offer_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER offer_codes_updated_at
  BEFORE UPDATE ON public.offer_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add FK to orders
ALTER TABLE public.orders
  ADD CONSTRAINT fk_orders_offer_code
  FOREIGN KEY (offer_code_id) REFERENCES public.offer_codes(id) ON DELETE SET NULL;

-- ─── 7. OFFER CODE USAGE ───────────────────────────────────
CREATE TABLE public.offer_code_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  offer_code_id UUID NOT NULL REFERENCES public.offer_codes ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders ON DELETE CASCADE,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(offer_code_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── PROFILES RLS ───────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admin can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- ─── PRODUCTS RLS ───────────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Admin can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- ─── CART ITEMS RLS ─────────────────────────────────────────
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- ─── ORDERS RLS ─────────────────────────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin());

-- ─── ORDER ITEMS RLS ────────────────────────────────────────
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Authenticated users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ─── OFFER CODES RLS ───────────────────────────────────────
ALTER TABLE public.offer_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active offer codes"
  ON public.offer_codes FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert offer codes"
  ON public.offer_codes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update offer codes"
  ON public.offer_codes FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin can delete offer codes"
  ON public.offer_codes FOR DELETE
  USING (public.is_admin());

-- ─── OFFER CODE USAGE RLS ──────────────────────────────────
ALTER TABLE public.offer_code_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON public.offer_code_usage FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can insert usage"
  ON public.offer_code_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_offer_codes_code ON public.offer_codes(code);
CREATE INDEX idx_offer_code_usage_code ON public.offer_code_usage(offer_code_id);
CREATE INDEX idx_offer_code_usage_user ON public.offer_code_usage(user_id);

-- ═══════════════════════════════════════════════════════════════
-- SEED: Insert default products
-- ═══════════════════════════════════════════════════════════════
INSERT INTO public.products (name, short_name, description, price, original_price, currency, features, icon_name, color, badge, file_url) VALUES
(
  'Ultimate Fitness Tracker',
  'Fitness Tracker',
  'The all-in-one Excel spreadsheet to track workouts, nutrition, body measurements, sleep, water intake and more. Beautiful charts auto-generated.',
  1, 599, 'INR',
  '["Daily workout log with exercise library", "Calorie & macro nutrition tracker", "Body measurement progress charts", "Sleep & water intake tracking", "Auto-generated weekly/monthly graphs", "BMI & body fat calculator", "Printable & works on mobile", "Lifetime free updates"]',
  'Dumbbell', 'emerald', 'Best Seller', '/Ultimate-Fitness-Tracker.xlsx'
),
(
  'Workout Log Pro',
  'Workout Log',
  'A detailed workout tracking Excel sheet with exercise database, set/rep logging, progressive overload tracking and strength progress charts.',
  1, 399, 'INR',
  '["200+ exercise database", "Set, rep & weight logging", "Progressive overload tracker", "Strength progress charts", "Rest day planner", "Personal records dashboard"]',
  'TrendingUp', 'blue', NULL, '/Workout-Log-Pro.xlsx'
),
(
  'Nutrition & Diet Planner',
  'Diet Planner',
  'Plan your meals, track macros, count calories and visualise your nutrition journey with beautiful auto-charts in Excel.',
  1, 499, 'INR',
  '["Meal planning templates", "Calorie & macro calculator", "Grocery list generator", "Water intake tracker", "Weekly nutrition charts", "Diet comparison dashboard"]',
  'Apple', 'orange', NULL, '/Nutrition-Diet-Planner.xlsx'
),
(
  'Body Measurement Tracker',
  'Body Tracker',
  'Track every body measurement over time — weight, waist, chest, arms, thighs and more. Watch your transformation with auto-generated charts.',
  1, 299, 'INR',
  '["12+ body measurements", "Progress photo log", "BMI & body fat calculator", "Before/after comparison", "Monthly progress charts", "Goal setting dashboard"]',
  'Ruler', 'pink', NULL, '/Body-Measurement-Tracker.xlsx'
);

-- ═══════════════════════════════════════════════════════════════
-- IMPORTANT: After running this schema and signing up,
-- run this query to make yourself admin:
--
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@example.com';
-- ═══════════════════════════════════════════════════════════════
