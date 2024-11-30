export interface CompanyRates {
  scope_rate: number;  // עמלת היקף על הפקדה
  monthly_rate: number;  // עמלת היקף על הצבירה
  scope_rate_per_million?: number;  // עמלת היקף למיליון
  active: boolean;
}

export interface AgentRates {
  id?: string;
  user_id?: string;
  pension_companies: {
    [company: string]: CompanyRates;
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
        risk: { one_time_rate: number; monthly_rate: number; };  // עמלת היקף על הפקדה, עמלת היקף על הצבירה
        mortgage_risk: { one_time_rate: number; monthly_rate: number; };
        health: { one_time_rate: number; monthly_rate: number; };
        critical_illness: { one_time_rate: number; monthly_rate: number; };
        service_letter: { one_time_rate: number; monthly_rate: number; };
        disability: { one_time_rate: number; monthly_rate: number; };
      };
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
