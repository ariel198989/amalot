export interface ClientDetailsProps {
  client: any;
  isOpen: boolean;
  onClose: () => void;
}

export interface ClientFile {
  id?: string;
  client_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  uploaded_at: string;
}

export interface ClientActivity {
  id?: string;
  client_id: string;
  activity_type: 'meeting' | 'call' | 'email' | 'document_upload' | 'policy_change';
  description: string;
  date: string;
  user_id: string;
}

export interface ClientFinancialDetails {
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  monthly_income: number;
  investment_portfolio: Array<{
    type: string;
    amount: number;
    risk_level: 'low' | 'medium' | 'high';
  }>;
}

export interface CustomerJourney {
  id?: string;
  user_id: string;
  journey_date: string;
  date: string;
  client_name: string;
  client_phone?: string;
  selected_products: Array<{
    type: 'pension' | 'insurance' | 'investment' | 'policy';
    company: string;
    details: PensionProduct | InsuranceProduct | InvestmentProduct | PolicyProduct;
  }>;
  total_commission: number;
  created_at?: string;
  updated_at?: string;
}

// Base interface for all products
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
  total_commission: number;
}

// Pension specific interface
export interface PensionProduct extends BaseProduct {
  pensionSalary: number;
  pensionAccumulation: number;
  pensionContribution: number;
  activityType: 'transfer' | 'new_policy' | 'agent_appointment';
}

// Insurance specific interface
export interface InsuranceProduct extends BaseProduct {
  premium: number;
  insurance_type: string;
  payment_method: string;
  nifraim: number;
  scope_commission: number;
  monthly_commission: number;
}

// Investment specific interface
export interface InvestmentProduct extends BaseProduct {
  investment_amount: number;
  investment_period: number;
  investment_type: string;
  scope_commission: number;
  nifraim: number;
}

// Policy specific interface
export interface PolicyProduct extends BaseProduct {
  policy_amount: number;
  policy_period: number;
  policy_type: string;
  scope_commission: number;
}
