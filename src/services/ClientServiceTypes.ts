export interface PensionSale {
  user_id: string;
  client_id: string;
  date: string;
  client_name: string;
  client_phone?: string | null;
  company: string;
  salary: number;
  accumulation: number;
  provision: number;
  scope_commission: number;
  accumulation_commission: number;
  total_commission: number;
  monthly_commission?: number | null;
  transfer_commission?: number | null;
  deposit_commission?: number | null;
  commission_rate: number;
  provision_rate: number;
  transfer_amount?: number | null;
}

export interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  email?: string;
  mobile_phone?: string; // שם העמודה בבסיס הנתונים
  status: string;
  created_at: string;
  updated_at: string;
  last_contact?: string;
}

export type SaleType = 'pension' | 'insurance' | 'investment' | 'policy';
