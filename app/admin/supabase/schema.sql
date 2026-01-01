-- =====================================================
-- SUPABASE DATABASE SCHEMA
-- Industrial Accounting System for Concrete Manufacturing
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  dimensions VARCHAR(100) NOT NULL,
  material VARCHAR(100),
  unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productions Table
CREATE TABLE IF NOT EXISTS productions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL, -- Denormalized for performance
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  date VARCHAR(20) NOT NULL, -- Persian date format: YYYY/MM/DD
  shift VARCHAR(10) NOT NULL CHECK (shift IN ('صبح', 'عصر', 'شب')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Costs Table
CREATE TABLE IF NOT EXISTS costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('electricity', 'water', 'gas', 'salary', 'other')),
  type_label VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  date VARCHAR(20) NOT NULL, -- Persian date format: YYYY/MM/DD
  description TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- Optional link to product
  production_date VARCHAR(20), -- Optional link to production date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID, -- Link to invoice if exists (nullable)
  customer_name VARCHAR(255) NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL, -- Denormalized for performance
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(12, 2) NOT NULL CHECK (total_price >= 0),
  date VARCHAR(20) NOT NULL, -- Persian date format: YYYY/MM/DD
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'approved', 'paid')) DEFAULT 'draft',
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT,
  customer_phone VARCHAR(50),
  customer_tax_id VARCHAR(50),
  subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(12, 2) CHECK (tax >= 0) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
  date VARCHAR(20) NOT NULL, -- Persian date format: YYYY/MM/DD
  due_date VARCHAR(20), -- Optional due date
  paid_date VARCHAR(20), -- Date when invoice was paid
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items Table (separate table for invoice items)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  dimensions VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
  total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Productions indexes
CREATE INDEX IF NOT EXISTS idx_productions_product_id ON productions(product_id);
CREATE INDEX IF NOT EXISTS idx_productions_date ON productions(date);
CREATE INDEX IF NOT EXISTS idx_productions_created_at ON productions(created_at);

-- Costs indexes
CREATE INDEX IF NOT EXISTS idx_costs_type ON costs(type);
CREATE INDEX IF NOT EXISTS idx_costs_date ON costs(date);
CREATE INDEX IF NOT EXISTS idx_costs_product_id ON costs(product_id);
CREATE INDEX IF NOT EXISTS idx_costs_created_at ON costs(created_at);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_invoice_id ON sales(invoice_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_customer_name ON sales(customer_name);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_name ON invoices(customer_name);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- Invoice Items indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for products table
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for invoices table
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for authenticated users
-- (You can customize these based on your authentication needs)

-- Products policies
CREATE POLICY "Allow all for authenticated users" ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Productions policies
CREATE POLICY "Allow all for authenticated users" ON productions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Costs policies
CREATE POLICY "Allow all for authenticated users" ON costs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sales policies
CREATE POLICY "Allow all for authenticated users" ON sales
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Invoices policies
CREATE POLICY "Allow all for authenticated users" ON invoices
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Invoice Items policies
CREATE POLICY "Allow all for authenticated users" ON invoice_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- FUNCTIONS (Optional - for complex queries)
-- =====================================================

-- Function to calculate stock for a product
CREATE OR REPLACE FUNCTION calculate_product_stock(product_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_production INTEGER;
  total_sales INTEGER;
BEGIN
  -- Get total production
  SELECT COALESCE(SUM(quantity), 0) INTO total_production
  FROM productions
  WHERE product_id = product_uuid;
  
  -- Get total sales
  SELECT COALESCE(SUM(quantity), 0) INTO total_sales
  FROM sales
  WHERE product_id = product_uuid;
  
  -- Return remaining stock (never negative)
  RETURN GREATEST(0, total_production - total_sales);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS (Optional - for reporting)
-- =====================================================

-- View for current stock status
CREATE OR REPLACE VIEW stock_status AS
SELECT 
  p.id AS product_id,
  p.name AS product_name,
  COALESCE(SUM(prod.quantity), 0) AS total_production,
  COALESCE(SUM(s.quantity), 0) AS total_sales,
  GREATEST(0, COALESCE(SUM(prod.quantity), 0) - COALESCE(SUM(s.quantity), 0)) AS remaining_stock,
  NOW() AS last_updated
FROM products p
LEFT JOIN productions prod ON p.id = prod.product_id
LEFT JOIN sales s ON p.id = s.product_id
GROUP BY p.id, p.name;

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE products IS 'Products manufactured in the workshop';
COMMENT ON TABLE productions IS 'Daily production records';
COMMENT ON TABLE costs IS 'Production costs (electricity, water, gas, salaries)';
COMMENT ON TABLE sales IS 'Customer sales transactions';
COMMENT ON TABLE invoices IS 'Professional invoices with status workflow';
COMMENT ON TABLE invoice_items IS 'Items in each invoice';

COMMENT ON COLUMN productions.date IS 'Persian date format: YYYY/MM/DD';
COMMENT ON COLUMN costs.date IS 'Persian date format: YYYY/MM/DD';
COMMENT ON COLUMN sales.date IS 'Persian date format: YYYY/MM/DD';
COMMENT ON COLUMN invoices.date IS 'Persian date format: YYYY/MM/DD';

