import { clientService } from '../services/clientService';
import { supabase } from '@/lib/supabase';

describe('Reports System Tests', () => {
  const testData = {
    user_id: 'test-user-id',
    client: {
      id: 'test-client-id',
      first_name: 'ישראל',
      last_name: 'ישראלי'
    },
    // מכירת פנסיה לדוגמה
    pensionSale: {
      salary: 15000,
      provision_rate: 20,
      commission_rate: 7,
      accumulation: 500000,
      company: 'כלל',
      date: new Date().toISOString().split('T')[0]
    },
    // מכירת ביטוח לדוגמה
    insuranceSale: {
      premium: 1000,
      commission_rate: 30,
      payment_method: 'monthly',
      insurance_type: 'life',
      company: 'הראל',
      date: new Date().toISOString().split('T')[0]
    }
  };

  beforeAll(async () => {
    // הכנת נתוני טסט
    await clientService.addPensionSale({
      ...testData.pensionSale,
      client_id: testData.client.id,
      user_id: testData.user_id
    });

    await clientService.addInsuranceSale({
      ...testData.insuranceSale,
      client_id: testData.client.id,
      user_id: testData.user_id
    });
  });

  describe('דוחות מכירות', () => {
    it('should generate daily sales report', async () => {
      const today = new Date().toISOString().split('T')[0];
      const report = await clientService.getSalesReport({
        user_id: testData.user_id,
        start_date: today,
        end_date: today
      });

      expect(report).toBeDefined();
      expect(report.total_commission).toBeGreaterThan(0);
      expect(report.sales_count).toBe(2); // פנסיה + ביטוח
    });

    it('should calculate correct commission totals', async () => {
      const report = await clientService.getSalesReport({
        user_id: testData.user_id,
        start_date: testData.pensionSale.date,
        end_date: testData.pensionSale.date
      });

      // חישוב עמלת פנסיה צפויה
      const expectedPensionCommission = 
        (testData.pensionSale.salary * 12 * (testData.pensionSale.commission_rate / 100) * (testData.pensionSale.provision_rate / 100)) +
        (testData.pensionSale.accumulation * 0.0003);

      expect(report.pension_sales[0].commission).toBe(expectedPensionCommission);
    });

    it('should filter reports by date range', async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const report = await clientService.getSalesReport({
        user_id: testData.user_id,
        start_date: lastMonth.toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      });

      expect(report.sales_count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('דוחות יעדים', () => {
    it('should track goals progress', async () => {
      const goals = await clientService.getMonthlyGoals({
        user_id: testData.user_id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      const pensionGoal = goals.find(g => g.category === 'pension');
      const insuranceGoal = goals.find(g => g.category === 'insurance');

      expect(pensionGoal?.achieved_amount).toBeGreaterThan(0);
      expect(insuranceGoal?.achieved_amount).toBeGreaterThan(0);
    });

    it('should calculate achievement percentages', async () => {
      const achievements = await clientService.getAchievements({
        user_id: testData.user_id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      expect(achievements.pension.percentage).toBeDefined();
      expect(achievements.insurance.percentage).toBeDefined();
    });
  });

  describe('דוחות לקוחות', () => {
    it('should generate client portfolio report', async () => {
      const portfolio = await clientService.getClientPortfolio(testData.client.id);

      expect(portfolio.pension).toBeDefined();
      expect(portfolio.insurance).toBeDefined();
      expect(portfolio.total_value).toBeGreaterThan(0);
    });

    it('should track client history', async () => {
      const history = await clientService.getClientHistory(testData.client.id);

      expect(history.sales).toHaveLength(2);
      expect(history.total_commission).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    // ניקוי נתוני הטסט
    await supabase.from('pension_sales')
      .delete()
      .eq('client_id', testData.client.id);
    
    await supabase.from('insurance_sales')
      .delete()
      .eq('client_id', testData.client.id);
  });
}); 