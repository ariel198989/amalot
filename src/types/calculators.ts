export interface SavingsClient {
  date: string;
  name: string;
  company: string;
  amount: number;
  scopeCommission: number;
  monthlyCommission: number;
}

export interface PensionClient {
  date: string;
  name: string;
  company: string;
  salary: number;
  accumulation: number;
  provision: number;
  scopeCommission: number;
  accumulationCommission: number;
  totalCommission: number;
}

export interface InvestmentClient {
  date: string;
  name: string;
  company: string;
  amount: number;
  scopeCommission: number;
  monthlyCommission: number;
}

export interface InsuranceClient {
  date: string;
  name: string;
  company: string;
  insuranceType: string;
  monthlyPremium: number;
  oneTimeCommissionRate: number;
  oneTimeCommission: number;
  monthlyCommissionRate: number;
  monthlyCommission: number;
}

export interface InvestmentCompanyData {
  scopeRate: number;
  monthlyRate: number;
}

export interface CompanyRates {
  [key: string]: {
    scopeRate: number;
    monthlyRate: number;
  };
}

export interface PolicyClient {
  date: string;
  name: string;
  company: string;
  policyType: string;
  depositAmount: number;
  totalDeposit: number;
  oneTimeCommission: number;
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

export const COMPANY_RATES: CompanyRates = {
  'harel': { scopeRate: 6000, monthlyRate: 0.00025 },
  'migdal': { scopeRate: 7000, monthlyRate: 0.00025 },
  'clal': { scopeRate: 7000, monthlyRate: 0.00025 },
  'phoenix': { scopeRate: 6500, monthlyRate: 0.00025 },
  'more': { scopeRate: 4000, monthlyRate: 0.00025 },
  'yelin': { scopeRate: 4000, monthlyRate: 0.00025 }
};