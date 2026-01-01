-- =====================================================
-- MIGRATION: Add payment_method to salary_payments
-- =====================================================

-- Add payment_method column to salary_payments table
ALTER TABLE salary_payments
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'transfer', 'check'));

-- Set default value for existing records
UPDATE salary_payments
SET payment_method = 'cash'
WHERE payment_method IS NULL;

-- Set NOT NULL constraint after updating existing data
ALTER TABLE salary_payments
  ALTER COLUMN payment_method SET NOT NULL;

-- Add comment
COMMENT ON COLUMN salary_payments.payment_method IS 'Payment method: cash (نقدی), transfer (واریز), or check (چک)';

