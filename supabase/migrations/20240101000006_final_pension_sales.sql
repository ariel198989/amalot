-- Drop existing table
DROP TABLE IF EXISTS pension_sales;

-- Create pension sales table
CREATE TABLE pension_sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    client_id UUID REFERENCES clients(id),
    date DATE DEFAULT CURRENT_DATE,
    client_name TEXT,
    client_phone TEXT,
    company TEXT,
    
    -- Policy details
    salary NUMERIC(12,2) DEFAULT 0,
    accumulation NUMERIC(12,2) DEFAULT 0,
    provision NUMERIC(12,2) DEFAULT 0,
    
    -- Commission details
    scope_commission NUMERIC(12,2) DEFAULT 0,
    accumulation_commission NUMERIC(12,2) DEFAULT 0,
    monthly_commission NUMERIC(12,2),
    transfer_commission NUMERIC(12,2),
    deposit_commission NUMERIC(12,2),
    total_commission NUMERIC(12,2) DEFAULT 0,
    
    -- Rates
    commission_rate NUMERIC(5,2),
    provision_rate NUMERIC(5,2),
    transfer_amount NUMERIC(12,2),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    
    -- Constraints
    CONSTRAINT provision_rate_check CHECK (
        provision_rate IS NULL OR 
        (provision_rate BETWEEN 18.5 AND 23.0)
    ),
    CONSTRAINT commission_rate_check CHECK (
        commission_rate IS NULL OR 
        (commission_rate BETWEEN 6.0 AND 8.0)
    )
);

-- Create indexes
CREATE INDEX idx_pension_sales_user ON pension_sales(user_id);
CREATE INDEX idx_pension_sales_client ON pension_sales(client_id);
CREATE INDEX idx_pension_sales_created ON pension_sales(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pension_sales_updated_at
    BEFORE UPDATE ON pension_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-fill client details if not provided
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
        -- Deposit commission
        IF NEW.salary > 0 THEN
            NEW.scope_commission := NEW.salary * 12 * (NEW.commission_rate / 100) * (NEW.provision_rate / 100);
        END IF;

        -- Accumulation commission
        IF NEW.accumulation > 0 THEN
            NEW.accumulation_commission := NEW.accumulation * 0.0003;
        END IF;
    END IF;

    -- Calculate total commission
    NEW.total_commission := COALESCE(NEW.scope_commission, 0) + 
                          COALESCE(NEW.accumulation_commission, 0) +
                          COALESCE(NEW.monthly_commission, 0) +
                          COALESCE(NEW.transfer_commission, 0) +
                          COALESCE(NEW.deposit_commission, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_pension_sales_insert
    BEFORE INSERT ON pension_sales
    FOR EACH ROW
    EXECUTE FUNCTION fill_client_details();

-- Enable RLS
ALTER TABLE pension_sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own pension sales"
    ON pension_sales FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pension sales"
    ON pension_sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pension sales"
    ON pension_sales FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
