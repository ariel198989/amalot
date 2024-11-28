import { supabase } from '@/lib/supabaseClient';
import { FormData } from './CustomerJourneyTypes';

export const calculatePensionCommissions = async (data: any, company: string) => {
  try {
    const rates = await getAgentRates();
    if (!rates) throw new Error('לא נמצאו נתוני עמלות');

    const salary = Number(data.pensionSalary);
    const accumulation = Number(data.pensionAccumulation);
    const provision = Number(data.pensionProvision) / 100;

    // עמלת היקף - אחוז מההפקדה השנתית
    const scopeCommission = salary * 12 * provision * rates.pension_scope_rate;

    // עמלת צבירה - סכום למיליון
    const accumulationCommission = accumulation * (rates.pension_accumulation_rate / 1000000);

    return {
      scopeCommission,
      accumulationCommission,
      totalCommission: scopeCommission + accumulationCommission,
      commission_rate: rates.pension_commission_rate,
      provision_rate: rates.pension_provision_rate
    };
  } catch (error) {
    console.error('Error:', error);
    return { 
      scopeCommission: 0, 
      accumulationCommission: 0, 
      totalCommission: 0,
      commission_rate: 0,
      provision_rate: 0
    };
  }
};

export const calculateInsuranceCommissions = async (data: any, company: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('משתמש לא מחובר');

    // קבלת העמלות העדכניות מהדאטהבייס
    const { data: ratesData, error } = await supabase
      .from('agent_commission_rates')
      .select('insurance_companies')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    // בדיקה שהחברה קיימת ופעילה
    const companyRates = ratesData?.insurance_companies?.[company];
    if (!companyRates?.active) {
      console.log(`Company ${company} is not active`);
      return {
        oneTimeCommission: 0,
        monthlyCommission: 0,
        totalCommission: 0
      };
    }

    const monthlyPremium = Number(data.insurancePremium) || 0;
    const insuranceType = data.insuranceType || 'risk';
    
    // חישוב עמלות לפי הנתונים מהדאטהבייס
    const oneTimeCommission = monthlyPremium * 12 * companyRates.products[insuranceType].one_time_rate;
    const monthlyCommission = monthlyPremium * companyRates.products[insuranceType].monthly_rate;
    const totalCommission = oneTimeCommission + (monthlyCommission * 12);

    return {
      oneTimeCommission,
      monthlyCommission,
      totalCommission
    };
  } catch (error) {
    console.error('Error calculating insurance commissions:', error);
    return { oneTimeCommission: 0, monthlyCommission: 0, totalCommission: 0 };
  }
};

export const calculateInvestmentCommissions = async (data: any, company: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('משתמש לא מחובר');

    const { data: ratesData, error } = await supabase
      .from('agent_commission_rates')
      .select('savings_and_study_companies')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    const companyRates = ratesData?.savings_and_study_companies?.[company];
    if (!companyRates?.active) {
      console.log(`Company ${company} is not active in savings_and_study_companies`);
      return {
        scopeCommission: 0,
        monthlyCommission: 0,
        annualCommission: 0,
        totalCommission: 0
      };
    }

    const amount = Number(data.investmentAmount) || 0;

    // חישוב עמלת היקף - לפי ₪ למיליון
    const scopeCommission = (amount / 1000000) * companyRates.scope_rate_per_million;

    // חישוב עמלת נפרעים חודשית - לפי ₪ למיליון לחודש
    const monthlyCommission = (amount / 1000000) * companyRates.monthly_rate;

    // חישוב עמלת נפרעים שנתית
    const annualCommission = monthlyCommission * 12;

    // סה"כ עמלות בשנה הראשונה
    const totalCommission = scopeCommission + annualCommission;

    return {
      scopeCommission,
      monthlyCommission,
      annualCommission,
      totalCommission
    };
  } catch (error) {
    console.error('Error calculating investment commissions:', error);
    return { 
      scopeCommission: 0, 
      monthlyCommission: 0, 
      annualCommission: 0,
      totalCommission: 0 
    };
  }
};

export const calculatePolicyCommissions = async (data: any, company: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('משתמש לא מחובר');

    const { data: ratesData, error } = await supabase
      .from('agent_commission_rates')
      .select('policy_companies')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    const companyRates = ratesData?.policy_companies?.[company];
    if (!companyRates?.active) {
      console.log(`Company ${company} is not active in policy_companies`);
      return {
        scopeCommission: 0,
        totalCommission: 0
      };
    }

    const amount = Number(data.policyAmount) || 0;
    const period = Number(data.policyPeriod) || 1;

    // חישוב עמלת היקף - לפי ₪ למיליון
    const scopeCommission = (amount / 1000000) * companyRates.scope_rate_per_million * period;

    // סה"כ עמלות
    const totalCommission = scopeCommission;

    return {
      scopeCommission,
      totalCommission
    };
  } catch (error) {
    console.error('Error calculating policy commissions:', error);
    return { 
      scopeCommission: 0, 
      totalCommission: 0 
    };
  }
};

const getAgentRates = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('משתמש לא מחובר');

  const { data: rates, error } = await supabase
    .from('agent_commission_rates')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return rates;
};
