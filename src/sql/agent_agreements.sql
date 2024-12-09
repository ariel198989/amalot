-- Drop and recreate the table
DROP TABLE IF EXISTS agent_agreements CASCADE;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the table fresh
CREATE TABLE agent_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Pension companies rates
  pension_companies JSONB DEFAULT '{}'::JSONB,
  
  -- Financial products rates (savings and study)
  savings_and_study_companies JSONB DEFAULT '{}'::JSONB,
  
  -- Insurance companies rates
  insurance_companies JSONB DEFAULT '{}'::JSONB,
  
  -- Policy companies rates
  policy_companies JSONB DEFAULT '{}'::JSONB,

  -- Add unique constraint on user_id
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX agent_agreements_user_id_idx ON agent_agreements(user_id);

-- Add RLS policies
ALTER TABLE agent_agreements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own agent agreements"
  ON agent_agreements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agent agreements"
  ON agent_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent agreements"
  ON agent_agreements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to handle updates
CREATE OR REPLACE FUNCTION handle_agent_agreement_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
CREATE TRIGGER agent_agreements_updated_at
  BEFORE UPDATE ON agent_agreements
  FOR EACH ROW
  EXECUTE FUNCTION handle_agent_agreement_update();

-- Function to merge JSONB objects
CREATE OR REPLACE FUNCTION jsonb_merge(a JSONB, b JSONB)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_object_agg(
      COALESCE(ka, kb),
      CASE
        WHEN va IS NULL THEN vb
        WHEN vb IS NULL THEN va
        WHEN jsonb_typeof(va) = 'object' AND jsonb_typeof(vb) = 'object'
        THEN jsonb_merge(va, vb)
        ELSE vb
      END
    )
    FROM jsonb_each(a) AS t1(ka, va)
    FULL OUTER JOIN jsonb_each(b) AS t2(kb, vb)
    ON ka = kb
  );
END;
$$ LANGUAGE plpgsql;

-- Insert or update default rates for all users
WITH default_rates AS (
  SELECT 
    auth.users.id as user_id,
    jsonb_build_object(
      'מגדל', jsonb_build_object(
        'active', true,
        'scope_rate', 0.0025,  -- 0.25%
        'monthly_rate', 0.002  -- 0.2%
      ),
      'הראל', jsonb_build_object(
        'active', true,
        'scope_rate', 0.0025,
        'monthly_rate', 0.002
      ),
      'מנורה', jsonb_build_object(
        'active', true,
        'scope_rate', 0.0025,
        'monthly_rate', 0.002
      ),
      'כלל', jsonb_build_object(
        'active', true,
        'scope_rate', 0.0025,
        'monthly_rate', 0.002
      ),
      'הפניקס', jsonb_build_object(
        'active', true,
        'scope_rate', 0.0025,
        'monthly_rate', 0.002
      )
    ) as pension_companies,
    jsonb_build_object(
      'מגדל', jsonb_build_object(
        'active', true,
        'products', jsonb_build_object(
          'gemel', jsonb_build_object(
            'scope_commission', 6000,
            'monthly_rate', 25
          ),
          'investment_gemel', jsonb_build_object(
            'scope_commission', 6000,
            'monthly_rate', 25
          ),
          'hishtalmut', jsonb_build_object(
            'scope_commission', 6000,
            'monthly_rate', 25
          ),
          'savings_policy', jsonb_build_object(
            'scope_commission', 6000,
            'monthly_rate', 25
          )
        )
      )
    ) as savings_and_study_companies
  FROM auth.users
)
INSERT INTO agent_agreements (user_id, pension_companies, savings_and_study_companies)
SELECT 
  default_rates.user_id,
  default_rates.pension_companies,
  default_rates.savings_and_study_companies
FROM default_rates
ON CONFLICT (user_id) DO UPDATE
SET 
  pension_companies = jsonb_merge(agent_agreements.pension_companies, EXCLUDED.pension_companies),
  savings_and_study_companies = jsonb_merge(agent_agreements.savings_and_study_companies, EXCLUDED.savings_and_study_companies),
  updated_at = NOW(); 