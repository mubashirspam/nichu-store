-- ============================================
-- INVOICES TABLE SETUP FOR NICHU STORE
-- ============================================
-- This creates an invoices table to store invoice data
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  order_id UUID NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  
  -- Invoice details
  subtotal NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  
  -- Customer details (cached from order time)
  customer_name TEXT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NULL,
  
  -- Billing address (optional)
  billing_address_line1 TEXT NULL,
  billing_address_line2 TEXT NULL,
  billing_city TEXT NULL,
  billing_state TEXT NULL,
  billing_postal_code TEXT NULL,
  billing_country TEXT NULL DEFAULT 'India',
  
  -- Invoice metadata
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NULL,
  paid_date TIMESTAMP WITH TIME ZONE NULL,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('draft', 'paid', 'cancelled', 'refunded')),
  
  -- Notes
  notes TEXT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices USING btree (order_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices USING btree (invoice_number) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices USING btree (created_at DESC) TABLESPACE pg_default;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Users can only view their own invoices
CREATE POLICY "Users can view own invoices"
  ON public.invoices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices"
  ON public.invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role can insert invoices (for webhook/API)
CREATE POLICY "Service can insert invoices"
  ON public.invoices
  FOR INSERT
  WITH CHECK (true);

-- Service role can update invoices
CREATE POLICY "Service can update invoices"
  ON public.invoices
  FOR UPDATE
  USING (true);

-- 5. Create function to auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
BEGIN
  -- Format: INV-YYYYMM-XXXX (e.g., INV-202603-0001)
  year_month := TO_CHAR(NOW(), 'YYYYMM');
  
  -- Get the next sequence number for this month
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 12) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '-%';
  
  -- Generate invoice number with zero-padded sequence
  invoice_num := 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-generate invoice number on insert
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- 7. Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA INSERTION (OPTIONAL)
-- ============================================
-- Uncomment and modify to create invoices for existing orders

/*
-- Insert invoice for an existing order
INSERT INTO public.invoices (
  order_id,
  user_id,
  customer_email,
  customer_name,
  subtotal,
  discount_amount,
  total_amount,
  currency,
  status,
  paid_date
)
SELECT 
  o.id as order_id,
  o.user_id,
  p.email as customer_email,
  p.full_name as customer_name,
  o.total_amount + o.discount_amount as subtotal,
  o.discount_amount,
  o.total_amount,
  o.currency,
  CASE WHEN o.status = 'completed' THEN 'paid' ELSE 'draft' END as status,
  CASE WHEN o.status = 'completed' THEN o.created_at ELSE NULL END as paid_date
FROM public.orders o
JOIN public.profiles p ON p.id = o.user_id
WHERE o.id = 'YOUR_ORDER_ID_HERE'; -- Replace with actual order ID
*/

-- ============================================
-- BULK INSERT FOR ALL EXISTING ORDERS
-- ============================================
-- Uncomment to create invoices for ALL existing orders

/*
INSERT INTO public.invoices (
  order_id,
  user_id,
  customer_email,
  customer_name,
  subtotal,
  discount_amount,
  total_amount,
  currency,
  status,
  paid_date,
  invoice_date
)
SELECT 
  o.id as order_id,
  o.user_id,
  p.email as customer_email,
  p.full_name as customer_name,
  o.total_amount + o.discount_amount as subtotal,
  o.discount_amount,
  o.total_amount,
  o.currency,
  CASE WHEN o.status = 'completed' THEN 'paid' ELSE 'draft' END as status,
  CASE WHEN o.status = 'completed' THEN o.created_at ELSE NULL END as paid_date,
  o.created_at as invoice_date
FROM public.orders o
JOIN public.profiles p ON p.id = o.user_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.invoices i WHERE i.order_id = o.id
);
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup

-- Check if table was created
-- SELECT * FROM public.invoices LIMIT 5;

-- Check if policies are active
-- SELECT * FROM pg_policies WHERE tablename = 'invoices';

-- Test invoice number generation
-- SELECT generate_invoice_number();

-- Count invoices
-- SELECT COUNT(*) FROM public.invoices;
