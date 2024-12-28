export interface AgentRates {
  pension_scope_rate: number;
  pension_accumulation_rate: number;
  life_insurance_scope_rate: number;
  life_insurance_monthly_rate: number;
  health_insurance_scope_rate: number;
  health_insurance_monthly_rate: number;
  disability_insurance_scope_rate: number;
  disability_insurance_monthly_rate: number;
  nursing_insurance_scope_rate: number;
  nursing_insurance_monthly_rate: number;
  provident_fund_scope_rate: number;
  provident_fund_monthly_rate: number;
  education_fund_scope_rate: number;
  education_fund_monthly_rate: number;
  company_name: string;
  user_id: string;
}

export interface AgentAgreement {
  id: string;
  user_id: string;
  company_name: string;
  rates: AgentRates;
  created_at: string;
  updated_at: string;
} 