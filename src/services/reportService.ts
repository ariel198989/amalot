import { supabase } from '@/lib/supabaseClient';

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