-- =====================================================
-- MIGRATION: Convert Costs to Period-Based System
-- =====================================================

-- Step 1: Add new columns for period-based costs
ALTER TABLE costs 
  ADD COLUMN IF NOT EXISTS period_type VARCHAR(10) CHECK (period_type IN ('daily', 'monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS period_value VARCHAR(20);

-- Step 2: Migrate existing data
-- All existing costs become "daily" period type
UPDATE costs 
SET 
  period_type = 'daily',
  period_value = date
WHERE period_type IS NULL OR period_value IS NULL;

-- Step 3: Set NOT NULL constraints (after migration)
ALTER TABLE costs 
  ALTER COLUMN period_type SET NOT NULL,
  ALTER COLUMN period_value SET NOT NULL;

-- Step 4: Add indexes for period queries
CREATE INDEX IF NOT EXISTS idx_costs_period_type ON costs(period_type);
CREATE INDEX IF NOT EXISTS idx_costs_period_value ON costs(period_value);
CREATE INDEX IF NOT EXISTS idx_costs_period_composite ON costs(period_type, period_value);

-- Step 5: Update comments
COMMENT ON COLUMN costs.period_type IS 'Type of period: daily, monthly, or yearly';
COMMENT ON COLUMN costs.period_value IS 'Period value: YYYY/MM/DD for daily, YYYY/MM for monthly, YYYY for yearly';
COMMENT ON COLUMN costs.date IS 'DEPRECATED: Use period_value instead. Kept for backward compatibility.';

-- Note: We keep product_id and production_date columns for now (backward compatibility)
-- They can be removed in a future migration if needed

