import { supabase } from '@/lib/supabase';
import { 
  AgentRates, 
  PensionCompanyRates,
  CompanyRates,
  InsuranceCompanyRates 
} from '@/components/settings/AgentAgreements/AgentAgreementsTypes';

type InsuranceType = 'personal_accident' | 'mortgage' | 'health' | 'critical_illness' | 'insurance_umbrella' | 'risk' | 'service' | 'disability';

interface CommissionCalculation {
  category: string;
  amount: number;
  scope_commission: number;
  monthly_commission: number;
  total_commission: number;
  details: {
    scope_commission_explanation: string;
    monthly_commission_explanation: string;
  };
}

export async function getAgentAgreement(userId: string): Promise<AgentRates | null> {
  try {
    console.log('מתחיל לחפש הסכם סוכן עבור:', userId);
    
    if (!userId) {
      console.error('לא התקבל מזהה משתמש');
      return null;
    }

    const { data, error } = await supabase
      .from('agent_commission_rates')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('שגיאה בקבלת הסכם סוכן:', error.message);
      return null;
    }

    if (!data) {
      console.error('לא נמצאו נתוני הסכם סוכן');
      return null;
    }

    console.log('נמצא הסכם סוכן:', {
      userId: data.user_id,
      pensionCompanies: Object.keys(data.pension_companies || {}),
      insuranceCompanies: Object.keys(data.insurance_companies || {})
    });
    
    return data;
  } catch (error) {
    console.error('שגיאה לא צפויה בקבלת הסכם סוכן:', error);
    return null;
  }
}

export async function getCompanyRates(
  category: string,
  company: string
): Promise<PensionCompanyRates | CompanyRates | InsuranceCompanyRates | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const agentRates = await getAgentAgreement(user.id);
    if (!agentRates) {
      return null;
    }

    switch (category) {
      case 'pension':
        return agentRates.pension_companies?.[company] || null;
      case 'savings_and_study':
        return agentRates.savings_and_study_companies?.[company] || null;
      case 'insurance':
        return agentRates.insurance_companies?.[company] || null;
      case 'policy':
        return agentRates.policy_companies?.[company] || null;
      default:
        return null;
    }
  } catch (error) {
    console.error('Error getting company rates:', error);
    return null;
  }
}

function getEmptyCalculation(amount: number): CommissionCalculation {
  return {
    category: '',
    amount,
    scope_commission: 0,
    monthly_commission: 0,
    total_commission: 0,
    details: {
      scope_commission_explanation: 'No commission rates found',
      monthly_commission_explanation: 'No commission rates found'
    }
  };
}

