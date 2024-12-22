export interface InsuranceProductRates {
  one_time_rate: number;
  monthly_rate: number;
  scope_commission?: never;
}

export interface FinancialProductRates {
  scope_commission: number;
  monthly_rate: number;
  one_time_rate?: never;
}

export interface PensionCompanyRates {
  active: boolean;
  scope_rate: number;
  scope_rate_per_million: number;
}

export interface InsuranceCompanyRates extends CompanyRates {
  products: {
    [key: string]: InsuranceProductRates;
  };
}

export interface CompanyRates {
  active: boolean;
  products: {
    [key: string]: InsuranceProductRates | FinancialProductRates;
  };
}

export interface AgentRates {
  user_id: string;
  pension_companies: {
    [key: string]: PensionCompanyRates;
  };
  insurance_companies: {
    [key: string]: InsuranceCompanyRates;
  };
  savings_and_study_companies: {
    [key: string]: CompanyRates & {
      products: {
        [key: string]: FinancialProductRates;
      };
    };
  };
  policy_companies: {
    [key: string]: CompanyRates;
  };
}

export const DEFAULT_COMPANY_RATES: CompanyRates = {
  active: false,
  products: {}
};
