-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS pension_sales CASCADE;
DROP TABLE IF EXISTS insurance_sales CASCADE;
DROP TABLE IF EXISTS investment_sales CASCADE;
DROP TABLE IF EXISTS policy_sales CASCADE;

-- Create base tables first
CREATE TABLE pension_sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    journey_id UUID,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    company TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    total_commission NUMERIC(12,2) DEFAULT 0,
    scope_commission NUMERIC(12,2) DEFAULT 0,
    salary NUMERIC(12,2) NOT NULL,
    accumulation NUMERIC(12,2) DEFAULT 0,
    provision NUMERIC(5,2) DEFAULT 0,
    monthly_commission NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE insurance_sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    journey_id UUID,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    company TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    total_commission NUMERIC(12,2) DEFAULT 0,
    scope_commission NUMERIC(12,2) DEFAULT 0,
    premium NUMERIC(12,2) NOT NULL,
    insurance_type TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    nifraim NUMERIC(12,2) DEFAULT 0,
    monthly_commission NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE investment_sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    journey_id UUID,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    company TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    total_commission NUMERIC(12,2) DEFAULT 0,
    scope_commission NUMERIC(12,2) DEFAULT 0,
    investment_amount NUMERIC(12,2) NOT NULL,
    investment_period INTEGER,
    investment_type TEXT NOT NULL
);

CREATE TABLE policy_sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    journey_id UUID,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    company TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    total_commission NUMERIC(12,2) DEFAULT 0,
    scope_commission NUMERIC(12,2) DEFAULT 0,
    policy_amount NUMERIC(12,2) NOT NULL,
    policy_period INTEGER,
    policy_type TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_pension_user ON pension_sales(user_id);
CREATE INDEX idx_pension_date ON pension_sales(date);
CREATE INDEX idx_insurance_user ON insurance_sales(user_id);
CREATE INDEX idx_insurance_date ON insurance_sales(date);
CREATE INDEX idx_investment_user ON investment_sales(user_id);
CREATE INDEX idx_investment_date ON investment_sales(date);
CREATE INDEX idx_policy_user ON policy_sales(user_id);
CREATE INDEX idx_policy_date ON policy_sales(date);

-- Enable Row Level Security (RLS)
ALTER TABLE pension_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own pension sales"
    ON pension_sales FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pension sales"
    ON pension_sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own insurance sales"
    ON insurance_sales FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insurance sales"
    ON insurance_sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own investment sales"
    ON investment_sales FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investment sales"
    ON investment_sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own policy sales"
    ON policy_sales FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own policy sales"
    ON policy_sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
CREATE TRIGGER update_pension_updated_at
    BEFORE UPDATE ON pension_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_updated_at
    BEFORE UPDATE ON insurance_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_updated_at
    BEFORE UPDATE ON investment_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_updated_at
    BEFORE UPDATE ON policy_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 