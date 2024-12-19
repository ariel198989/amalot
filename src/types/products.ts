export interface BaseProduct {
  id: string;
  client_id: string;
  type: 'pension' | 'insurance' | 'investment' | 'policy';
  created_at?: string;
  updated_at?: string;
}

export interface ProductDetails {
  scope_commission?: number;
  monthly_commission?: number;
  total_commission: number;
  premium?: number;
  insurance_type?: string;
  payment_method?: string;
  nifraim?: boolean;
  investment_amount?: number;
  investment_period?: number;
  investment_type?: string;
  policy_amount?: number;
  policy_period?: number;
  policy_type?: string;
}

export interface PensionProduct extends BaseProduct {
  type: 'pension';
  details: ProductDetails;
}

export interface InsuranceProduct extends BaseProduct {
  type: 'insurance';
  details: ProductDetails & {
    premium: number;
    insurance_type: string;
    payment_method: string;
    nifraim: boolean;
  };
}

export interface InvestmentProduct extends BaseProduct {
  type: 'investment';
  details: ProductDetails & {
    investment_amount: number;
    investment_period: number;
    investment_type: string;
  };
}

export interface PolicyProduct extends BaseProduct {
  type: 'policy';
  details: ProductDetails & {
    policy_amount: number;
    policy_period: number;
    policy_type: string;
  };
}

export type Product = PensionProduct | InsuranceProduct | InvestmentProduct | PolicyProduct; 