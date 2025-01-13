import { supabase, getCurrentUser } from '@/lib/supabase';
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

export async function getAgentAgreement(userId?: string): Promise<AgentRates | null> {
  try {
    if (!userId) {
      const { data: { user } } = await getCurrentUser();
      if (!user) {
        console.error('לא התקבל מזהה משתמש ואין משתמש מחובר');
        return null;
      }
      userId = user.id;
    }

    console.log('מתחיל לחפש הסכם סוכן עבור:', userId);
    
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
  userId: string | undefined,
  category: string,
  company: string,
  amount: number,
  insuranceType?: string,
  totalAccumulated?: number
): Promise<CommissionCalculation> {
  console.log('חישוב עמלות עבור:', { 
    userId, 
    category, 
    company, 
    amount, 
    insuranceType, 
    totalAccumulated 
  });

  if (!userId) {
    const { data: { user } } = await getCurrentUser();
    if (!user) {
      console.error('לא התקבל מזהה משתמש ואין משתמש מחובר');
      return getEmptyCalculation(amount);
    }
    userId = user.id;
  }

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

    // מקבלים סכום שנתי
    const annual_amount = amount;
    const monthly_amount = Math.round(annual_amount / 12);
    const millions = annual_amount / 1000000; // כמה מיליונים יש בסכום

    console.log('Amount calculation:', {
      annual_amount,
      monthly_amount,
      millions,
      calculation: `${annual_amount} / 1,000,000 = ${millions.toFixed(2)} מיליון`
    });

    // עמלת היקף - חד פעמי (סכום בשקלים למיליון)
    const scope_commission = Math.round(millions * productRates.scope_commission);
    console.log('Scope commission calculation:', {
      millions,
      scope_rate_per_million: productRates.scope_commission,
      calculation: `${millions.toFixed(2)} מיליון × ${productRates.scope_commission.toLocaleString()}₪ = ${scope_commission.toLocaleString()}₪`,
      final: scope_commission
    });

    // עמלת נפרעים - חודשי (סכום בשקלים למיליון)
    const monthly_commission = Math.round(millions * productRates.monthly_rate);
    const annual_commission = monthly_commission * 12; // סה"כ נפרעים שנתי
    console.log('Monthly commission calculation:', {
      millions,
      monthly_rate_per_million: productRates.monthly_rate,
      calculation: `${millions.toFixed(2)} מיליון × ${productRates.monthly_rate.toLocaleString()}₪ = ${monthly_commission.toLocaleString()}₪`,
      annual_calculation: `${monthly_commission.toLocaleString()}₪ × 12 = ${annual_commission.toLocaleString()}₪ בשנה`,
      final: monthly_commission
    });

    // סה"כ = עמלת היקף (חד פעמי) + עמלת נפרעים שנתית
    const total_commission = scope_commission + annual_commission;
    console.log('Total commission calculation:', {
      scope_commission,
      annual_commission,
      calculation: `${scope_commission.toLocaleString()}₪ (חד פעמי) + ${annual_commission.toLocaleString()}₪ (נפרעים שנתי) = ${total_commission.toLocaleString()}₪`,
      final: total_commission
    });

    return {
      category,
      amount: monthly_amount,
      scope_commission,
      monthly_commission,
      total_commission,
      details: {
        scope_commission_explanation: `עמלת היקף: ${productRates.scope_commission.toLocaleString()}₪ למיליון × ${millions.toFixed(2)} מיליון = ${scope_commission.toLocaleString()}₪ (חד פעמי)`,
        monthly_commission_explanation: `עמלת נפרעים שנתית: ${productRates.monthly_rate.toLocaleString()}₪ למיליון × ${millions.toFixed(2)} מיליון = ${monthly_commission.toLocaleString()}₪ לחודש (${annual_commission.toLocaleString()}₪ בשנה)`
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
    const annual_premium = amount; // מקבלים פרמיה שנתית
    const monthly_premium = Math.round(annual_premium / 12); // מחשבים פרמיה חודשית
    
    console.log('Premium calculation:', {
      annual_premium,
      monthly_premium,
      calculation: `${annual_premium} / 12 = ${monthly_premium} לחודש`
    });
    
    // עמלת היקף - אחוז מהפרמיה השנתית (חד פעמי)
    const scope_commission = Math.round(annual_premium * (rates.one_time_rate / 100));
    console.log('Scope commission calculation:', {
      annual_premium,
      one_time_rate: rates.one_time_rate,
      calculation: `${annual_premium.toLocaleString()}₪ × ${rates.one_time_rate}% = ${scope_commission.toLocaleString()}₪`,
      final: scope_commission
    });
    
    // עמלת נפרעים - אחוז מהפרמיה החודשית (משולם כל חודש)
    const monthly_rate = rates.monthly_rate; // כבר מגיע כאחוז נכון (למשל 20)
    console.log('Monthly rate:', monthly_rate);
    
    // לדוגמה: 400 * 0.2 = 80
    const monthly_commission = Math.round(monthly_premium * (monthly_rate / 100));
    const annual_commission = monthly_commission * 12;
    console.log('Monthly commission calculation:', {
      monthly_premium,
      monthly_rate,
      calculation: `${monthly_premium.toLocaleString()}₪ × ${monthly_rate}% = ${monthly_commission.toLocaleString()}₪`,
      annual_calculation: `${monthly_commission.toLocaleString()}₪ × 12 = ${annual_commission.toLocaleString()}₪ בשנה`,
      final: monthly_commission
    });

    // סה"כ עמלה שנתית = עמלת היקף + (עמלת נפרעים * 12)
    const total_commission = scope_commission + annual_commission;
    console.log('Total commission calculation:', {
      scope_commission,
      annual_commission,
      calculation: `${scope_commission.toLocaleString()}₪ (חד פעמי) + ${annual_commission.toLocaleString()}₪ (נפרעים שנתי) = ${total_commission.toLocaleString()}₪`,
      final: total_commission
    });

    return {
      category,
      amount: monthly_premium,
      scope_commission,
      monthly_commission,
      total_commission,
      details: {
        scope_commission_explanation: `עמלת היקף: ${rates.one_time_rate}% × ${annual_premium.toLocaleString()}₪ = ${scope_commission.toLocaleString()}₪ (חד פעמי)`,
        monthly_commission_explanation: `עמלת נפרעים שנתית: ${monthly_rate}% × ${monthly_premium.toLocaleString()}₪ = ${monthly_commission.toLocaleString()}₪ לחודש (${annual_commission.toLocaleString()}₪ בשנה)`
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

    // קביעת סוג המטריקה בערך הביצוע בהתאם לקטגוריה
    let metric_type = 'monthly_premium';
    let actual_performance = performance_value;

    switch(category) {
      case 'finance':
      case 'finance-transfer':
        metric_type = 'total_amount';
        break;
      case 'pension':
      case 'pension-transfer':
        metric_type = 'monthly_deposit';
        break;
      case 'risks':
        metric_type = 'monthly_premium';
        actual_performance = performance_value; // כבר מקבלים פרמיה חודשית
        break;
      default:
        metric_type = 'monthly_premium';
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
          performance: actual_performance,
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
            performance: actual_performance,
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