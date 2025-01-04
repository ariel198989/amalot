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

      // עמירת מסע הלקוח
      const { data: journeyData, error: journeyError } = await supabase
        .from('customer_journeys')
        .insert([{
          user_id: journey.user_id,
          client_name: journey.client_name,
          client_phone: journey.client_phone || '',
          date: journey.date,
          total_commission: journey.total_commission
        }])
        .select()
        .single();

      if (journeyError) throw journeyError;

      const journey_id = journeyData.id;

      // שמירת המוצרים
      for (const product of journey.selected_products) {
        switch (product.type) {
          case 'pension': {
            // שמירת מוצר פנסיה
            console.log('Raw pension product:', product.details);
            const pensionProduct = product.details as PensionProduct;
            console.log('Pension product after casting:', pensionProduct);
            
            // בדיקה שפורטת של הערכים
            if ('pensionsalary' in product.details && 'pensionaccumulation' in product.details && 'pensioncontribution' in product.details) {
              console.log('Detailed pension values:', {
                rawSalary: product.details.pensionsalary,
                rawAccumulation: product.details.pensionaccumulation,
                rawContribution: product.details.pensioncontribution,
                castedSalary: pensionProduct.pensionsalary,
                castedAccumulation: pensionProduct.pensionaccumulation,
                castedContribution: pensionProduct.pensioncontribution,
                originalClient: journey.selected_products.find(p => p.type === 'pension')?.details
              });

              const pensionData = {
                user_id: user.id,
                client_name: journey.client_name,
                client_phone: journey.client_phone || '',
                company: product.company,
                date: new Date(journey.date).toISOString(),
                pensionsalary: Number(pensionProduct.pensionsalary) || 0,
                pensionaccumulation: Number(pensionProduct.pensionaccumulation) || 0,
                pensioncontribution: Number(pensionProduct.pensioncontribution) || 0,
                provision_rate: Number(pensionProduct.pensioncontribution) || 0,
                commission_rate: (Number(pensionProduct.scope_commission) || 0) / (Number(pensionProduct.pensionsalary) || 1) * 100,
                scope_commission: Number(pensionProduct.scope_commission) || 0,
                monthly_commission: Number(pensionProduct.monthly_commission) || 0,
                journey_id: journey_id,
                status: 'active'
              };

              const { error: pensionError } = await supabase
                .from('pension_sales')
                .insert([pensionData]);

              if (pensionError) {
                console.error('Pension save error:', pensionError);
                throw pensionError;
              }

              // עדכון ביצועים לפנסיה
              await this.updatePerformanceMetrics({
                type: 'pension',
                pensionaccumulation: pensionData.pensionaccumulation
              });
            } else {
              console.error('Missing required pension fields:', product.details);
              throw new Error('חסרים שדות חובה במוצר פנסיה');
            }
            break;
          }

          case 'insurance': {
            // שמירת מוצר ביטוח
            const details = product.details as InsuranceProduct;
            console.log('Current user:', user);
            
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
              journey_id: journey_id
            };

            const { error: insuranceError } = await supabase
              .from('insurance_sales')
              .insert([insuranceData]);

            if (insuranceError) {
              console.error('Insurance save error:', insuranceError);
              console.error('Failed insurance data:', insuranceData);
              throw insuranceError;
            }

            // עדכון ביצועים לביטוח
            await this.updatePerformanceMetrics({
              type: 'insurance',
              premium: insuranceData.premium
            });
            break;
          }

          case 'investment': {
            const details = product.details as InvestmentProduct;
            console.log('Investment product before saving:', {
              raw_details: details,
              monthly_commission: details.monthly_commission,
              calculated_nifraim: details.monthly_commission ? details.monthly_commission * 12 : 0
            });
            
            const investmentData = {
              user_id: journey.user_id,
              client_name: journey.client_name,
              client_phone: journey.client_phone || '',
              company: product.company,
              date: new Date(journey.date).toISOString(),
              investment_amount: details.investment_amount || 0,
              investment_type: details.investment_type,
              scope_commission: details.scope_commission || 0,
              monthly_commission: details.monthly_commission || 0,
              nifraim: details.monthly_commission ? details.monthly_commission * 12 : 0,
              journey_id: journey_id
            };

            console.log('Investment data to save:', investmentData);
            const { error: investmentError } = await this.saveInvestmentProduct(investmentData);
            if (investmentError) throw investmentError;

            // עדכון ביצועים להשקעות
            await this.updatePerformanceMetrics({
              type: 'savings_and_study',
              details: {
                investmentAmount: investmentData.investment_amount
              }
            });
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
              journey_id: journey_id
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

      // Fetch all sales data
      const [
        { data: pensionSales, error: pensionError },
        { data: insuranceSales, error: insuranceError },
        { data: investmentSales, error: investmentError }
      ] = await Promise.all([
        supabase.from('pension_sales').select('*').eq('user_id', user.id),
        supabase.from('insurance_sales').select('*').eq('user_id', user.id),
        supabase.from('investment_sales').select('*').eq('user_id', user.id)
      ]);

      if (pensionError || insuranceError || investmentError) {
        throw new Error('שגיאה בטעינת נתוני מכירות');
      }

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Filter sales by month
      const filterByMonth = (sales: any[], month: number, year: number) => {
        return sales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getMonth() === month && saleDate.getFullYear() === year;
        });
      };

      // Calculate stats for a set of sales
      const calculateStats = (sales: any[]) => ({
        count: sales.length,
        commission: sales.reduce((sum, sale) => {
          const scopeCommission = Number(sale.scope_commission) || 0;
          const nifraim = Number(sale.nifraim) || 0;
          return sum + scopeCommission + nifraim;
        }, 0)
      });

      // Current month sales
      const currentMonthPensionSales = filterByMonth(pensionSales || [], currentMonth, currentYear);
      const currentMonthInsuranceSales = filterByMonth(insuranceSales || [], currentMonth, currentYear);
      const currentMonthInvestmentSales = filterByMonth(investmentSales || [], currentMonth, currentYear);

      // Previous month sales
      const previousMonthPensionSales = filterByMonth(pensionSales || [], previousMonth, previousYear);
      const previousMonthInsuranceSales = filterByMonth(insuranceSales || [], previousMonth, previousYear);
      const previousMonthInvestmentSales = filterByMonth(investmentSales || [], previousMonth, previousYear);

      // Calculate total stats
      const totalStats = {
        pension: calculateStats(pensionSales || []),
        insurance: calculateStats(insuranceSales || []),
        investment: calculateStats(investmentSales || []),
        policy: { count: 0, commission: 0 },
        commission: 0,
        count: 0
      };

      // Calculate current month stats
      const currentMonthStats = {
        pension: calculateStats(currentMonthPensionSales),
        insurance: calculateStats(currentMonthInsuranceSales),
        investment: calculateStats(currentMonthInvestmentSales),
        policy: { count: 0, commission: 0 },
        commission: 0,
        count: 0
      };

      // Calculate previous month stats
      const previousMonthStats = {
        pension: calculateStats(previousMonthPensionSales),
        insurance: calculateStats(previousMonthInsuranceSales),
        investment: calculateStats(previousMonthInvestmentSales),
        policy: { count: 0, commission: 0 },
        commission: 0,
        count: 0
      };

      // Calculate totals
      totalStats.commission = totalStats.pension.commission + totalStats.insurance.commission + totalStats.investment.commission;
      totalStats.count = totalStats.pension.count + totalStats.insurance.count + totalStats.investment.count;

      currentMonthStats.commission = currentMonthStats.pension.commission + currentMonthStats.insurance.commission + currentMonthStats.investment.commission;
      currentMonthStats.count = currentMonthStats.pension.count + currentMonthStats.insurance.count + currentMonthStats.investment.count;

      previousMonthStats.commission = previousMonthStats.pension.commission + previousMonthStats.insurance.commission + previousMonthStats.investment.commission;
      previousMonthStats.count = previousMonthStats.pension.count + previousMonthStats.insurance.count + previousMonthStats.investment.count;

      return {
        total: totalStats,
        currentMonth: currentMonthStats,
        previousMonth: previousMonthStats
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  updatePerformanceMetrics: async (saleData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Updating performance metrics for sale:', saleData);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // עדכון ביצועים לפי סוג המכירה
      let updateData = {
        category: '',
        performance_value: 0,
        metric_type: ''
      };

      if (saleData.type === 'pension') {
        // פנסיה - מתייחסים רק לצבירה שעוברת
        const transferAmount = saleData.pensionaccumulation || 
                             saleData.details?.pensionaccumulation || 
                             saleData.transfer_amount || 0;

        console.log('Processing pension transfer:', {
          originalData: saleData,
          transferAmount
        });

        updateData = {
          category: 'pension-transfer',
          performance_value: transferAmount,
          metric_type: 'transfer_amount'
        };
      } else if (saleData.type === 'finance' || saleData.type === 'savings_and_study') {
        // מיננסים - מתייחסים רק לצבירה שעוברת
        const transferAmount = saleData.details?.investmentAmount || 
                             saleData.investmentAmount || 
                             saleData.investment_amount || 0;
        
        console.log('Processing finance transfer:', {
          originalData: saleData,
          transferAmount
        });

        updateData = {
          category: 'finance-transfer',
          performance_value: transferAmount,
          metric_type: 'transfer_amount'
        };
      } else if (saleData.type === 'insurance') {
        // סיכונים - מתייחסים רק לפרמיה החודשית
        const monthlyPremium = saleData.details?.insurancePremium || 
                             saleData.insurancePremium || 
                             saleData.premium || 0;

        console.log('Processing insurance premium:', {
          originalData: saleData,
          monthlyPremium
        });

        updateData = {
          category: 'risks',
          performance_value: monthlyPremium,
          metric_type: 'monthly_premium'
        };
      }

      console.log('Update data prepared:', updateData);

      if (!updateData.category || updateData.performance_value === 0) {
        console.error('Invalid update data:', updateData);
        return { success: false, error: 'Invalid sale data' };
      }

      // מציאת הרשומה הקיימת
      const { data: existingTarget, error: fetchError } = await supabase
        .from('sales_targets')
        .select('performance, target_amount')
        .match({
          user_id: user.id,
          category: updateData.category,
          month: currentMonth,
          year: currentYear,
          metric_type: updateData.metric_type
        })
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing target:', fetchError);
        throw fetchError;
      }

      console.log('Existing target found:', existingTarget);

      // עדכון הביצועים - הוספת הערך החדש לסכום הקיים
      const newPerformance = (existingTarget?.performance || 0) + updateData.performance_value;

      let updateResult;
      if (existingTarget) {
        // אם קיימת רשומה - נעדכן אותה
        updateResult = await supabase
          .from('sales_targets')
          .update({
            performance: newPerformance,
            updated_at: new Date().toISOString()
          })
          .match({
            user_id: user.id,
            category: updateData.category,
            month: currentMonth,
            year: currentYear,
            metric_type: updateData.metric_type
          });
      } else {
        // אם לא קיימת רשומה - ניצור חדשה
        updateResult = await supabase
          .from('sales_targets')
          .insert({
            user_id: user.id,
            category: updateData.category,
            month: currentMonth,
            year: currentYear,
            performance: newPerformance,
            metric_type: updateData.metric_type,
            target_amount: 0,
            updated_at: new Date().toISOString()
          });
      }

      if (updateResult.error) {
        console.error('Error updating performance metrics:', updateResult.error);
        throw updateResult.error;
      }

      console.log('Performance metrics updated successfully:', {
        category: updateData.category,
        newPerformance,
        month: currentMonth,
        year: currentYear
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating performance metrics:', error);
      return { success: false, error };
    }
  },

  async saveInvestmentProduct(investmentData: any) {
    try {
      console.log('Investment data to save:', investmentData);
      
      // הסרת total_commission כי זו עמודה מחושבת בדאטאבייס
      const { total_commission, ...dataToSave } = investmentData;
      
      const { data, error } = await supabase
        .from('investment_sales')
        .insert([dataToSave])
        .select();

      if (error) {
        console.error('Investment save error:', error);
        throw error;
      }

      console.log('Investment saved successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Investment save error:', error);
      return { data: null, error };
    }
  }
}; 