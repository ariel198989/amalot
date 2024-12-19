export interface FinancialProductRates {
  scope_commission: number;
  monthly_rate: number;
}

export interface CompanyRates {
  active: boolean;
  products: {
    gemel?: FinancialProductRates;
    investment_gemel?: FinancialProductRates;
    hishtalmut?: FinancialProductRates;
    savings_policy?: FinancialProductRates;
  };
}

export interface PensionCompanyRates {
  active: boolean;
  scope_rate: number;
  scope_rate_per_million: number;
}

export interface InsuranceProductRates {
  one_time_rate: number;
  monthly_rate: number;
}

export interface InsuranceCompanyRates {
  active: boolean;
  products: {
    [key: string]: InsuranceProductRates;
  };
}

export interface AgentRates {
  user_id: string;
  pension_companies: {
    [company: string]: PensionCompanyRates;
  };
  savings_and_study_companies: {
    [company: string]: CompanyRates;
  };
  policy_companies: {
    [company: string]: CompanyRates;
  };
  insurance_companies: {
    [company: string]: InsuranceCompanyRates;
  };
}

export const DEFAULT_COMPANY_RATES: CompanyRates = {
  active: false,
  products: {
    gemel: { scope_commission: 0, monthly_rate: 0 },
    investment_gemel: { scope_commission: 0, monthly_rate: 0 },
    hishtalmut: { scope_commission: 0, monthly_rate: 0 },
    savings_policy: { scope_commission: 0, monthly_rate: 0 }
  }
};

export const DEFAULT_PENSION_RATES: PensionCompanyRates = {
  active: false,
  scope_rate: 0,
  scope_rate_per_million: 0
};
