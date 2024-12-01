import { supabase } from '@/lib/supabaseClient';
import { 
  CustomerJourney, 
  PensionProduct, 
  InsuranceProduct, 
  InvestmentProduct, 
  PolicyProduct 
} from '@/components/calculators/CustomerJourneyTypes';

export interface SalesData {
  id: string;
  date: string;
  client_name: string;
  total_commission: number;
  company: string;
  user_id: string;
}

export const reportService = {
  async saveCustomerJourney(journey: CustomerJourney) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      // עבור כל מוצר שנבחר במסע לקוח
      for (const product of journey.selected_products) {
        switch (product.type) {
          case 'pension': {
            // שמירת מוצר פנסיה
            const pensionData = {
              user_id: user.id,
              client_name: journey.client_name,
              client_phone: journey.client_phone || '',
              company: product.company,
              date: journey.date,
              salary: product.details.salary,
              accumulation: product.details.accumulation,
              provision: product.details.provision,
              scope_commission: product.details.scope_commission,
              monthly_commission: product.details.monthly_commission,
              total_commission: product.details.total_commission,
              journey_id: journey.id
            };

            const { error: pensionError } = await supabase
              .from('pension_sales')
              .insert([pensionData]);

            if (pensionError) throw pensionError;
            break;
          }

          case 'insurance': {
            // שמירת מוצר ביטוח
            const insuranceData = {
              user_id: user.id,
              client_name: journey.client_name,
              client_phone: journey.client_phone || '',
              company: product.company,
              date: journey.date,
              premium: product.details.premium,
              insurance_type: product.details.insurance_type,
              payment_method: product.details.payment_method,
              nifraim: product.details.nifraim,
              scope_commission: product.details.scope_commission,
              monthly_commission: product.details.monthly_commission,
              total_commission: product.details.total_commission,
              journey_id: journey.id
            };

            const { error: insuranceError } = await supabase
              .from('insurance_sales')
              .insert([insuranceData]);

            if (insuranceError) throw insuranceError;
            break;
          }

          case 'investment': {
            // שמירת מוצר השקעות
            const investmentData = {
              user_id: user.id,
              client_name: journey.client_name,
              client_phone: journey.client_phone || '',
              company: product.company,
              date: journey.date,
              investment_amount: product.details.investment_amount,
              investment_period: product.details.investment_period,
              investment_type: product.details.investment_type,
              scope_commission: product.details.scope_commission,
              total_commission: product.details.total_commission,
              journey_id: journey.id
            };

            const { error: investmentError } = await supabase
              .from('investment_sales')
              .insert([investmentData]);

            if (investmentError) throw investmentError;
            break;
          }

          case 'policy': {
            // שמירת מוצר פוליסות
            const policyData = {
              user_id: user.id,
              client_name: journey.client_name,
              client_phone: journey.client_phone || '',
              company: product.company,
              date: journey.date,
              policy_amount: product.details.policy_amount,
              policy_period: product.details.policy_period,
              policy_type: product.details.policy_type,
              scope_commission: product.details.scope_commission,
              total_commission: product.details.total_commission,
              journey_id: journey.id
            };

            const { error: policyError } = await supabase
              .from('policy_sales')
              .insert([policyData]);

            if (policyError) throw policyError;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error saving customer journey:', error);
      throw error;
    }
  },

  async fetchAllSales() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('משתמש לא מחובר');

    // טעינת כל סוגי המכירות במקביל
    const [
      { data: pensionSales },
      { data: insuranceSales },
      { data: investmentSales },
      { data: policySales }
    ] = await Promise.all([
      supabase.from('pension_sales').select('*').eq('user_id', user.id),
      supabase.from('insurance_sales').select('*').eq('user_id', user.id),
      supabase.from('investment_sales').select('*').eq('user_id', user.id),
      supabase.from('policy_sales').select('*').eq('user_id', user.id)
    ]);

    return {
      pensionSales: pensionSales || [],
      insuranceSales: insuranceSales || [],
      investmentSales: investmentSales || [],
      policySales: policySales || []
    };
  }
}; 