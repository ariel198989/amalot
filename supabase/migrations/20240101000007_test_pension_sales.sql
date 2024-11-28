-- Test data: First create a test user and client
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (
    id,
    user_id,
    first_name,
    last_name,
    id_number,
    mobile_phone,
    status
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'ישראל',
    'ישראלי',
    '123456789',
    '0501234567',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Now insert a pension sale
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
