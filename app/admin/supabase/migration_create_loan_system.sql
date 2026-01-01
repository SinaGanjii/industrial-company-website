-- =====================================================
-- MIGRATION: Create Loan Management System
-- =====================================================

-- People Table (for creditors/debtors)
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table (transactions)
-- Positive amount = we lent to them (they owe us)
-- Negative amount = they lent to us (we owe them)
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  person_name VARCHAR(255) NOT NULL,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('lend', 'borrow')),
  amount DECIMAL(12, 2) NOT NULL,
  transaction_date VARCHAR(20) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);
CREATE INDEX IF NOT EXISTS idx_people_is_active ON people(is_active);
CREATE INDEX IF NOT EXISTS idx_people_created_at ON people(created_at);

CREATE INDEX IF NOT EXISTS idx_loans_person_id ON loans(person_id);
CREATE INDEX IF NOT EXISTS idx_loans_transaction_date ON loans(transaction_date);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at);

-- Trigger for people updated_at
CREATE TRIGGER update_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for people" ON people
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for loans" ON loans
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE people IS 'People we have financial transactions with (creditors/debtors)';
COMMENT ON TABLE loans IS 'Loan transactions: positive = we lent (they owe), negative = they lent (we owe)';
COMMENT ON COLUMN loans.transaction_type IS 'lend = we lent money, borrow = they lent us money';
COMMENT ON COLUMN loans.amount IS 'Amount in tomans (positive for lend, negative for borrow)';
COMMENT ON COLUMN loans.transaction_date IS 'Persian date format: YYYY/MM/DD';

