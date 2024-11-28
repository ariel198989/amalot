-- Create study fund calculator table
create table if not exists study_fund_calculator (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Client Details
    client_name text not null,
    company text not null,
    product_type text not null check (product_type in ('study', 'pension')),
    
    -- Financial Details
    amount numeric not null check (amount >= 0),
    scope_rate numeric not null check (scope_rate >= 0),
    monthly_rate numeric not null check (monthly_rate >= 0),
    
    -- Calculated Commissions
    scope_commission numeric not null check (scope_commission >= 0),
    monthly_commission numeric not null check (monthly_commission >= 0)
);

-- Create index for faster lookups
create index if not exists study_fund_calculator_user_id_idx on study_fund_calculator(user_id);
create index if not exists study_fund_calculator_created_at_idx on study_fund_calculator(created_at);
create index if not exists study_fund_calculator_product_type_idx on study_fund_calculator(product_type);

-- Enable Row Level Security
alter table study_fund_calculator enable row level security;

-- Create policy to allow users to see only their own records
create policy "Users can view their own records"
    on study_fund_calculator
    for select
    using (auth.uid() = user_id);

-- Create policy to allow users to insert their own records
create policy "Users can insert their own records"
    on study_fund_calculator
    for insert
    with check (auth.uid() = user_id);

-- Create policy to allow users to update their own records
create policy "Users can update their own records"
    on study_fund_calculator
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Create policy to allow users to delete their own records
create policy "Users can delete their own records"
    on study_fund_calculator
    for delete
    using (auth.uid() = user_id);

-- Create function to calculate commissions
create or replace function calculate_study_fund_commissions(
    p_amount numeric,
    p_scope_rate numeric,
    p_monthly_rate numeric
) returns table (
    scope_commission numeric,
    monthly_commission numeric
) language plpgsql as $$
begin
    return query
    select
        (p_amount / 1000000.0) * p_scope_rate as scope_commission,
        p_amount * (p_monthly_rate / 100.0) as monthly_commission;
end;
$$;
