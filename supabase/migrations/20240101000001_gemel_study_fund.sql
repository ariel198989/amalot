-- Create enum for product types
create type product_type as enum ('pension', 'study_fund');

-- Create enum for insurance companies
create type insurance_company as enum (
    'harel',
    'migdal',
    'clal',
    'phoenix',
    'more',
    'yelin',
    'ayalon',
    'menora'
);

-- Create table for gemel and study fund calculations
create table if not exists gemel_study_fund (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Client Details
    client_name text not null,
    client_id text,  -- תעודת זהות
    phone text,      -- טלפון
    email text,      -- אימייל
    
    -- Product Details
    product_type product_type not null,
    company insurance_company not null,
    transfer_date date not null default current_date,
    
    -- Financial Details
    transfer_amount numeric not null check (transfer_amount >= 0),
    scope_rate numeric not null check (scope_rate >= 0),
    monthly_rate numeric not null check (monthly_rate >= 0),
    
    -- Calculated Commissions
    scope_commission numeric generated always as (
        (transfer_amount / 1000000.0) * scope_rate
    ) stored,
    monthly_commission numeric generated always as (
        transfer_amount * (monthly_rate / 100.0)
    ) stored,
    
    -- Metadata
    notes text,
    status text default 'active' check (status in ('active', 'cancelled', 'completed')),
    
    -- Timestamps
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_gemel_study_fund_user_id on gemel_study_fund(user_id);
create index if not exists idx_gemel_study_fund_product_type on gemel_study_fund(product_type);
create index if not exists idx_gemel_study_fund_company on gemel_study_fund(company);
create index if not exists idx_gemel_study_fund_transfer_date on gemel_study_fund(transfer_date);
create index if not exists idx_gemel_study_fund_status on gemel_study_fund(status);

-- Add updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_gemel_study_fund_updated_at
    before update on gemel_study_fund
    for each row
    execute function update_updated_at_column();

-- Enable RLS
alter table gemel_study_fund enable row level security;

-- RLS Policies
create policy "Users can view their own records"
    on gemel_study_fund for select
    using (auth.uid() = user_id);

create policy "Users can insert their own records"
    on gemel_study_fund for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own records"
    on gemel_study_fund for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own records"
    on gemel_study_fund for delete
    using (auth.uid() = user_id);

-- Views for analytics
create or replace view gemel_study_fund_summary as
select
    user_id,
    product_type,
    company,
    date_trunc('month', transfer_date) as month,
    count(*) as total_transfers,
    sum(transfer_amount) as total_amount,
    sum(scope_commission) as total_scope_commission,
    sum(monthly_commission) as total_monthly_commission
from gemel_study_fund
where status = 'active'
group by user_id, product_type, company, date_trunc('month', transfer_date);

-- Function to get monthly summary
create or replace function get_monthly_summary(
    p_user_id uuid,
    p_start_date date,
    p_end_date date
)
returns table (
    month date,
    product_type product_type,
    total_transfers bigint,
    total_amount numeric,
    total_scope_commission numeric,
    total_monthly_commission numeric
)
language sql
security definer
as $$
    select
        date_trunc('month', transfer_date)::date as month,
        product_type,
        count(*) as total_transfers,
        sum(transfer_amount) as total_amount,
        sum(scope_commission) as total_scope_commission,
        sum(monthly_commission) as total_monthly_commission
    from gemel_study_fund
    where 
        user_id = p_user_id
        and transfer_date between p_start_date and p_end_date
        and status = 'active'
    group by 
        date_trunc('month', transfer_date),
        product_type
    order by 
        date_trunc('month', transfer_date),
        product_type;
$$;
