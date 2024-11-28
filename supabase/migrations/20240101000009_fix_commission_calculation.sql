-- Drop existing trigger and function
DROP TRIGGER IF EXISTS before_pension_sales_insert ON pension_sales;
DROP FUNCTION IF EXISTS fill_client_details();

-- Create updated trigger function with fixed calculation
CREATE OR REPLACE FUNCTION fill_client_details()
RETURNS TRIGGER AS $$
BEGIN
    -- Only fill client details if they're not provided
    IF NEW.client_name IS NULL OR NEW.client_phone IS NULL THEN
        SELECT 
            first_name || ' ' || last_name,
            mobile_phone
        INTO 
            NEW.client_name,
            NEW.client_phone
        FROM clients 
        WHERE id = NEW.client_id;
    END IF;

    -- Calculate commissions if rates are provided
    IF NEW.commission_rate IS NOT NULL AND NEW.provision_rate IS NOT NULL THEN
        -- Scope commission (הפקדה)
        IF NEW.salary > 0 THEN
            -- Calculation: yearly_salary * commission_rate * provision_rate
            NEW.scope_commission := ROUND(
                (NEW.salary * 12 * (NEW.commission_rate / 100) * (NEW.provision_rate / 100))::numeric, 
                2
            );
        END IF;

        -- Accumulation commission (צבירה)
        IF NEW.accumulation > 0 THEN
            NEW.accumulation_commission := ROUND(
                (NEW.accumulation * 0.0003)::numeric,
                2
            );
        END IF;
    END IF;

    -- Calculate total commission
    NEW.total_commission := ROUND(
        (COALESCE(NEW.scope_commission, 0) + 
        COALESCE(NEW.accumulation_commission, 0) +
        COALESCE(NEW.monthly_commission, 0) +
        COALESCE(NEW.transfer_commission, 0) +
        COALESCE(NEW.deposit_commission, 0))::numeric,
        2
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER before_pension_sales_insert
    BEFORE INSERT ON pension_sales
    FOR EACH ROW
    EXECUTE FUNCTION fill_client_details();

-- Test the calculation
INSERT INTO pension_sales (
    user_id,
    client_id,
    salary,
    commission_rate,
    provision_rate,
    accumulation
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    20000,
    8,
    21.83,
    1000000
);

-- Check results
SELECT 
    client_name,
    salary,
    commission_rate,
    provision_rate,
    scope_commission,
    accumulation,
    accumulation_commission,
    total_commission
FROM pension_sales
WHERE client_id = '11111111-1111-1111-1111-111111111111'
ORDER BY created_at DESC
LIMIT 1;
