-- Drop existing indexes
DROP INDEX IF EXISTS idx_promotions_company;
DROP INDEX IF EXISTS idx_promotions_status;
DROP INDEX IF EXISTS idx_promotions_dates;
DROP INDEX IF EXISTS idx_agent_promotions_agent;
DROP INDEX IF EXISTS idx_agent_promotions_promotion;

-- Drop existing tables and functions
DROP TABLE IF EXISTS agent_promotions;
DROP TABLE IF EXISTS promotions;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS check_promotion_active CASCADE;
DROP VIEW IF EXISTS active_promotions;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create promotions table
CREATE TABLE promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('personal', 'team', 'branch')),
    targets JSONB NOT NULL DEFAULT '{"pension": 0, "insurance": 0, "finance": 0}'::jsonb,
    description TEXT,
    prize TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'COMPLETED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_promotions table
CREATE TABLE agent_promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id UUID REFERENCES auth.users(id),
    promotion_id UUID REFERENCES promotions(id),
    progress NUMERIC(12,2) DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_agent_promotion UNIQUE(agent_id, promotion_id)
);

-- Create function to check if promotion is active
CREATE OR REPLACE FUNCTION check_promotion_active(
    p_status TEXT,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN p_status = 'ACTIVE' AND 
           NOW() BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create view for active promotions
CREATE OR REPLACE VIEW active_promotions AS
SELECT 
    *,
    check_promotion_active(status, start_date, end_date) as is_active
FROM promotions;

-- Create indexes
CREATE INDEX idx_promotions_company ON promotions(company);
CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_agent_promotions_agent ON agent_promotions(agent_id);
CREATE INDEX idx_agent_promotions_promotion ON agent_promotions(promotion_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_promotions_updated_at
    BEFORE UPDATE ON agent_promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_promotions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for promotions
CREATE POLICY "Users can view all promotions"
    ON promotions FOR SELECT
    USING (true);

CREATE POLICY "Users can create promotions"
    ON promotions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update promotions"
    ON promotions FOR UPDATE
    USING (true);

-- Create RLS policies for agent_promotions
CREATE POLICY "Users can view their own agent promotions"
    ON agent_promotions FOR SELECT
    USING (auth.uid() = agent_id);

CREATE POLICY "Users can insert their own agent promotions"
    ON agent_promotions FOR INSERT
    WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Users can update their own agent promotions"
    ON agent_promotions FOR UPDATE
    USING (auth.uid() = agent_id)
    WITH CHECK (auth.uid() = agent_id); 