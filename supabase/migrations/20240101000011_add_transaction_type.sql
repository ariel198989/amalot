-- Add transaction_type column to pension_sales
ALTER TABLE pension_sales 
ADD COLUMN transaction_type TEXT CHECK (transaction_type IN ('proposal', 'agent_appointment'));

-- Set default value for existing records
UPDATE pension_sales 
SET transaction_type = 'proposal' 
WHERE transaction_type IS NULL; 