export interface SavingsClient {
  id?: string;
  date: string;
  name: string;
  company: string;
  amount: number;
  scopeCommission: number;
  monthlyCommission: number;
}

export interface PensionClient {
  id?: string;
  date: string;
  name: string;
  company: string;
  salary: number;
  accumulation: number;
  scopeCommission: number;
  monthlyCommission: number;
}

export interface InvestmentClient {
  id?: string;
  date: string;
  name: string;
  company: string;
  amount: number;
  scopeCommission: number;
  monthlyCommission: number;
}

export interface InsuranceClient {
  id?: string;
  date: string;
  name: string;
  company: string;
  insuranceType: 'personal_accident' | 'mortgage' | 'health' | 'critical_illness' | 'insurance_umbrella' | 'risk' | 'service' | 'disability';
  premium: number;
  scopeCommission: number;
  monthlyCommission: number;
}

export interface StudyFundClient {
  id?: string;
  date: string;
  name: string;
  company: string;
  amount: number;
  scopeCommission: number;
  monthlyCommission: number;
}

export interface PolicyClient {
  id?: string;
  date: string;
  name: string;
  company: string;
  amount: number;
  scopeCommission: number;
  monthlyCommission: number;
}

export interface CombinedClient {
  id?: string;
  date: string;
  name: string;
  company: string;
  selectedProducts: string;
  pensionScopeCommission: number;
  pensionAccumulationCommission: number;
  insuranceOneTimeCommission: number;
  insuranceMonthlyCommission: number;
  investmentCommission: number;
  policyScopeCommission: number;
  totalCommission: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Journey {
  id?: string;
  journey_date: string;
  client_name: string;
  client_phone?: string;
  selected_products: string[];
  selected_companies: {
    pension: string[];
    insurance: string[];
    investment: string[];
    policy: string[];
  };
  commissions: {
    pension: number;
    insurance: number;
    investment: number;
    policy: number;
  };
  total_commission: number;
  details: {
    pension?: {
      salary: number;
      accumulation: number;
      provision: number;
    };
    insurance?: {
      type: string;
      premium: number;
    };
    investment?: {
      amount: number;
    };
    policy?: {
      amount: number;
      period?: number;
    };
  };
  created_at?: string;
  user_id?: string;
}

export interface CustomerJourneyClient {
  date: string;
  name: string;
  type: string;
  amount: number;
}