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
