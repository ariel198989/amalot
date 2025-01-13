import { supabase, getCurrentUser } from '@/lib/supabase';
import { 
  CustomerJourney, 
  PensionProduct, 
  InsuranceProduct, 
  InvestmentProduct, 
  PolicyProduct 
} from '@/components/calculators/CustomerJourneyTypes';
import { getAgentAgreement } from '@/services/AgentAgreementService';
import { calculateCommissions } from '@/services/AgentAgreementService';

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
      const userResponse = await getCurrentUser();
      if (!userResponse?.data?.user) throw new Error('משתמש לא מחובר');
      const user = userResponse.data.user;

      // קבלת הסכם הסוכן פעם אחת בלבד
      const agentAgreement = await getAgentAgreement(user.id);
      if (!agentAgreement) {
        throw new Error('לא נמצא הסכם סוכן');
      }

      // Extract client info from the first product or client_info
      const clientName = journey.selected_products[0]?.details?.client_name || 
                        journey.client_info?.fullName;
      const clientPhone = journey.selected_products[0]?.details?.client_phone || 
                         journey.client_info?.phone || '';

      if (!clientName) {
        throw new Error('חובה להזין שם לקוח');
      }

      // Create journey data with only the fields that exist in the table
      const journeyData = {
        user_id: user.id,
        date: journey.date,
        client_name: clientName,
        client_phone: clientPhone,
        total_commission: journey.selected_products.reduce((sum, product) => {
          const details = product.details as any;
          return sum + (details.total_commission || details.scope_commission || 0);
        }, 0)
      };

      // Save journey
      const { data: savedJourney, error: journeyError } = await supabase
        .from('customer_journeys')
        .insert([journeyData])
        .select()
        .single();

      if (journeyError) throw journeyError;

      const journey_id = savedJourney.id;

      // שמירת המוצרים
      for (const product of journey.selected_products) {
        switch (product.type) {
          case 'pension': {
            const pensionProduct = product.details as PensionProduct;
            
            // קבלת נתוני העמלות מהפונקציה המרכזית
            const commissionResult = await calculateCommissions(
              user.id,
              'pension',
              product.company,
              Number(pensionProduct.pensionsalary) || 0,
              String(pensionProduct.provision_rate),
              Number(pensionProduct.pensionaccumulation) || 0
            );

            const pensionData = {
              user_id: user.id,
              journey_id,
              client_name: journeyData.client_name,
              client_phone: journeyData.client_phone,
              company: product.company,
              date: journey.date,
              pensionsalary: Number(pensionProduct.pensionsalary) || 0,
              pensionaccumulation: Number(pensionProduct.pensionaccumulation) || 0,
              pensioncontribution: Number(pensionProduct.pensioncontribution) || 0,
              provision_rate: Number(pensionProduct.provision_rate) || 0,
              commission_rate: Math.min(
                Math.round(
                  (commissionResult.scope_commission / 
                  (Number(pensionProduct.pensioncontribution) || 1) * 100) * 100
                ) / 100,
                99.99
              ),
              scope_commission: commissionResult.scope_commission,  // עמלת היקף על ההפקדות
              monthly_commission: commissionResult.monthly_commission,  // עמלת היקף על הצבירה
              agent_number: pensionProduct.agent_number || '',
              status: 'active'
            };

            console.log('Saving pension data:', {
              ...pensionData,
              accumulationCommission: commissionResult.monthly_commission,  // עמלת היקף על הצבירה
              totalCommission: commissionResult.total_commission
            });

            const { error: pensionError } = await supabase
              .from('pension_sales')
              .insert([pensionData]);

            if (pensionError) {
              console.error('Error saving pension data:', pensionError);
              throw pensionError;
            }

            await this.updatePerformanceMetrics({
              type: 'pension',
              pensionaccumulation: pensionData.pensionaccumulation
            });
            break;
          }

          case 'insurance': {
            const details = product.details as InsuranceProduct;
            const insuranceData = {
              user_id: user.id,
              journey_id,
              client_name: journeyData.client_name,
              client_phone: journeyData.client_phone,
              company: product.company,
              date: journey.date,
              premium: details.premium || 0,
              insurance_type: details.insurance_type || '',
              payment_method: details.payment_method || 'monthly',
              nifraim: (details.monthly_commission || 0) * 12,
              scope_commission: details.scope_commission || 0,
              monthly_commission: details.monthly_commission || 0,
              agent_number: details.agent_number || ''
            };

            const { error: insuranceError } = await supabase
              .from('insurance_sales')
              .insert([insuranceData]);

            if (insuranceError) throw insuranceError;

            await this.updatePerformanceMetrics({
              type: 'insurance',
              premium: insuranceData.premium
            });
            break;
          }

          case 'investment': {
            const details = product.details as InvestmentProduct;
            const investmentData = {
              user_id: user.id,
              journey_id,
              client_name: journeyData.client_name,
              client_phone: journeyData.client_phone,
              company: product.company,
              date: journey.date,
              investment_amount: details.investment_amount || 0,
              investment_type: details.investment_type || '',
              scope_commission: details.scope_commission || 0,
              monthly_commission: details.monthly_commission || 0,
              nifraim: (details.monthly_commission || 0) * 12,
              agent_number: details.agent_number || ''
            };

            const { error: investmentError } = await this.saveInvestmentProduct(investmentData);
            if (investmentError) throw investmentError;

            await this.updatePerformanceMetrics({
              type: 'savings_and_study',
              details: {
                investmentAmount: investmentData.investment_amount
              }
            });
            break;
          }

          case 'policy': {
            const details = product.details as PolicyProduct;
            const policyData = {
              user_id: user.id,
              journey_id,
              client_name: journeyData.client_name,
              client_phone: journeyData.client_phone,
              company: product.company,
              date: journey.date,
              policy_amount: details.policy_amount || 0,
              policy_period: details.policy_period || 12,
              policy_type: details.policy_type || '',
              scope_commission: details.scope_commission || 0,
              total_commission: details.total_commission || 0,
              agent_number: details.agent_number || ''
            };

            const { error: policyError } = await supabase
              .from('policy_sales')
              .insert([policyData]);

            if (policyError) throw policyError;
            break;
          }
        }
      }

      // After saving the journey, update performance metrics
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // 1-12
      const currentYear = currentDate.getFullYear();

      // Calculate total commission for each product type
      const productTypeCommissions = new Map<string, number>();
      journey.selected_products.forEach(product => {
        const currentCommission = productTypeCommissions.get(product.type) || 0;
        const details = product.details as any;
        const newCommission = Number(details.total_commission || details.scope_commission || 0);
        productTypeCommissions.set(product.type, currentCommission + newCommission);
      });

      // Update sales_targets for each product type
      for (const [productType, commission] of productTypeCommissions) {
        const roundedCommission = Math.min(
          Math.round(commission * 100) / 100,
          9999999999.99
        );

        // Get current performance
        const { data: currentPerformance } = await supabase
          .from('sales_targets')
          .select('performance')
          .eq('user_id', user.id)
          .eq('year', currentYear)
          .eq('month', currentMonth)
          .eq('category', productType)
          .single();

        if (currentPerformance) {
          // Update existing record
          const newPerformance = Math.min(
            Math.round((currentPerformance.performance + roundedCommission) * 100) / 100,
            9999999999.99
          );

          await supabase
            .from('sales_targets')
            .update({ performance: newPerformance })
            .eq('user_id', user.id)
            .eq('year', currentYear)
            .eq('month', currentMonth)
            .eq('category', productType);
        } else {
          // Insert new record
          await supabase
            .from('sales_targets')
            .insert({
              user_id: user.id,
              year: currentYear,
              month: currentMonth,
              category: productType,
              performance: roundedCommission,
              target: 0 // Default target value
            });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving customer journey:', error);
      throw error;
    }
  },

  async fetchAllSales() {
    try {
      const userResponse = await getCurrentUser();
      if (!userResponse?.data?.user) throw new Error('משתמש לא מחובר');
      const user = userResponse.data.user;

      // Fetch from all sales tables
      const [
        { data: pensionSales = [], error: pensionError },
        { data: insuranceSales = [], error: insuranceError },
        { data: investmentSales = [], error: investmentError },
        { data: policySales = [], error: policyError }
      ] = await Promise.all([
        supabase.from('pension_sales').select('*').eq('user_id', user.id),
        supabase.from('insurance_sales').select('*').eq('user_id', user.id),
        supabase.from('investment_sales').select('*').eq('user_id', user.id),
        supabase.from('policy_sales').select('*').eq('user_id', user.id)
      ]);

      // Check for errors
      if (pensionError) throw pensionError;
      if (insuranceError) throw insuranceError;
      if (investmentError) throw investmentError;
      if (policyError) throw policyError;

      // Return separate arrays for each type
      return {
        pensionSales: pensionSales || [],
        insuranceSales: insuranceSales || [],
        investmentSales: investmentSales || [],
        policySales: policySales || []
      };
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  },

  async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const userResponse = await getCurrentUser();
      if (!userResponse?.data?.user) throw new Error('משתמש לא מחובר');
      const user = userResponse.data.user;

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
        metric_type: '',
        user_id: user.id
      };

      if (saleData.type === 'pension') {
        // פנסיה - מתייחסים רק לצבירה שעוברת
        const transferAmount = Number(saleData.pensionaccumulation || 
                             saleData.details?.pensionaccumulation || 
                             saleData.transfer_amount || 0);

        console.log('Processing pension transfer:', {
          originalData: saleData,
          transferAmount
        });

        updateData = {
          category: 'pension-transfer',
          performance_value: Math.min(Math.round(transferAmount * 100) / 100, 9999999999.99),
          metric_type: 'transfer_amount',
          user_id: user.id
        };
      } else if (saleData.type === 'finance' || saleData.type === 'savings_and_study') {
        // מיננסים - מתייחסים רק לצבירה שעוברת
        const transferAmount = Number(saleData.details?.investmentAmount || 
                             saleData.investmentAmount || 
                             saleData.investment_amount || 0);
        
        console.log('Processing finance transfer:', {
          originalData: saleData,
          transferAmount
        });

        updateData = {
          category: 'finance-transfer',
          performance_value: Math.min(Math.round(transferAmount * 100) / 100, 9999999999.99),
          metric_type: 'transfer_amount',
          user_id: user.id
        };
      } else if (saleData.type === 'insurance') {
        // סיכונים - מתייחסים רק לפרמיה החודשית
        const monthlyPremium = Number(saleData.details?.insurancePremium || 
                             saleData.insurancePremium || 
                             saleData.premium || 0);

        console.log('Processing insurance premium:', {
          originalData: saleData,
          monthlyPremium
        });

        // אם זה תשלום חד פעמי, נחלק ב-12 כדי לקבל את הפרמיה החודשית
        const actualMonthlyPremium = saleData.payment_method === 'one_time' ? 
          monthlyPremium / 12 : monthlyPremium;

        updateData = {
          category: 'risks',
          performance_value: Math.min(Math.round(actualMonthlyPremium * 100) / 100, 9999999999.99),
          metric_type: 'monthly_premium',
          user_id: user.id
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
          user_id: updateData.user_id,
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
      const currentPerformance = Number(existingTarget?.performance || 0);
      
      // בדיקה שהסכום החדש לא יגרום לגלישה
      if (currentPerformance + updateData.performance_value > 9999999999.99) {
        console.warn('Performance value would overflow, skipping update');
        return { success: false, error: 'Performance value would overflow' };
      }

      const newPerformance = Math.round((currentPerformance + updateData.performance_value) * 100) / 100;

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
            user_id: updateData.user_id,
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
            user_id: updateData.user_id,
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