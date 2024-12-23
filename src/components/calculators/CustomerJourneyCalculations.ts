import { calculateCommissions } from '../../services/AgentAgreementService';

export const calculatePensionCommissions = async (data: any, company: string) => {
  try {
    console.log('מתחיל חישוב עמלות פנסיה:', {
      pensionSalary: data.pensionSalary,
      pensionAccumulation: data.pensionAccumulation,
      pensionContribution: data.pensionContribution,
      company,
      userId: data.user_id
    });

    const salary = Number(data.pensionSalary);
    const accumulation = Number(data.pensionAccumulation);
    const provision_rate = Number(data.pensionContribution || 20.83);
    
    if (!salary) {
      console.error('לא התקבל שכר תקין:', data.pensionSalary);
      throw new Error('נדרש שכר תקין לחישוב');
    }

    if (!company) {
      console.error('לא התקבלה חברה');
      throw new Error('נדרשת חברת ביטוח לחישוב');
    }

    if (!data.user_id) {
      console.error('לא התקבל מזהה משתמש');
      throw new Error('נדרש מזהה משתמש לחישוב');
    }
    
    if (provision_rate < 18.5 || provision_rate > 23) {
      console.error('אחוז הפרשה לא תקין:', provision_rate);
      throw new Error('אחוז הפרשה חייב להיות בין 18.5 ל-23');
    }
    
    console.log('שולח נתונים לחישוב:', {
      userId: data.user_id,
      category: 'pension',
      company,
      salary,
      provision_rate,
      accumulation
    });

    const commissions = await calculateCommissions(
      data.user_id,
      'pension',
      company,
      salary,
      String(provision_rate),
      accumulation
    );

    if (!commissions) {
      console.error('לא התקבלו נתוני עמלות מהחישוב');
      throw new Error('לא נמצאו נתוני עמלות');
    }

    console.log('התקבלו תוצאות חישוב:', {
      scope_commission: commissions.scope_commission,
      monthly_commission: commissions.monthly_commission,
      total_commission: commissions.total_commission,
      details: commissions.details
    });

    return {
      scopeCommission: commissions.scope_commission,
      accumulationCommission: commissions.monthly_commission,
      totalCommission: commissions.total_commission,
      contributionRate: provision_rate
    };
  } catch (error) {
    console.error('שגיאה בחישוב עמלות פנסיה:', error);
    throw error;
  }
};

export const calculateInsuranceCommissions = async (data: any, company: string) => {
  try {
    console.log('מתחיל חישוב עמלות ביטוח:', {
      premium: data.insurancePremium,
      insuranceType: data.insuranceType,
      company,
      userId: data.user_id
    });

    const premium = Number(data.insurancePremium);
    
    if (!premium) {
      console.error('לא התקבלה פרמיה תקינה:', data.insurancePremium);
      throw new Error('נדרשת פרמיה תקינה לחישוב');
    }

    if (!company) {
      console.error('לא התקבלה חברה');
      throw new Error('נדרשת חברת ביטוח לחישוב');
    }

    if (!data.insuranceType) {
      console.error('לא התקבל סוג ביטוח');
      throw new Error('נדרש סוג ביטוח לחישוב');
    }

    if (!data.user_id) {
      console.error('לא התקבל מזהה משתמש');
      throw new Error('נדרש מזהה משתמש לחישוב');
    }

    console.log('שולח נתונים לחישוב:', {
      userId: data.user_id,
      category: 'insurance',
      company,
      premium,
      insuranceType: data.insuranceType
    });
    
    const commissions = await calculateCommissions(
      data.user_id,
      'insurance',
      company,
      premium,
      data.insuranceType
    );

    if (!commissions) {
      console.error('לא התקבלו נתוני עמלות מהחישוב');
      throw new Error('לא נמצאו נתוני עמלות');
    }

    console.log('התקבלו תוצאות חישוב:', {
      scope_commission: commissions.scope_commission,
      monthly_commission: commissions.monthly_commission,
      total_commission: commissions.total_commission,
      details: commissions.details
    });

    return {
      oneTimeCommission: commissions.scope_commission,
      monthlyCommission: commissions.monthly_commission,
      totalCommission: commissions.total_commission
    };
  } catch (error) {
    console.error('שגיאה בחישוב עמלות ביטוח:', error);
    throw error;
  }
};

export const calculateInvestmentCommissions = async (data: any, company: string) => {
  try {
    const amount = Number(data.investmentAmount) || 0;
    
    const commissions = await calculateCommissions(
      data.user_id,
      'savings_and_study',
      company,
      amount,
      data.productType
    );

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
    
    const commissions = await calculateCommissions(
      data.user_id,
      'policy',
      company,
      amount,
      data.policyType
    );

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
