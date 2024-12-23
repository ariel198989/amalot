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
export interface PensionProduct extends BaseProduct {
  pensionsalary: number;
  pensionaccumulation: number;
  pensioncontribution: number;
  activityType: 'transfer' | 'new_policy' | 'agent_appointment';
}

export interface PensionCommission {
  scopeCommission: number;
  monthlyCommission: number;
  totalCommission: number;
}

// Insurance specific interfaces
export interface InsuranceProduct extends BaseProduct {
  premium: number;
  insurance_type: string;
  payment_method: string;
  nifraim: number;
  scope_commission: number;
  monthly_commission: number;
  salary?: number;
  transfer_amount?: number;
  contribution_percentage?: number;
}

export interface InsuranceCommission {
  nifraim: number;
  scopeCommission: number;
  monthlyCommission: number;
  totalCommission: number;
}

// Investment specific interfaces
export interface InvestmentProduct extends BaseProduct {
  investment_amount: number;
  investment_period: number;
  investment_type: string;
  scope_commission: number;
  nifraim: number;
  total_commission?: number;
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
export interface PolicyProduct extends BaseProduct {
  policy_amount: number;
  policy_period: number;
  policy_type: string;
  scope_commission: number;
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
  type: 'pension' | 'insurance' | 'savings_and_study' | 'service' | 'finance' | 'policy';
  date: string;
  name: string;
  company: string;
  scopeCommission: number;
  monthlyCommission: number;
  totalCommission: number;
  
  // Pension fields
  pensionType?: string;
  pensionContribution?: string;
  salary?: number;
  totalAccumulated?: number;
  
  // Insurance fields
  insuranceType?: string;
  insurancePremium?: number;
  
  // Investment fields
  productType?: string;
  investmentAmount?: number;
  
  clientInfo?: ClientInfo;
}
