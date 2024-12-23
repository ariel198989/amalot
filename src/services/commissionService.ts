import { supabase } from '@/lib/supabaseClient';

interface CommissionResult {
  scope_commission: number;
  monthly_commission: number;
  total_commission: number;
}

export const calculateCommissions = async (
  type: string,
  company: string,
  amount: number,
  annualContribution: number
): Promise<CommissionResult> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not found');

  // Get the company rates for the user
  const { data: rates } = await supabase
    .from('agent_commission_rates')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!rates) {
    throw new Error('No commission rates found');
  }

  let scopeCommission = 0;
  let monthlyCommission = 0;

  switch (type) {
    case 'pension':
      const pensionRate = rates.pension_companies?.[company]?.rate || 0;
      scopeCommission = (annualContribution * pensionRate) / 100;
      monthlyCommission = (amount * pensionRate) / 100;
      break;

    case 'insurance':
      const insuranceRate = rates.insurance_companies?.[company]?.rate || 0;
      scopeCommission = (amount * insuranceRate) / 100;
      monthlyCommission = (amount * insuranceRate) / 100;
      break;

    case 'finance':
      const financeRate = rates.financial_companies?.[company]?.rate || 0;
      scopeCommission = (amount * financeRate) / 100;
      monthlyCommission = (amount * financeRate) / 100;
      break;
  }

  return {
    scope_commission: scopeCommission,
    monthly_commission: monthlyCommission,
    total_commission: scopeCommission + monthlyCommission
  };
}; 