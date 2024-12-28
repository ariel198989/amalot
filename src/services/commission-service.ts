import { supabase } from '@/lib/supabase';

interface CommissionParams {
  category: 'pension' | 'insurance' | 'investment';
  amount: number;
  accumulation?: number;
  insuranceType?: string;
  investmentType?: string;
  userId: string;
}

export const calculateCommissions = async (params: CommissionParams) => {
  try {
    // Get agent agreements for the user
    const { data: agreements, error } = await supabase
      .from('agent_commission_rates')
      .select('*')
      .eq('user_id', params.userId);

    if (error) throw error;
    if (!agreements?.length) return null;

    const results: { [company: string]: { scope_commission: number; monthly_commission: number; total_commission: number } } = {};

    for (const agreement of agreements) {
      let scopeCommission = 0;
      let monthlyCommission = 0;

      switch (params.category) {
        case 'pension':
          // Calculate pension commissions
          if (params.amount) {
            const monthlyDeposit = params.amount * 0.2083; // 20.83% pension contribution
            scopeCommission = monthlyDeposit * (agreement.pension_scope_rate || 0);
            monthlyCommission = (params.accumulation || 0) * (agreement.pension_accumulation_rate || 0) / 12;
          }
          break;

        case 'insurance':
          // Calculate insurance commissions based on type
          if (params.amount) {
            switch (params.insuranceType) {
              case 'life':
                scopeCommission = params.amount * (agreement.life_insurance_scope_rate || 0);
                monthlyCommission = params.amount * (agreement.life_insurance_monthly_rate || 0);
                break;
              case 'health':
                scopeCommission = params.amount * (agreement.health_insurance_scope_rate || 0);
                monthlyCommission = params.amount * (agreement.health_insurance_monthly_rate || 0);
                break;
              case 'disability':
                scopeCommission = params.amount * (agreement.disability_insurance_scope_rate || 0);
                monthlyCommission = params.amount * (agreement.disability_insurance_monthly_rate || 0);
                break;
              case 'nursing':
                scopeCommission = params.amount * (agreement.nursing_insurance_scope_rate || 0);
                monthlyCommission = params.amount * (agreement.nursing_insurance_monthly_rate || 0);
                break;
            }
          }
          break;

        case 'investment':
          // Calculate investment commissions based on type
          if (params.amount) {
            switch (params.investmentType) {
              case 'provident':
                scopeCommission = params.amount * (agreement.provident_fund_scope_rate || 0);
                monthlyCommission = params.amount * (agreement.provident_fund_monthly_rate || 0) / 12;
                break;
              case 'education':
                scopeCommission = params.amount * (agreement.education_fund_scope_rate || 0);
                monthlyCommission = params.amount * (agreement.education_fund_monthly_rate || 0) / 12;
                break;
            }
          }
          break;
      }

      results[agreement.company_name] = {
        scope_commission: scopeCommission,
        monthly_commission: monthlyCommission,
        total_commission: scopeCommission + (monthlyCommission * 12)
      };
    }

    return results;
  } catch (error) {
    console.error('Error calculating commissions:', error);
    throw error;
  }
}; 