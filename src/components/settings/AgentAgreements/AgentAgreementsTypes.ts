export interface CompanyRates {
  active: boolean;
  // For pension
  scope_rate?: number; // Percentage
  monthly_rate?: number; // Percentage
  scope_rate_per_million?: number; // Amount per million (למשל 3000 ש"ח למיליון)
}

export interface AgentRates {
  id?: string;
  user_id: string;
  
  // Pension companies rates
  pension_companies: {
    [company: string]: CompanyRates;
  };

  // Insurance companies rates
  insurance_companies: {
    [company: string]: {
      active: boolean;
      products: {
        risk: {
          one_time_rate: number; // 65%
          monthly_rate: number; // 25%
        };
      };
    };
  };

  // Savings and study companies rates
  savings_and_study_companies: {
    [company: string]: {
      active: boolean;
      scope_rate_per_million: number; // Amount per million (e.g., 6000)
      monthly_rate_per_million: number; // Amount per million (e.g., 250)
    };
  };

  // Policy companies rates
  policy_companies: {
    [company: string]: {
      active: boolean;
      scope_rate_per_million: number; // Amount per million
      monthly_rate_per_million: number; // Amount per million
    };
  };
}

export interface InsuranceProductType {
  key: string;
  hebrewName: string;
}

export const DEFAULT_COMPANY_RATES: CompanyRates = {
  scope_rate: 0.07,  // 7% עמלת היקף על הפקדה
  monthly_rate: 0.0025,  // 0.25% עמלת היקף על הצבירה
  scope_rate_per_million: 7000,  // 7,000 ₪ למיליון
  active: true
};
