export interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  email?: string;
  mobile_phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_contact?: string;
  total_pension_sales: number;
  total_revenue: number;
  total_commission: number;
  total_policies: number;
}