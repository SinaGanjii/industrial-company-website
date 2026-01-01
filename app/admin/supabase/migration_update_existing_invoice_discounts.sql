-- =====================================================
-- MIGRATION: Update existing invoices with calculated discount
-- =====================================================

-- Update invoices where discount is NULL but there's a difference between subtotal and total
UPDATE invoices 
SET discount = GREATEST(0, subtotal - total)
WHERE discount IS NULL 
  AND subtotal > total
  AND (subtotal - total) > 0;

-- Verify the update
SELECT 
  invoice_number,
  subtotal,
  discount,
  total,
  (subtotal - COALESCE(discount, 0)) as calculated_total
FROM invoices
WHERE subtotal > total
ORDER BY created_at DESC;

