import { supabase } from '@/lib/supabase';
import { AgentRates } from './AgentAgreementsTypes';

export const fetchAgentRates = async (userId: string): Promise<AgentRates | null> => {
  try {
    const { data, error } = await supabase
      .from('agent_rates')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching agent rates:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching agent rates:', error);
    return null;
  }
};

export const updateAgentRates = async (userId: string, rates: AgentRates): Promise<AgentRates | null> => {
  try {
    const { data, error } = await supabase
      .from('agent_rates')
      .upsert({ ...rates, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error updating agent rates:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating agent rates:', error);
    return null;
  }
};

export const getInsuranceProductTypes = () => {
  return [
    { key: 'personal_accident', label: 'תאונות אישיות' },
    { key: 'mortgage', label: 'משכנתה' },
    { key: 'health', label: 'בריאות' },
    { key: 'critical_illness', label: 'מחלות קשות' },
    { key: 'insurance_umbrella', label: 'מטריה ביטוחית' },
    { key: 'risk', label: 'ריסק' },
    { key: 'service', label: 'כתבי שירות' },
    { key: 'disability', label: 'אכע' }
  ] as const;
};
