import { supabase } from '@/lib/supabase';
import { AgentRates, DEFAULT_COMPANY_RATES } from '../components/settings/AgentAgreements/AgentAgreementsTypes';

export const getAgentRates = async (): Promise<AgentRates | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('agent_rates')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching agent rates:', error);
    return null;
  }
};

export const getCompanyRates = async (category: 'pension' | 'savings_and_study' | 'policy' | 'insurance'): Promise<{ [company: string]: any }> => {
  const rates = await getAgentRates();
  if (!rates) return {};

  switch (category) {
    case 'pension':
      return rates.pension_companies;
    case 'savings_and_study':
      return rates.savings_and_study_companies;
    case 'policy':
      return rates.policy_companies;
    case 'insurance':
      return rates.insurance_companies;
    default:
      return {};
  }
}; 