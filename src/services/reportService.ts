import { supabase } from '@/lib/supabaseClient';
import { CustomerJourney, ProductDetails } from '@/components/calculators/CustomerJourneyTypes';

export interface SalesData {
  id: string;
  date: string;
  client_name: string;
  total_commission: number;
  revenue?: number;
  company: string;
  user_id: string;
}

export interface ProductDistribution {
  type: 'pension' | 'insurance' | 'investment' | 'policy';
  count: number;
  commission: number;
  details: SalesData[];
}

export interface DashboardStats {
  totalSales: number;
  totalCommission: number;
  monthlySales: {
    month: string;
    count: number;
    totalCommission: number;
    totalRevenue: number;
  }[];
  productDistribution: ProductDistribution[];
}

export const reportService = {
  async fetchDashboardStats(): Promise<DashboardStats> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('משתמש לא מחובר');

    // קבלת כל הנתונים מהטבלאות השונות
    const [
      { data: pensionSales },
      { data: insuranceSales },
      { data: investmentSales }
    ] = await Promise.all([
      supabase.from('pension_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('insurance_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('investment_sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ]);

    // חישוב סה"כ מכירות ועמלות
    const allSales = [
      ...(pensionSales || []), 
      ...(insuranceSales || []), 
      ...(investmentSales || [])
    ] as SalesData[];
    
    const totalSales = allSales.length;
    const totalCommission = allSales.reduce((sum: number, sale: SalesData) => 
      sum + (sale.total_commission || 0), 0);

    // חישוב נתונים חודשיים
    const monthlySales = calculateMonthlySales(allSales);

    // חישוב התפלגות מוצרים
    const productDistribution: ProductDistribution[] = [
      {
        type: 'pension',
        count: pensionSales?.length || 0,
        commission: pensionSales?.reduce((sum: number, sale: SalesData) => 
          sum + (sale.total_commission || 0), 0) || 0,
        details: pensionSales || []
      },
      {
        type: 'insurance',
        count: insuranceSales?.length || 0,
        commission: insuranceSales?.reduce((sum: number, sale: SalesData) => 
          sum + (sale.total_commission || 0), 0) || 0,
        details: insuranceSales || []
      },
      {
        type: 'investment',
        count: investmentSales?.length || 0,
        commission: investmentSales?.reduce((sum: number, sale: SalesData) => 
          sum + (sale.total_commission || 0), 0) || 0,
        details: investmentSales || []
      }
    ];

    return {
      totalSales,
      totalCommission,
      monthlySales,
      productDistribution
    };
  },

  async saveCustomerJourney(journey: CustomerJourney) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      // Save pension sales
      if (journey.selected_products.includes('pension')) {
        const pensionDetails = journey.commission_details.pension;
        for (const [company, details] of Object.entries(pensionDetails.companies)) {
          const pensionData = {
            user_id: user.id,
            client_name: journey.client_name,
            client_phone: journey.client_phone || '',
            company: company,
            date: journey.date,
            pensionsalary: Number(journey.details?.pension?.salary || 0),
            pensionaccumulation: Number(journey.details?.pension?.accumulation || 0),
            pensioncontribution: Number(journey.details?.pension?.provision || 0),
            scope_commission: Number(details.scopeCommission || 0),
            monthly_commission: Number(details.accumulationCommission || 0),
            total_commission: Number(details.totalCommission || 0),
            journey_id: journey.id || '',
            notes: ''
          };
          
          console.log('Pension data to insert:', JSON.stringify(pensionData, null, 2));
          const { data, error } = await supabase
            .from('pension_sales')
            .insert([pensionData])
            .select();

          if (error) {
            console.error('Full error details:', error);
            throw error;
          }
          console.log('Inserted pension data:', data);
        }
      }

      // Save insurance sales
      if (journey.selected_products.includes('insurance')) {
        const insuranceDetails = journey.commission_details.insurance;
        for (const [company, details] of Object.entries(insuranceDetails.companies)) {
          const insuranceData = {
            user_id: user.id,
            client_name: journey.client_name,
            client_phone: journey.client_phone || '',
            company: company,
            date: journey.date,
            insurancepremium: Number(journey.details?.insurance?.premium || 0),
            scope_commission: Number(details.oneTimeCommission || 0),
            monthly_commission: Number(details.monthlyCommission || 0),
            total_commission: Number(details.totalCommission || 0),
            journey_id: journey.id || '',
            notes: ''
          };

          console.log('Insurance data to insert:', JSON.stringify(insuranceData, null, 2));
          const { data, error } = await supabase
            .from('insurance_sales')
            .insert([insuranceData])
            .select();

          if (error) {
            console.error('Full error details:', error);
            throw error;
          }
          console.log('Inserted insurance data:', data);
        }
      }

      // Save investment sales
      if (journey.selected_products.includes('savings_and_study')) {
        const investmentDetails = journey.commission_details.investment;
        for (const [company, details] of Object.entries(investmentDetails.companies)) {
          const investmentData = {
            user_id: user.id,
            client_name: journey.client_name,
            client_phone: journey.client_phone || '',
            company: company,
            date: journey.date,
            investmentamount: Number(journey.details?.investment?.amount || 0),
            scope_commission: Number(details.scopeCommission || 0),
            total_commission: Number(details.totalCommission || 0),
            journey_id: journey.id || '',
            notes: ''
          };

          console.log('Investment data to insert:', JSON.stringify(investmentData, null, 2));
          const { data, error } = await supabase
            .from('investment_sales')
            .insert([investmentData])
            .select();

          if (error) {
            console.error('Full error details:', error);
            throw error;
          }
          console.log('Inserted investment data:', data);
        }
      }

      // Save policy sales
      if (journey.selected_products.includes('policy')) {
        const policyDetails = journey.commission_details.policy;
        for (const [company, details] of Object.entries(policyDetails.companies)) {
          const policyData = {
            user_id: user.id,
            client_name: journey.client_name,
            client_phone: journey.client_phone || '',
            company: company,
            date: journey.date,
            policyamount: Number(journey.details?.policy?.amount || 0),
            scope_commission: Number(details.scopeCommission || 0),
            total_commission: Number(details.totalCommission || 0),
            journey_id: journey.id || '',
            notes: ''
          };

          console.log('Policy data to insert:', JSON.stringify(policyData, null, 2));
          const { data, error } = await supabase
            .from('policy_sales')
            .insert([policyData])
            .select();

          if (error) {
            console.error('Full error details:', error);
            throw error;
          }
          console.log('Inserted policy data:', data);
        }
      }
    } catch (error) {
      console.error('Error in saveCustomerJourney:', error);
      throw error;
    }
  }
};

function calculateMonthlySales(sales: SalesData[]) {
  const monthlyData = sales.reduce((acc: Record<string, any>, sale: SalesData) => {
    const month = new Date(sale.date).toISOString().slice(0, 7); // YYYY-MM format
    if (!acc[month]) {
      acc[month] = {
        month,
        count: 0,
        totalCommission: 0,
        totalRevenue: 0
      };
    }
    acc[month].count++;
    acc[month].totalCommission += sale.total_commission || 0;
    acc[month].totalRevenue += sale.revenue || 0;
    return acc;
  }, {});

  return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
} 