export async function calculateCommissions(
  userId: string,
  category: string,
  company: string,
  amount: number,
  insuranceType?: string,
  totalAccumulated?: number
): Promise<CommissionCalculation> {
  console.log('מתחיל חישוב עמלות:', { 
    userId, 
    category, 
    company, 
    amount, 
    insuranceType, 
    totalAccumulated 
  });

  const agentRates = await getAgentAgreement(userId);
  if (!agentRates) {
    console.error('לא נמצאו נתוני הסכם סוכן');
    return getEmptyCalculation(amount);
  }

  if (category === 'pension') {
    const companyRates = agentRates.pension_companies?.[company] as PensionCompanyRates;
    console.log('נתוני חברת פנסיה:', { 
      company, 
      rates: companyRates,
      allCompanies: Object.keys(agentRates.pension_companies || {})
    });
    
    if (!companyRates?.active) {
      console.error('לא נמצאו נתונים פעילים לחברת הפנסיה:', company);
      return getEmptyCalculation(amount);
    }

    const provision_rate = Number(insuranceType) || 20.83;
    if (provision_rate < 18.5 || provision_rate > 23) {
      throw new Error('אחוז הפרשה חייב להיות בין 18.5 ל-23');
    }

    const commission_rate = companyRates?.scope_rate * 100;
    if (commission_rate < 6 || commission_rate > 8) {
      throw new Error('אחוז עמלה חייב להיות בין 6 ל-8');
    }

    const annualContribution = amount * 12 * (provision_rate / 100);
    const scopeCommissionFromContribution = Math.round(
      annualContribution * (commission_rate / 100)
    );
    
    const millionsInAccumulation = totalAccumulated ? totalAccumulated / 1000000 : 0;
    const accumulationCommission = totalAccumulated 
      ? Math.round(companyRates.scope_rate_per_million * millionsInAccumulation)
      : 0;

    console.log('פרטי חישוב פנסיה:', {
      salary: amount,
      provision_rate,
      commission_rate,
      annualContribution,
      totalAccumulated,
      millionsInAccumulation,
      scopeCommissionFromContribution,
      accumulationCommission
    });

    const scope_commission = scopeCommissionFromContribution;
    const monthly_commission = accumulationCommission;
    const total_commission = scope_commission + monthly_commission;

    return {
      category,
      amount,
      scope_commission,
      monthly_commission,
      total_commission,
      details: {
        scope_commission_explanation: 
          `עמלת היקף: ${commission_rate.toFixed(2)}% × ${annualContribution.toLocaleString()}₪ = ${scope_commission.toLocaleString()}₪`,
        monthly_commission_explanation: 
          totalAccumulated 
            ? `עמלת צבירה: ${companyRates.scope_rate_per_million.toLocaleString()}₪ × ${millionsInAccumulation.toFixed(2)} מיליון = ${monthly_commission.toLocaleString()}₪`
            : 'אין צבירה'
      }
    };
  }

  if (category === 'savings_and_study') {
    const companyRates = agentRates.savings_and_study_companies?.[company];
    console.log('Savings company rates:', { company, companyRates, productType: insuranceType });

    if (!companyRates?.active) {
      console.log('No active savings rates found');
      return getEmptyCalculation(amount);
    }

    // For savings products, use the product rates based on the product type
    const productType = insuranceType || 'investment_gemel';  // Default to investment_gemel if not specified
    const productRates = companyRates.products[productType];
    if (!productRates) {
      console.log('No rates found for savings product type:', productType);
      return getEmptyCalculation(amount);
    }

    const millionsInAmount = amount / 1000000;
    const scope_commission = Math.round(productRates.scope_commission * millionsInAmount);
    const monthly_commission = Math.round(productRates.monthly_rate * millionsInAmount);
    const total_commission = scope_commission + (monthly_commission * 12);

    console.log('Savings calculation details:', {
      amount,
      millionsInAmount,
      productType,
      productRates,
      scope_commission,
      monthly_commission,
      total_commission
    });

    return {
      category,
      amount,
      scope_commission,
      monthly_commission,
      total_commission,
      details: {
        scope_commission_explanation: `${productRates.scope_commission.toLocaleString()}₪ × ${millionsInAmount.toFixed(2)} מיליון = ${scope_commission.toLocaleString()}₪`,
        monthly_commission_explanation: `${productRates.monthly_rate.toLocaleString()}₪ × ${millionsInAmount.toFixed(2)} מיליון = ${monthly_commission.toLocaleString()}₪ לחודש`
      }
    };
  }

  if (category === 'insurance') {
    const companyRates = agentRates.insurance_companies?.[company];
    console.log('Insurance company rates:', { company, companyRates, insuranceType });
    
    if (!companyRates?.active || !insuranceType || !companyRates.products?.[insuranceType as InsuranceType]) {
      console.log('No active rates found for insurance company or product:', { company, insuranceType });
      return getEmptyCalculation(amount);
    }

    const rates = companyRates.products[insuranceType as InsuranceType];
    if (!rates) {
      console.log('No rates found for insurance type:', insuranceType);
      return getEmptyCalculation(amount);
    }

    // For insurance:
    // one_time_rate is percentage of annual premium
    // monthly_rate is percentage of monthly premium
    const annual_premium = amount * 12;
    const scope_commission = Math.round((rates.one_time_rate / 100) * annual_premium);
    const monthly_commission = Math.round((rates.monthly_rate / 100) * amount);
    const total_commission = scope_commission + (monthly_commission * 12);

    console.log('Insurance calculation details:', {
      amount,
      annual_premium,
      rates,
      scope_commission,
      monthly_commission,
      total_commission
    });

    return {
      category,
      amount,
      scope_commission,
      monthly_commission,
      total_commission,
      details: {
        scope_commission_explanation: `${rates.one_time_rate}% × ${annual_premium.toLocaleString()}₪ (פרמיה שנתית) = ${scope_commission.toLocaleString()}₪`,
        monthly_commission_explanation: `${rates.monthly_rate}% × ${amount.toLocaleString()}₪ = ${monthly_commission.toLocaleString()}₪ לחודש`
      }
    };
  }

  return getEmptyCalculation(amount);
}

export const updatePerformance = async (category: string, month: number, performance_value: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const currentDate = new Date();
    const year = currentDate.getFullYear();

    // קביעת סוג המטריקה בהתאם לקטגוריה
    let metric_type = 'monthly_premium';
    if (category === 'finance') {
      metric_type = 'total_amount';
    } else if (category === 'pension') {
      metric_type = 'monthly_deposit';
    }

    // בדיקה אם כבר קיים רשומה
    const { data: existingTarget } = await supabase
      .from('sales_targets')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', category)
      .eq('month', month)
      .eq('year', year)
      .eq('metric_type', metric_type)
      .single();

    if (existingTarget) {
      // עדכון רשומה קיימת
      const { error } = await supabase
        .from('sales_targets')
        .update({ 
          performance: performance_value,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTarget.id);

      if (error) throw error;
    } else {
      // יצירת רשומה חדשה
      const { error } = await supabase
        .from('sales_targets')
        .insert([
          {
            user_id: user.id,
            category,
            month,
            year,
            performance: performance_value,
            target_amount: 0,
            metric_type,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating performance:', error);
    throw error;
  }
};

// ... rest of the code ...