export interface CompanyRates {
  active: boolean;
  scope_rate_per_million: number;
  monthly_rate_per_million: number;
}

export interface AgentRates {
  id?: string;
  user_id: string;
  
  pension_companies: {
    [company: string]: {
      active: boolean;
      scope_rate: number;
      scope_rate_per_million: number;
    };
  };

  savings_and_study_companies: {
    [company: string]: CompanyRates;
  };

  policy_companies: {
    [company: string]: CompanyRates;
  };

  insurance_companies: {
    [company: string]: {
      active: boolean;
      products: {
        [key: string]: {
          one_time_rate: number;
          monthly_rate: number;
        };
      };
    };
  };
}

export const DEFAULT_COMPANY_RATES: CompanyRates = {
  active: false,
  scope_rate_per_million: 0,
  monthly_rate_per_million: 0
};
