export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  created_at: string;
  last_contact: string;
  id_number: string;
  address_street: string;
  address_city: string;
  employment_type: 'employed' | 'self-employed';
  employer_name: string;
  employer_position: string;
  employer_address: string;
  employer_start_date: string;
  business_name: string;
  business_type: string;
  business_address: string;
  business_start_date: string;
  user_id: string;
  updated_at: string;
}