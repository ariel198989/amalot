-- קודם כל נבטל את ה-constraint הקיים
ALTER TABLE customer_journeys DROP CONSTRAINT IF EXISTS customer_journeys_total_commission_check;

-- נעדכן את העמודה לקבל ערך ברירת מחדל ולאפשר null
ALTER TABLE customer_journeys 
  ALTER COLUMN total_commission SET DEFAULT 0,
  ALTER COLUMN total_commission DROP NOT NULL;

-- נוסיף constraint חדש שמוודא שהערך הוא 0 או גדול מ-0
ALTER TABLE customer_journeys 
  ADD CONSTRAINT customer_journeys_total_commission_check 
  CHECK (total_commission >= 0);

-- נעדכן את כל הרשומות הקיימות
UPDATE customer_journeys 
SET total_commission = 0 
WHERE total_commission IS NULL OR total_commission < 0;

-- בדיקה שהשינויים הוחלו
SELECT column_name, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'customer_journeys' 
AND column_name = 'total_commission';

-- אם עדיין יש בעיה, נוכל לנסות:
ALTER TABLE customer_journeys ALTER COLUMN total_commission SET DEFAULT 0;
ALTER TABLE customer_journeys ALTER COLUMN total_commission DROP NOT NULL; 