import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { AgentRates, CompanyRates, InsuranceProductType, DEFAULT_COMPANY_RATES } from './AgentAgreementsTypes';

export const getInsuranceProductName = (productType: string): string => {
  const productNames: { [key: string]: string } = {
    'risk': 'ביטוח סיכונים',
    'mortgage_risk': 'ביטוח משכנתא',
    'health': 'ביטוח בריאות',
    'critical_illness': 'ביטוח מחלות קשות',
    'service_letter': 'כתב שירות',
    'disability': 'ביטוח נכות'
  };
  return productNames[productType] || productType;
};

export const fetchAgentRates = async (userId: string): Promise<AgentRates | null> => {
  try {
    const { data, error } = await supabase
      .from('agent_commission_rates')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching agent rates:', error);
      toast.error('שגיאה בטעינת נתוני עמלות');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('שגיאה לא צפויה');
    return null;
  }
};

export const updateAgentRates = async (
  userId: string, 
  updatedRates: Partial<AgentRates>
): Promise<AgentRates | null> => {
  try {
    const { data, error } = await supabase
      .from('agent_commission_rates')
      .upsert({
        user_id: userId,
        ...updatedRates
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating agent rates:', error);
      toast.error('שגיאה בעדכון נתוני עמלות');
      return null;
    }

    toast.success('נתוני עמלות עודכנו בהצלחה');
    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('שגיאה לא צפויה');
    return null;
  }
};

export const getInsuranceProductTypes = (): InsuranceProductType[] => [
  { key: 'risk', hebrewName: 'ביטוח סיכונים' },
  { key: 'mortgage_risk', hebrewName: 'ביטוח משכנתא' },
  { key: 'health', hebrewName: 'ביטוח בריאות' },
  { key: 'critical_illness', hebrewName: 'ביטוח מחלות קשות' },
  { key: 'service_letter', hebrewName: 'כתב שירות' },
  { key: 'disability', hebrewName: 'ביטוח נכות' }
];
