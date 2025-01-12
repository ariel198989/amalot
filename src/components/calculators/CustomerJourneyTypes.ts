// Base interfaces for all products
export interface BaseProduct {
  id?: string;
  user_id: string;
  journey_id?: string;
  client_name: string;
  client_phone?: string;
  company: string;
  date: string;
  created_at?: string;
  updated_at?: string;
  total_commission?: number;
  scope_commission?: number;
  monthly_commission?: number;
}

// Client Info interface
export interface ClientInfo {
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  occupation?: string;
  birthday?: string;
  maritalStatus?: string;
  numChildren?: number;
  monthlyIncome?: number;
}

// Pension specific interfaces
export interface PensionProduct {
  id?: string;
  user_id: string;
  client_name: string;
  company: string;
  date: string;
  pensionsalary: number;
  pensionaccumulation: number;
  pensioncontribution: number;
  activityType: string;
  total_commission: number;
  scope_commission: number;
  monthly_commission: number;
  agent_number: string;
}

export interface PensionCommission {
  scopeCommission: number;
  monthlyCommission: number;
  totalCommission: number;
}

// Insurance specific interfaces
export interface InsuranceProduct {
  id?: string;
  user_id: string;
  client_name: string;
  company: string;
  date: string;
  premium: number;
  annual_premium: number;
  insurance_type: string;
  payment_method: string;
  nifraim: number;
  scope_commission: number;
  monthly_commission: number;
  total_commission: number;
  agent_number: string;
}

export interface InsuranceCommission {
  nifraim: number;
  scopeCommission: number;
  monthlyCommission: number;
  totalCommission: number;
}

// Investment specific interfaces
export interface InvestmentProduct {
  id?: string;
  user_id: string;
  client_name: string;
  company: string;
  date: string;
  investment_amount: number;
  investment_type: string;
  nifraim: number;
  total_commission: number;
  scope_commission: number;
  monthly_commission: number;
  agent_number: string;
}

export interface InvestmentCommission {
  scope_commission: number;
  nifraim: number;
  total_commission: number;
}

// Investment rates interface
export interface InvestmentRates {
  scope_rate_per_million: number;
  nifraim_rate_per_million: number;
  active: boolean;
}

// Policy specific interfaces
export interface PolicyProduct {
  id?: string;
  user_id: string;
  client_name: string;
  company: string;
  date: string;
  policy_amount: number;
  policy_period: number;
  policy_type: string;
  total_commission: number;
  scope_commission: number;
  monthly_commission: number;
  agent_number: string;
}

export interface PolicyCommission {
  scopeCommission: number;
  totalCommission: number;
}

// Customer Journey interfaces
export interface CustomerJourney {
  id?: string;
  user_id: string;
  journey_date: string;
  date: string;
  client_name: string;
  client_phone?: string;
  selected_products: Array<JourneyProduct>;
  total_commission: number;
  commissionDetails: CommissionDetails;
  created_at?: string;
  updated_at?: string;
}

export type JourneyProduct = {
  type: 'pension' | 'insurance' | 'investment' | 'policy';
  company: string;
  details: PensionProduct | InsuranceProduct | InvestmentProduct | PolicyProduct;
};

export interface CommissionDetails {
  pension: {
    companies: Record<string, PensionCommission>;
    total: number;
  };
  insurance: {
    companies: Record<string, InsuranceCommission>;
    total: number;
  };
  investment: {
    companies: Record<string, InvestmentCommission>;
    total: number;
  };
  policy: {
    companies: Record<string, PolicyCommission>;
    total: number;
  };
}

export interface FormData {
  clientName: string;
  clientId: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientCity?: string;
  clientOccupation?: string;
  clientBirthday?: string;
  clientMaritalStatus?: string;
  clientNumChildren?: number;
  clientMonthlyIncome?: number;
  selectedProducts: Array<{
    type: 'pension' | 'insurance' | 'investment' | 'policy';
    company: string;
    details: PensionProduct | InsuranceProduct | InvestmentProduct | PolicyProduct;
  }>;
  totalCommissions: number;
}

export interface Product {
  id: string;
  label: string;
  description: string;
  companies: string[];
}

export interface CustomerJourneyClient {
  type: 'pension' | 'insurance' | 'savings_and_study' | 'service' | 'finance';
  date: string;
  name: string;
  company: string;
  insuranceType?: string;
  productType?: string;
  serviceType?: string;
  financeType?: string;
  pensionType?: string;
  pensionContribution?: string;
  salary?: number;
  totalAccumulated?: number;
  insurancePremium?: number;
  investmentAmount?: number;
  scope_commission: number;
  monthly_commission: number;
  total_commission: number;
  clientInfo: { phone: string } | null;
  agent_number: string;
}

export type ProductType = 'pension' | 'insurance' | 'savings_and_study' | 'service' | 'finance';
