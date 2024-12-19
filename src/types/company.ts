export interface CompanyRates {
  id: string;
  company_id: string;
  scope_rate_per_million: number;
  monthly_rate_per_million: number;
  created_at?: string;
  updated_at?: string;
} 