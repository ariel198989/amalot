import { supabase } from '@/lib/supabase';
import { AgentRates } from '../components/settings/AgentAgreements/AgentAgreementsTypes';

const DEFAULT_COMPANY_RATES = {
  scope_rate: 0,
  monthly_rate: 0,
  scope_rate_per_million: 0,
  active: false
};

interface CompanyRates {
  scope_rate?: number;
  scope_rate_per_million: number;
  monthly_rate?: number;
  active: boolean;
}

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

export const getCompanyRates = async (
  category: 'pension' | 'savings_and_study' | 'policy' | 'insurance',
  company: string,
  options?: {
    insuranceType?: 'personal_accident' | 'mortgage' | 'health' | 'critical_illness' | 'insurance_umbrella' | 'risk' | 'service' | 'disability';
    amount?: number;
    contributionRate?: number;
    accumulation?: number;
    pensionType?: 'comprehensive' | 'supplementary';
    investmentAmount?: number;
    productType?: 'managers' | 'gemel' | 'hishtalmut' | 'investment_gemel' | 'savings_policy';
  }
): Promise<{
  scope_commission: number;
  monthly_commission: number;
}> => {
  try {
    const rates = await getAgentRates();
    if (!rates) return { scope_commission: 0, monthly_commission: 0 };

    let scope_commission = 0;
    let monthly_commission = 0;

    switch (category) {
      case 'pension':
        const pensionRates = rates.pension_companies?.[company];
        if (!pensionRates?.active) return { scope_commission: 0, monthly_commission: 0 };

        if (options?.amount && options?.contributionRate && pensionRates.scope_rate) {
          scope_commission = options.amount * pensionRates.scope_rate * 12 * options.contributionRate;
        }

        if (options?.accumulation && options.accumulation > 0) {
          const millionsInAccumulation = options.accumulation / 1000000;
          monthly_commission = millionsInAccumulation * (pensionRates.scope_rate_per_million || 0);
        }
        break;

      case 'savings_and_study':
        const savingsRates = rates.savings_and_study_companies?.[company];
        if (!savingsRates?.active) return { scope_commission: 0, monthly_commission: 0 };

        if (options?.investmentAmount && options?.productType) {
          const amount = options.investmentAmount;
          scope_commission = amount * (savingsRates.scope_rate || 0);
          monthly_commission = amount * (savingsRates.monthly_rate || 0) / 12;
        }
        break;

      case 'insurance':
        const insuranceRates = rates.insurance_companies?.[company];
        if (!insuranceRates?.active) return { scope_commission: 0, monthly_commission: 0 };

        const insuranceType = options?.insuranceType || 'risk';
        const productRates = insuranceRates.products?.[insuranceType];
        
        if (productRates) {
          scope_commission = productRates.one_time_rate || 0;
          monthly_commission = productRates.monthly_rate || 0;
        }
        break;

      case 'policy':
        const policyRates = rates.policy_companies?.[company];
        if (!policyRates?.active) return { scope_commission: 0, monthly_commission: 0 };

        if (options?.investmentAmount) {
          scope_commission = options.investmentAmount * (policyRates.scope_rate || 0);
          monthly_commission = options.investmentAmount * (policyRates.monthly_rate || 0) / 12;
        }
        break;
    }

    return { scope_commission, monthly_commission };
  } catch (error) {
    console.error('Error calculating company rates:', error);
    return { scope_commission: 0, monthly_commission: 0 };
  }
};

export const calculateCommissions = async (
  category: 'pension' | 'savings_and_study' | 'policy' | 'insurance',
  company: string,
  amount: number,
  accumulation?: number,
  contributionRate?: number,
  pensionType?: 'comprehensive' | 'supplementary',
  insuranceType?: 'personal_accident' | 'mortgage' | 'health' | 'critical_illness' | 'insurance_umbrella' | 'risk' | 'service' | 'disability'
): Promise<{
  scope_commission: number;
  monthly_commission: number;
  total_commission: number;
} | null> => {
  try {
    console.log('Calculating commissions:', {
      category,
      company,
      amount,
      insuranceType
    });
    
    const rates = await getCompanyRates(category, company, { insuranceType });
    console.log('Got company rates:', rates);
    
    if (!rates || !rates.active) {
      console.log('No active rates found for:', {
        category,
        company,
        insuranceType
      });
      return null;
    }

    let scope_commission = 0;
    let monthly_commission = 0;
    let total_commission = 0;

    switch (category) {
      case 'pension':
        // עמלת היקף על השכר = שכר * אחוז עמלה * 12 * אחוז הפרשה
        if (amount && contributionRate && rates.scope_rate) {
          scope_commission = amount * rates.scope_rate * 12 * contributionRate;
          console.log('Pension scope commission calculation:', {
            salary: amount,
            scope_rate: rates.scope_rate,
            contributionRate,
            pensionType,
            formula: `${amount} * ${rates.scope_rate} * 12 * ${contributionRate} = ${scope_commission}`
          });
        }
        
        // עמלת היקף על צבירה - סכום קבוע למיליון
        if (accumulation && accumulation > 0) {
          const millionsInAccumulation = accumulation / 1000000;
          monthly_commission = millionsInAccumulation * (rates.scope_rate_per_million || 0);
          console.log('Pension accumulation commission calculation:', {
            accumulation,
            millionsInAccumulation,
            rate_per_million: rates.scope_rate_per_million,
            pensionType,
            formula: `${millionsInAccumulation} * ${rates.scope_rate_per_million} = ${monthly_commission}`
          });
        }

        // בפנסיה אין נפרעים - סה"כ הוא סכום שתי עמלות ההיקף
        total_commission = scope_commission + monthly_commission;
        break;

      case 'insurance':
        // עמלת היקף - אחוז מהפרמיה השנתית
        const annualPremium = amount * 12;
        scope_commission = annualPremium * (rates.scope_rate || 0) / 100;
        console.log('Insurance scope commission:', {
          annualPremium,
          scope_rate: rates.scope_rate,
          scope_commission
        });

        // עמלת נפרעים - אחוז מהפרמיה החודשית
        monthly_commission = amount * (rates.monthly_rate || 0) / 100;
        console.log('Insurance monthly commission:', {
          monthly_premium: amount,
          monthly_rate: rates.monthly_rate,
          monthly_commission
        });
        break;

      case 'savings_and_study':
        // חישוב לפי מיליונים
        const millionsInAmount = amount / 1000000;
        // עמלת היקף - סכום קבוע למיליון (למשל 6000 ש"ח למיליון)
        scope_commission = millionsInAmount * (rates.scope_rate_per_million || 0);
        // נפרעים - סכום קבוע למיליון (למשל 250 ש"ח למיליון לחודש)
        monthly_commission = millionsInAmount * (rates.monthly_rate || 0);
        break;

      case 'policy':
        // חישוב לפי מיליונים
        const millionsInPolicy = amount / 1000000;
        scope_commission = millionsInPolicy * (rates.scope_rate_per_million || 0);
        monthly_commission = millionsInPolicy * (rates.monthly_rate || 0);
        break;
    }

    // סה"כ עמלה שנתית: עמלת היקף + (עמלת נפרעים * 12)
    total_commission = scope_commission + (monthly_commission * 12);
    
    console.log('Commission calculation:', {
      category,
      amount,
      scope_commission,
      monthly_commission,
      total_commission,
      formula: {
        scope: `${scope_commission} ש"ח`,
        monthly: `${monthly_commission} ש"ח`,
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