import { supabase } from '@/lib/supabase';
import { AgentRates } from '../components/settings/AgentAgreements/AgentAgreementsTypes';

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

export const getCompanyRates = async (category: 'pension' | 'savings_and_study' | 'policy' | 'insurance', company: string): Promise<{
  scope_rate: number;
  monthly_rate: number;
  active: boolean;
} | null> => {
  try {
    const rates = await getAgentRates();
    if (!rates) return null;

    let companyRates;
    switch (category) {
      case 'pension':
        companyRates = rates.pension_companies[company];
        break;
      case 'savings_and_study':
        companyRates = rates.savings_and_study_companies[company];
        break;
      case 'policy':
        companyRates = rates.policy_companies[company];
        break;
      case 'insurance':
        if (!rates.insurance_companies[company]?.active) return null;
        return {
          scope_rate: rates.insurance_companies[company].products.risk.one_time_rate,
          monthly_rate: rates.insurance_companies[company].products.risk.monthly_rate,
          active: rates.insurance_companies[company].active
        };
      default:
        return null;
    }

    if (!companyRates || !companyRates.active) {
      return null;
    }

    return {
      scope_rate: companyRates.scope_rate,
      monthly_rate: companyRates.monthly_rate,
      active: companyRates.active
    };
  } catch (error) {
    console.error('Error getting company rates:', error);
    return null;
  }
};

export const calculateCommissions = async (
  category: 'pension' | 'savings_and_study' | 'policy' | 'insurance',
  company: string,
  amount: number
): Promise<{
  scope_commission: number;
  monthly_commission: number;
} | null> => {
  try {
    const rates = await getCompanyRates(category, company);
    if (!rates) return null;

    let scope_commission = 0;
    let monthly_commission = 0;

    if (category === 'pension') {
      // בפנסיה:
      // 1. עמלת היקף על הפקדה: אחוז מההפקדה השנתית
      const annualDeposit = amount * 0.205; // 20.5% הפרשה סטנדרטית
      scope_commission = annualDeposit * rates.scope_rate;

      // 2. עמלת היקף על צבירה: סכום קבוע למיליון
      // נניח שהצבירה היא פי 10 מההפקדה השנתית (הערכה גסה)
      const estimatedAccumulation = annualDeposit * 10;
      monthly_commission = (estimatedAccumulation / 1000000) * rates.monthly_rate;
    } else {
      // בשאר המוצרים: שני הערכים הם אחוזים
      scope_commission = amount * rates.scope_rate;
      monthly_commission = amount * rates.monthly_rate;
    }

    return {
      scope_commission: Math.round(scope_commission),
      monthly_commission: Math.round(monthly_commission)
    };
  } catch (error) {
    console.error('Error calculating commissions:', error);
    return null;
  }
}; 