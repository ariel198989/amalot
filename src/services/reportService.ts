import { supabase, getCurrentUser } from '@/lib/supabase';
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

interface StatsData {
  count: number;
  commission: number;
}

export interface DashboardStats {
  total: {
    pension: StatsData;
    insurance: StatsData;
    investment: StatsData;
    policy: StatsData;
    commission: number;
    count: number;
  };
  currentMonth: {
    pension: StatsData;
    insurance: StatsData;
    investment: StatsData;
    policy: StatsData;
    commission: number;
    count: number;
  };
  previousMonth: {
    pension: StatsData;
    insurance: StatsData;
    investment: StatsData;
    policy: StatsData;
    commission: number;
    count: number;
  };
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
              date: new Date(journey.date).toISOString(),
              salary: (product.details as PensionProduct).pensionSalary || 0,
              accumulation: (product.details as PensionProduct).pensionAccumulation || 0,
              provision: (product.details as PensionProduct).pensionContribution || 0,
              scope_commission: product.details.scope_commission || 0,
              monthly_commission: product.details.monthly_commission || 0,
              journey_id: journey.id,
              provision_rate: (product.details as PensionProduct).pensionContribution || 0,
              commission_rate: 0,
              status: 'active'
            };

            const { error: pensionError } = await supabase
              .from('pension_sales')
              .insert([pensionData]);

            if (pensionError) throw pensionError;
            break;
          }

          case 'insurance': {
            // שמירת מוצר ביטוח
            const details = product.details as InsuranceProduct;
            const insuranceData = {
              user_id: user.id,
              client_name: journey.client_name,
              client_phone: journey.client_phone || '',
              company: product.company,
              date: new Date(journey.date).toISOString(),
              premium: details.premium || 0,
              insurance_type: details.insurance_type,
              payment_method: details.payment_method,
              nifraim: (details.monthly_commission || 0) * 12,
              scope_commission: details.scope_commission || 0,
              monthly_commission: details.monthly_commission || 0,
              total_commission: details.total_commission || 0,
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
            const details = product.details as InvestmentProduct;
            const investmentData = {
              user_id: user.id,
              client_name: journey.client_name,
              client_phone: journey.client_phone || '',
              company: product.company,
              date: new Date(journey.date).toISOString(),
              investment_amount: details.investment_amount || 0,
              investment_period: details.investment_period || 0,
              investment_type: details.investment_type,
              scope_commission: details.scope_commission || 0,
              total_commission: details.total_commission || 0,
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
            const details = product.details as PolicyProduct;
            const policyData = {
              user_id: user.id,
              client_name: journey.client_name,
              client_phone: journey.client_phone || '',
              company: product.company,
              date: journey.date,
              policy_amount: details.policy_amount,
              policy_period: details.policy_period,
              policy_type: details.policy_type,
              scope_commission: details.scope_commission,
              total_commission: details.total_commission,
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
    const { data: { user } } = await getCurrentUser();
    if (!user) throw new Error('משתמש לא מחובר');

    const { data: sales, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    const pensionSales = sales.filter(sale => sale.sale_type === 'pension');
    const insuranceSales = sales.filter(sale => sale.sale_type === 'insurance');
    const investmentSales = sales.filter(sale => sale.sale_type === 'investment');
    const policySales = sales.filter(sale => sale.sale_type === 'policy');

    return {
      pensionSales,
      insuranceSales,
      investmentSales,
      policySales
    };
  },

  async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const { data: { user } } = await getCurrentUser();
      if (!user) throw new Error('משתמש לא מחובר');

      // Get all sales data
      const [
        { data: pensionSales },
        { data: insuranceSales },
        { data: investmentSales },
        { data: policySales }
      ] = await Promise.all([
        supabase.from('sales')
          .select('*')
          .eq('user_id', user.id)
          .eq('sale_type', 'pension'),
        supabase.from('sales')
          .select('*')
          .eq('user_id', user.id)
          .eq('sale_type', 'insurance'),
        supabase.from('sales')
          .select('*')
          .eq('user_id', user.id)
          .eq('sale_type', 'investment'),
        supabase.from('sales')
          .select('*')
          .eq('user_id', user.id)
          .eq('sale_type', 'policy')
      ]);

      // Calculate totals
      const calculateTotal = (sales: any[] | null) => {
        if (!sales) return { count: 0, commission: 0 };
        return {
          count: sales.length,
          commission: sales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0)
        };
      };

      // Get current month's data
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();

      // Get previous month's data
      const startOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString();
      const endOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).toISOString();

      const filterByDateRange = (sales: any[] | null, start: string, end: string) => {
        if (!sales) return [];
        return sales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= new Date(start) && saleDate <= new Date(end);
        });
      };

      // Calculate stats
      const pensionStats = calculateTotal(pensionSales);
      const insuranceStats = calculateTotal(insuranceSales);
      const investmentStats = calculateTotal(investmentSales);
      const policyStats = calculateTotal(policySales);

      // Calculate current month stats
      const currentMonthPensionStats = calculateTotal(filterByDateRange(pensionSales, startOfMonth, endOfMonth));
      const currentMonthInsuranceStats = calculateTotal(filterByDateRange(insuranceSales, startOfMonth, endOfMonth));
      const currentMonthInvestmentStats = calculateTotal(filterByDateRange(investmentSales, startOfMonth, endOfMonth));
      const currentMonthPolicyStats = calculateTotal(filterByDateRange(policySales, startOfMonth, endOfMonth));

      // Calculate previous month stats
      const prevMonthPensionStats = calculateTotal(filterByDateRange(pensionSales, startOfPrevMonth, endOfPrevMonth));
      const prevMonthInsuranceStats = calculateTotal(filterByDateRange(insuranceSales, startOfPrevMonth, endOfPrevMonth));
      const prevMonthInvestmentStats = calculateTotal(filterByDateRange(investmentSales, startOfPrevMonth, endOfPrevMonth));
      const prevMonthPolicyStats = calculateTotal(filterByDateRange(policySales, startOfPrevMonth, endOfPrevMonth));

      return {
        total: {
          pension: pensionStats,
          insurance: insuranceStats,
          investment: investmentStats,
          policy: policyStats,
          commission: pensionStats.commission + insuranceStats.commission + 
                     investmentStats.commission + policyStats.commission,
          count: pensionStats.count + insuranceStats.count + 
                 investmentStats.count + policyStats.count
        },
        currentMonth: {
          pension: currentMonthPensionStats,
          insurance: currentMonthInsuranceStats,
          investment: currentMonthInvestmentStats,
          policy: currentMonthPolicyStats,
          commission: currentMonthPensionStats.commission + currentMonthInsuranceStats.commission + 
                     currentMonthInvestmentStats.commission + currentMonthPolicyStats.commission,
          count: currentMonthPensionStats.count + currentMonthInsuranceStats.count + 
                 currentMonthInvestmentStats.count + currentMonthPolicyStats.count
        },
        previousMonth: {
          pension: prevMonthPensionStats,
          insurance: prevMonthInsuranceStats,
          investment: prevMonthInvestmentStats,
          policy: prevMonthPolicyStats,
          commission: prevMonthPensionStats.commission + prevMonthInsuranceStats.commission + 
                     prevMonthInvestmentStats.commission + prevMonthPolicyStats.commission,
          count: prevMonthPensionStats.count + prevMonthInsuranceStats.count + 
                 prevMonthInvestmentStats.count + prevMonthPolicyStats.count
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}; 