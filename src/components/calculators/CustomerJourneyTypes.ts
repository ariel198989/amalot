// Types for CustomerJourney component

export interface ProductDetails {
  pension?: {
    salary: number;
    accumulation: number;
    provision: number;
  };
  insurance?: {
    premium: number;
  };
  investment?: {
    amount: number;
  };
  policy?: {
    amount: number;
  };
}

export interface CommissionResult {
  scopeCommission: number;
  monthlyCommission?: number;
  accumulationCommission?: number;
  annualCommission?: number;
  oneTimeCommission?: number;
  totalCommission: number;
  contributionRate?: number;
}

export interface ProductSelection {
  id: string;
  type: 'pension' | 'insurance' | 'savings_and_study' | 'policy';
  company: string;
  details: ProductDetails;
  commissions?: CommissionResult;
}

export interface CompanySelection {
  pension: string[];
  insurance: string[];
  investment: string[];
  policy: string[];
}

export interface CommissionDetails {
  pension: {
    companies: Record<string, {
      scopeCommission: number;
      accumulationCommission: number;
      totalCommission: number;
    }>;
    total: number;
  };
  insurance: {
    companies: Record<string, {
      oneTimeCommission: number;
      monthlyCommission: number;
      totalCommission: number;
    }>;
    total: number;
  };
  investment: {
    companies: Record<string, {
      scopeCommission: number;
      totalCommission: number;
    }>;
    total: number;
  };
  policy: {
    companies: Record<string, {
      scopeCommission: number;
      totalCommission: number;
    }>;
    total: number;
  };
}

export interface CustomerJourney {
  id?: string;
  user_id: string;
  journey_date: string;
  date: string;
  client_name: string;
  client_phone?: string;
  selected_products: string[];
  selected_companies: {
    pension: string[];
    insurance: string[];
    investment: string[];
    policy: string[];
  };
  commission_details: CommissionDetails;
  details?: ProductDetails;
  total_commission: number;
  created_at?: string;
  updated_at?: string;
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
  pensionSalary?: number;
  pensionAccumulation?: number;
  pensionProvision?: number;
  insurancePremium?: number;
  insuranceType?: string;
  investmentAmount?: number;
  policyAmount?: number;
  policyPeriod?: number;
  firstName: string;
  lastName: string;
  idNumber: string;
  selectedProducts: ProductSelection[];
  totalCommissions: number;
}

export interface MeetingData {
  client_id: string | null;
  user_id: string;
  date: string;
  summary: string;
  next_steps: string;
  status: 'completed' | 'pending' | 'cancelled';
  created_at: string;
  commission_details: CommissionDetails;
  selected_products: string[];
  selected_companies: Record<string, string[]>;
}

export interface PensionSale {
  id?: string;
  created_at: string;
  user_id: string;
  date: string;
  client_name: string;
  client_phone?: string;
  company: string;
  salary: number;
  accumulation: number;
  provision: number;
  scope_commission: number;
  accumulation_commission: number;
  total_commission: number;
  journey_id?: string;
}

export interface Product {
  id: string;
  label: string;
  description: string;
  companies: string[];
}
