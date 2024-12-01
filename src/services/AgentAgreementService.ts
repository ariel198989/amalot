import { supabase } from '@/lib/supabase';
import { AgentRates } from '../components/settings/AgentAgreements/AgentAgreementsTypes';

const DEFAULT_COMPANY_RATES = {
  scope_rate: 0,
  monthly_rate: 0,
  scope_rate_per_million: 0,
  active: false
};

export const getAgentRates = async (): Promise<AgentRates | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('agent_commission_rates')
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
  scope_rate_per_million: number;
  monthly_rate: number;
  active: boolean;
} | null> => {
  try {
    const rates = await getAgentRates();
    if (!rates) return null;

    let companyRates;
    switch (category) {
      case 'pension':
        companyRates = rates.pension_companies?.[company];
        if (!companyRates?.active) return null;
        return {
          scope_rate_per_million: companyRates.scope_rate_per_million ?? DEFAULT_COMPANY_RATES.scope_rate_per_million,
          monthly_rate: companyRates.monthly_rate ?? DEFAULT_COMPANY_RATES.monthly_rate,
          active: companyRates.active ?? DEFAULT_COMPANY_RATES.active
        };

      case 'savings_and_study':
        companyRates = rates.savings_and_study_companies?.[company];
        if (!companyRates?.active) return null;
        break;

      case 'policy':
        companyRates = rates.policy_companies?.[company];
        if (!companyRates?.active) return null;
        break;

      case 'insurance':
        if (!rates.insurance_companies?.[company]?.active) return null;
        return {
          scope_rate_per_million: rates.insurance_companies[company].products.risk.one_time_rate * 1000000,
          monthly_rate: rates.insurance_companies[company].products.risk.monthly_rate,
          active: rates.insurance_companies[company].active
        };

      default:
        return null;
    }

    if (!companyRates) return null;

    return {
      scope_rate_per_million: companyRates.scope_rate_per_million ?? DEFAULT_COMPANY_RATES.scope_rate_per_million,
      monthly_rate: companyRates.monthly_rate ?? DEFAULT_COMPANY_RATES.monthly_rate,
      active: companyRates.active ?? DEFAULT_COMPANY_RATES.active
    };
  } catch (error) {
    console.error('Error getting company rates:', error);
    return null;
  }
};

export const calculateCommissions = async (
  category: 'pension' | 'savings_and_study' | 'policy' | 'insurance',
  company: string,
  amount: number,
  accumulation?: number,
  contributionRate?: number
): Promise<{
  scope_commission: number;
  monthly_commission: number;
  total_commission: number;
} | null> => {
  try {
    const rates = await getCompanyRates(category, company);
    if (!rates || !rates.active) return null;

    let scope_commission = 0;
    let monthly_commission = 0;
    let total_commission = 0;

    // חישוב עמלת היקף חד פעמית - סכום קבוע למיליון
    const millionsInAmount = amount / 1000000;
    scope_commission = Math.round(millionsInAmount * rates.scope_rate_per_million);
    
    // חישוב עמלת נפרעים חודשית - אחוז קבוע מהסכום
    monthly_commission = Math.round(amount * rates.monthly_rate);
    
    // סה"כ עמלה שנתית: עמלת היקף + (עמלת נפרעים * 12)
    total_commission = scope_commission + (monthly_commission * 12);
    
    console.log('Commission calculation:', {
      category,
      amount,
      millions_in_amount: millionsInAmount,
      scope_rate_per_million: rates.scope_rate_per_million,
      monthly_rate: rates.monthly_rate,
      scope_commission,
      monthly_commission,
      total_commission,
      formula: {
        scope: `${millionsInAmount} מיליון * ${rates.scope_rate_per_million} = ${scope_commission} ש"ח`,
        monthly: `${amount} * ${rates.monthly_rate} = ${monthly_commission} ש"ח`,
        total: `${scope_commission} + (${monthly_commission} * 12) = ${total_commission} ש"ח`
      }
    });

    return {
      scope_commission,
      monthly_commission,
      total_commission
    };
  } catch (error) {
    console.error('Error calculating commissions:', error);
    return null;
  }
}; 