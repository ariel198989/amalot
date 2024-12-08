-- Add missing columns to promotions table if they don't exist
DO $$ 
BEGIN
    -- Add company column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'company') THEN
        ALTER TABLE promotions ADD COLUMN company TEXT;
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'title') THEN
        ALTER TABLE promotions ADD COLUMN title TEXT;
    END IF;

    -- Add targets column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'targets') THEN
        ALTER TABLE promotions ADD COLUMN targets JSONB DEFAULT '{"pension": 0, "insurance": 0, "finance": 0}'::jsonb;
    END IF;

    -- Add prize column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'prize') THEN
        ALTER TABLE promotions ADD COLUMN prize TEXT;
    END IF;

    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'type') THEN
        ALTER TABLE promotions ADD COLUMN type TEXT DEFAULT 'personal';
    END IF;

    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'description') THEN
        ALTER TABLE promotions ADD COLUMN description TEXT;
    END IF;

    -- Add name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'name') THEN
        ALTER TABLE promotions ADD COLUMN name TEXT;
    END IF;

    -- Add start_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'start_date') THEN
        ALTER TABLE promotions ADD COLUMN start_date TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add end_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'end_date') THEN
        ALTER TABLE promotions ADD COLUMN end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'status') THEN
        ALTER TABLE promotions ADD COLUMN status TEXT DEFAULT 'ACTIVE';
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'created_at') THEN
        ALTER TABLE promotions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'promotions' AND column_name = 'updated_at') THEN
        ALTER TABLE promotions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create agent_promotions table if it doesn't exist
CREATE TABLE IF NOT EXISTS agent_promotions (
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_promotions_agent ON agent_promotions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_promotions_promotion ON agent_promotions(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_agent_promotions_updated_at ON agent_promotions;
CREATE TRIGGER update_agent_promotions_updated_at
    BEFORE UPDATE ON agent_promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotions_updated_at ON promotions;
CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE agent_promotions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own agent promotions" ON agent_promotions;
CREATE POLICY "Users can view their own agent promotions"
    ON agent_promotions FOR SELECT
    USING (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Users can insert their own agent promotions" ON agent_promotions;
CREATE POLICY "Users can insert their own agent promotions"
    ON agent_promotions FOR INSERT
    WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "Users can update their own agent promotions" ON agent_promotions;
CREATE POLICY "Users can update their own agent promotions"
    ON agent_promotions FOR UPDATE
    USING (auth.uid() = agent_id)
    WITH CHECK (auth.uid() = agent_id); 

-- Create active_promotions view
DROP VIEW IF EXISTS active_promotions;
CREATE VIEW active_promotions AS
SELECT *
FROM promotions
WHERE status = 'ACTIVE'
  AND start_date <= CURRENT_TIMESTAMP
  AND end_date >= CURRENT_TIMESTAMP; 