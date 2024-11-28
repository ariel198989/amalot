-- טבלת מכירות פנסיה
CREATE TABLE pension_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    client_id UUID REFERENCES clients(id),
    
    -- נתוני הפוליסה
    salary DECIMAL(12,2) NOT NULL,                -- משכורת חודשית
    provision_rate DECIMAL(5,2) NOT NULL,         -- אחוז הפרשה (18.5-22.83)
    commission_rate DECIMAL(5,2) NOT NULL,        -- אחוז עמלה (6-8)
    accumulation DECIMAL(12,2) DEFAULT 0,         -- צבירה קיימת
    
    -- עמלות מחושבות
    deposit_commission DECIMAL(12,2) GENERATED ALWAYS AS (
        salary * 12 * (commission_rate / 100) * (provision_rate / 100)
    ) STORED,                                     -- עמלה חד פעמית מהפקדה
    
    accumulation_commission DECIMAL(12,2) GENERATED ALWAYS AS (
        accumulation * 0.0003                     -- 0.3% מהצבירה
    ) STORED,                                     -- עמלה חד פעמית מצבירה
    
    total_commission DECIMAL(12,2) GENERATED ALWAYS AS (
        (salary * 12 * (commission_rate / 100) * (provision_rate / 100)) +
        (accumulation * 0.0003)
    ) STORED,                                     -- סה"כ עמלות
    
    -- מטה-דאטה
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT
);

-- אינדקסים לביצועים
CREATE INDEX idx_pension_sales_user ON pension_sales(user_id);
CREATE INDEX idx_pension_sales_client ON pension_sales(client_id);
CREATE INDEX idx_pension_sales_created ON pension_sales(created_at);

-- טריגר לעדכון updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pension_sales_updated_at
    BEFORE UPDATE ON pension_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- הרשאות
ALTER TABLE pension_sales ENABLE ROW LEVEL SECURITY;

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

-- פונקציות עזר
CREATE OR REPLACE FUNCTION calculate_pension_commission(
    p_salary DECIMAL,
    p_provision_rate DECIMAL,
    p_commission_rate DECIMAL,
    p_accumulation DECIMAL DEFAULT 0
) RETURNS TABLE (
    deposit_commission DECIMAL,
    accumulation_commission DECIMAL,
    total_commission DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_salary * 12 * (p_commission_rate / 100) * (p_provision_rate / 100),
        p_accumulation * 0.0003,
        (p_salary * 12 * (p_commission_rate / 100) * (p_provision_rate / 100)) +
        (p_accumulation * 0.0003);
END;
$$ LANGUAGE plpgsql;
