import { supabase } from '@/lib/supabaseClient';
import { FormData } from './CustomerJourneyTypes';
import { calculateCommissions } from '../../services/AgentAgreementService';

export const calculatePensionCommissions = async (data: any, company: string) => {
  try {
    const salary = Number(data.pensionSalary);
    const accumulation = Number(data.pensionAccumulation);
    const contributionRate = Number(data.pensionContribution || 20.83) / 100;
    const annualContribution = salary * 12 * contributionRate;
    
    const commissions = await calculateCommissions('pension', company, annualContribution, accumulation);
    if (!commissions) {
      throw new Error('לא נמצאו נתוני עמלות');
    }

    return {
      scopeCommission: commissions.scope_commission,
      accumulationCommission: commissions.monthly_commission,
      totalCommission: commissions.scope_commission + commissions.monthly_commission,
      contributionRate: contributionRate * 100
    };
  } catch (error) {
    console.error('Error:', error);
    return { 
      scopeCommission: 0, 
      accumulationCommission: 0, 
      totalCommission: 0,
      contributionRate: 20.83
    };
  }
};

export const calculateInsuranceCommissions = async (data: any, company: string) => {
  try {
    const premium = Number(data.insurancePremium) || 0;
    
    const commissions = await calculateCommissions('insurance', company, premium);
    if (!commissions) {
      throw new Error('לא נמצאו נתוני עמלות');
    }

    return {
      oneTimeCommission: commissions.scope_commission,
      monthlyCommission: commissions.monthly_commission,
      totalCommission: commissions.scope_commission + (commissions.monthly_commission * 12)
    };
  } catch (error) {
    console.error('Error calculating insurance commissions:', error);
    return { oneTimeCommission: 0, monthlyCommission: 0, totalCommission: 0 };
  }
};

export const calculateInvestmentCommissions = async (data: any, company: string) => {
  try {
    const amount = Number(data.investmentAmount) || 0;
    
    const commissions = await calculateCommissions('savings_and_study', company, amount);
    if (!commissions) {
      throw new Error('לא נמצאו נתוני עמלות');
    }

    return {
      scopeCommission: commissions.scope_commission,
      monthlyCommission: commissions.monthly_commission,
      annualCommission: commissions.monthly_commission * 12,
      totalCommission: commissions.scope_commission + (commissions.monthly_commission * 12)
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
    const amount = Number(data.policyAmount) || 0;
    
    const commissions = await calculateCommissions('policy', company, amount);
    if (!commissions) {
      throw new Error('לא נמצאו נתוני עמלות');
    }

    return {
      scopeCommission: commissions.scope_commission,
      monthlyCommission: commissions.monthly_commission,
      totalCommission: commissions.scope_commission + (commissions.monthly_commission * 12)
    };
  } catch (error) {
    console.error('Error calculating policy commissions:', error);
    return { 
      scopeCommission: 0,
      monthlyCommission: 0,
      totalCommission: 0 
    };
  }
};
