-- Check the results
SELECT 
    client_name,
    client_phone,
    salary,
    accumulation,
    scope_commission,
    accumulation_commission,
    total_commission
FROM pension_sales
WHERE client_id = '11111111-1111-1111-1111-111111111111';
