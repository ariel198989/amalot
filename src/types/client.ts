export interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  id_number: string;
  birth_date: string | null;
  xml_data: string | null;
  created_at: string;
  updated_at: string;
}

export interface PensionProduct {
  id: string;
  client_id: string;
  user_id: string;
  type: string;
  name: string;
  policy_number: string;
  start_date: string | null;
  balance: number | null;
  monthly_deposit: number | null;
  employee_contribution: number | null;
  employer_contribution: number | null;
  compensation_contribution: number | null;
  management_fees: number | null;
  deposit_management_fees: number | null;
  expected_retirement_amount: number | null;
  monthly_pension: number | null;
  insurance_cost: number | null;
  disability_coverage: number | null;
  net_return: number | null;
  profit_loss: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}