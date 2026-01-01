-- =====================================================
-- MIGRATION: Create Salary Management System
-- =====================================================

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  daily_salary DECIMAL(12, 2) NOT NULL CHECK (daily_salary >= 0),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salary Payments Table
-- Tracks partial and full salary payments for employees
CREATE TABLE IF NOT EXISTS salary_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name VARCHAR(255) NOT NULL, -- Denormalized for performance
  month VARCHAR(7) NOT NULL, -- Format: YYYY/MM (Persian calendar)
  payment_date VARCHAR(20) NOT NULL, -- Persian date format: YYYY/MM/DD
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  days_worked INTEGER NOT NULL CHECK (days_worked > 0), -- Number of days this payment covers
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at);

CREATE INDEX IF NOT EXISTS idx_salary_payments_employee_id ON salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_month ON salary_payments(month);
CREATE INDEX IF NOT EXISTS idx_salary_payments_payment_date ON salary_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_salary_payments_created_at ON salary_payments(created_at);

-- Trigger for employees updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for employees" ON employees
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for salary_payments" ON salary_payments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE employees IS 'Employee information and daily salary rates';
COMMENT ON TABLE salary_payments IS 'Salary payments (can be partial payments throughout the month)';
COMMENT ON COLUMN employees.daily_salary IS 'Daily salary amount in tomans';
COMMENT ON COLUMN salary_payments.month IS 'Month in Persian format: YYYY/MM';
COMMENT ON COLUMN salary_payments.days_worked IS 'Number of days this payment covers';
COMMENT ON COLUMN salary_payments.amount IS 'Payment amount in tomans';

