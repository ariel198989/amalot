export interface PensionCompanyRates {
  active: boolean;
  scope_rate: number;
  scope_rate_per_million: number;
}

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

export interface AgentRates {
  id?: string;
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
    [company: string]: {
      active: boolean;
      products: {
        personal_accident?: {
          one_time_rate: number;
          monthly_rate: number;
        };
        mortgage?: {
          one_time_rate: number;
          monthly_rate: number;
        };
        health?: {
          one_time_rate: number;
          monthly_rate: number;
        };
        critical_illness?: {
          one_time_rate: number;
          monthly_rate: number;
        };
        insurance_umbrella?: {
          one_time_rate: number;
          monthly_rate: number;
        };
        risk?: {
          one_time_rate: number;
          monthly_rate: number;
        };
        service?: {
          one_time_rate: number;
          monthly_rate: number;
        };
        disability?: {
          one_time_rate: number;
          monthly_rate: number;
        };
      };
    };
  };
}

export const DEFAULT_COMPANY_RATES: CompanyRates = {
  active: false,
  products: {
    gemel: {
      scope_commission: 6000,
      monthly_rate: 25
    },
    investment_gemel: {
      scope_commission: 6000,
      monthly_rate: 25
    },
    hishtalmut: {
      scope_commission: 6000,
      monthly_rate: 25
    },
    savings_policy: {
      scope_commission: 6000,
      monthly_rate: 25
    }
  }
};

export const DEFAULT_PENSION_RATES: PensionCompanyRates = {
  active: true,
  scope_rate: 0.0025,  // 0.25%
  scope_rate_per_million: 4000
};
