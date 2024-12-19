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
    console.log('Fetching agent agreement for user:', userId);
    
    const { data, error } = await supabase
      .from('agent_commission_rates')
      .select()
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching agent agreement:', error);
      return null;
    }

    console.log('Retrieved agent agreement:', data);
    return data;
  } catch (error) {
    console.error('Error in getAgentAgreement:', error);
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
  console.log('Starting commission calculation:', { userId, category, company, amount, insuranceType, totalAccumulated });

  const agentRates = await getAgentAgreement(userId);
  if (!agentRates) {
    console.log('No agent rates found');
    return getEmptyCalculation(amount);
  }

  if (category === 'pension') {
    const companyRates = agentRates.pension_companies?.[company] as PensionCompanyRates;
    console.log('Pension company rates:', { 
      company, 
      companyRates, 
      allRates: agentRates.pension_companies,
      totalAccumulated 
    });
    
    if (!companyRates?.active) {
      console.log('No active rates found for pension company:', company);
      return getEmptyCalculation(amount);
    }

    const annualContribution = amount * (Number(insuranceType) || 0.2083) * 12;
    
    // Calculate scope commission based on annual contribution
    const scopeCommissionFromContribution = companyRates.scope_rate * annualContribution;
    
    // Calculate accumulation commission based on total accumulated amount
    const accumulationCommission = totalAccumulated 
      ? companyRates.scope_rate_per_million * (totalAccumulated / 1000000)
      : 0;
    
    console.log('Pension calculation details:', {
      salary: amount,
      annualContribution,
      totalAccumulated,
      scope_rate: companyRates.scope_rate,
      scope_rate_per_million: companyRates.scope_rate_per_million,
      scopeCommissionFromContribution,
      accumulationCommission,
      accumulationCalc: totalAccumulated 
        ? `${companyRates.scope_rate_per_million.toLocaleString()}₪ למיליון × ${(totalAccumulated/1000000).toFixed(2)} מיליון = ${accumulationCommission.toLocaleString()}₪`
        : 'אין צבירה'
    });

    const scope_commission = scopeCommissionFromContribution;
    const monthly_commission = accumulationCommission;  // Changed: accumulation commission goes to monthly_commission
    const total_commission = scope_commission + monthly_commission;

    console.log('Calculated pension commissions:', {
      amount,
      insuranceType,
      annualContribution,
      totalAccumulated,
      scopeCommissionFromContribution,
      accumulationCommission,
      scope_commission,
      monthly_commission,
      total_commission,
      rates: companyRates
    });

    return {
      category,
      amount,
      scope_commission,
      monthly_commission,
      total_commission,
      details: {
        scope_commission_explanation: 
          `עמלת היקף: ${(companyRates.scope_rate * 100).toFixed(2)}% × ${annualContribution.toLocaleString()}₪ = ${scope_commission.toLocaleString()}₪`,
        monthly_commission_explanation: 
          totalAccumulated 
            ? `עמלת צבירה: ${companyRates.scope_rate_per_million.toLocaleString()}₪ למיליון × ${(totalAccumulated/1000000).toFixed(2)} מיליון = ${monthly_commission.toLocaleString()}₪`
            : 'אין צבירה'
      }
    };
  }

  if (category === 'savings_and_study') {
    const companyRates = agentRates.savings_and_study_companies?.[company];
    console.log('Financial company rates:', companyRates);

    if (!companyRates?.active) {
      console.log('No active financial rates found');
      return getEmptyCalculation(amount);
    }

    // For financial products, use the product rates
    const productRates = companyRates.products.investment_gemel || companyRates.products.hishtalmut;
    if (!productRates) {
      return getEmptyCalculation(amount);
    }

    const millionsInAmount = amount / 1000000;
    const scope_commission = productRates.scope_commission * millionsInAmount;
    const monthly_commission = productRates.monthly_rate * millionsInAmount;
    const total_commission = scope_commission + (monthly_commission * 12);

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
    if (!companyRates?.active || !insuranceType || !companyRates.products?.[insuranceType as InsuranceType]) {
      return getEmptyCalculation(amount);
    }

    const rates = companyRates.products[insuranceType as InsuranceType];
    // For insurance:
    // one_time_rate is percentage of annual premium
    // monthly_rate is percentage of monthly premium
    const annual_premium = amount * 12;
    const scope_commission = (rates.one_time_rate / 100) * annual_premium;
    const monthly_commission = (rates.monthly_rate / 100) * amount;
    const total_commission = scope_commission + (monthly_commission * 12);

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

// ... rest of the code ...