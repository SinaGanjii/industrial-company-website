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
  type VARCHAR(20) NOT NULL CHECK (type IN ('electricity', 'water', 'gas', 'salary', 'rent', 'other')),
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
  discount DECIMAL(12, 2) CHECK (discount >= 0), -- Promotion/discount amount in tomans (optional)
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

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salary Payments Table
CREATE TABLE IF NOT EXISTS salary_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name VARCHAR(255) NOT NULL,
  month VARCHAR(7) NOT NULL,
  payment_date VARCHAR(20) NOT NULL,
  daily_salary DECIMAL(12, 2) NOT NULL CHECK (daily_salary >= 0),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  days_worked INTEGER NOT NULL CHECK (days_worked > 0),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'check')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for employees
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);

-- Indexes for salary_payments
CREATE INDEX IF NOT EXISTS idx_salary_payments_employee_id ON salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_month ON salary_payments(month);
CREATE INDEX IF NOT EXISTS idx_salary_payments_payment_date ON salary_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_salary_payments_created_at ON salary_payments(created_at);

-- Trigger for employees updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for employees" ON employees
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for salary_payments
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for salary_payments" ON salary_payments
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE products IS 'Products manufactured in the workshop';
COMMENT ON TABLE productions IS 'Daily production records';
COMMENT ON TABLE costs IS 'Production costs (electricity, water, gas, rent, other)';
COMMENT ON TABLE sales IS 'Customer sales transactions';
COMMENT ON TABLE invoices IS 'Professional invoices with status workflow';
COMMENT ON TABLE invoice_items IS 'Items in each invoice';
COMMENT ON TABLE employees IS 'Employee information and daily salary rates';
COMMENT ON TABLE salary_payments IS 'Salary payments (can be partial payments throughout the month)';

COMMENT ON COLUMN productions.date IS 'Persian date format: YYYY/MM/DD';
COMMENT ON COLUMN costs.date IS 'Persian date format: YYYY/MM/DD';
COMMENT ON COLUMN sales.date IS 'Persian date format: YYYY/MM/DD';
COMMENT ON COLUMN invoices.date IS 'Persian date format: YYYY/MM/DD';
COMMENT ON TABLE employees IS 'Employee information (daily salary is managed per payment, not per employee)';
COMMENT ON COLUMN salary_payments.month IS 'Month in Persian format: YYYY/MM';
COMMENT ON COLUMN salary_payments.daily_salary IS 'Daily salary rate for this specific payment (for reference)';
COMMENT ON COLUMN salary_payments.days_worked IS 'Number of days this payment covers';
COMMENT ON COLUMN salary_payments.amount IS 'Payment amount in tomans (calculated automatically)';
COMMENT ON COLUMN salary_payments.payment_method IS 'Payment method: cash (نقدی), transfer (واریز), or check (چک)';

