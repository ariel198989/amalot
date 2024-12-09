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
  options?: { insuranceType?: 'personal_accident' | 'mortgage' | 'health' | 'critical_illness' | 'insurance_umbrella' | 'risk' | 'service' | 'disability' }
): Promise<{
  scope_rate?: number;
  scope_rate_per_million: number;
  monthly_rate?: number;
  active: boolean;
} | null> => {
  try {
    const rates = await getAgentRates();
    if (!rates) return null;

    let companyRates;
    switch (category) {
      case 'pension':
        companyRates = rates.pension_companies?.[company];
        if (!companyRates?.active) return { scope_commission: 0, monthly_commission: 0 };
        
        let scope_commission = 0;
        let monthly_commission = 0;
        
        // עמלת היקף על השכר = שכר * אחוז עמלה * 12 * אחוז הפרשה
        if (options?.amount && options?.contributionRate && companyRates.scope_rate) {
          scope_commission = options.amount * companyRates.scope_rate * 12 * options.contributionRate;
          console.log('Pension scope commission calculation:', {
            salary: options.amount,
            scope_rate: companyRates.scope_rate,
            contributionRate: options.contributionRate,
            formula: `${options.amount} * ${companyRates.scope_rate} * 12 * ${options.contributionRate} = ${scope_commission}`
          });
        }
        
        // עמלת היקף על צבירה - סכום קבוע למיליון
        if (options?.accumulation && options.accumulation > 0) {
          const millionsInAccumulation = options.accumulation / 1000000;
          monthly_commission = millionsInAccumulation * (companyRates.scope_rate_per_million || 0);
          console.log('Pension accumulation commission calculation:', {
            accumulation: options.accumulation,
            millionsInAccumulation,
            rate_per_million: companyRates.scope_rate_per_million,
            formula: `${millionsInAccumulation} * ${companyRates.scope_rate_per_million} = ${monthly_commission}`
          });
        }
        
        return { scope_commission, monthly_commission };

      case 'savings_and_study':
        companyRates = rates.savings_and_study_companies?.[company];
        if (!companyRates?.active) return null;
        break;

      case 'policy':
        companyRates = rates.policy_companies?.[company];
        if (!companyRates?.active) return null;
        break;

      case 'insurance':
        if (!rates.insurance_companies?.[company]?.active) {
          console.log('Insurance company not active:', {
            company,
            active: rates.insurance_companies?.[company]?.active
          });
          return null;
        }
        const insuranceType = options?.insuranceType || 'risk';
        const productRates = rates.insurance_companies[company].products[insuranceType];
        
        console.log('Insurance rates check:', {
          company,
          insuranceType,
          availableProducts: Object.keys(rates.insurance_companies[company].products),
          productRates,
          active: rates.insurance_companies[company].active
        });
        
        if (!productRates) {
          console.log('Product rates not found for:', {
            company,
            insuranceType
          });
          return null;
        }
        
        return {
          scope_rate: productRates.one_time_rate,
          monthly_rate: productRates.monthly_rate,
          active: rates.insurance_companies[company].active,
          scope_rate_per_million: 0 // Not used for insurance
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