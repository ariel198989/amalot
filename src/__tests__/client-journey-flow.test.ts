import { clientService } from '../services/clientService';
import { supabase } from '@/lib/supabase';

describe('Client Journey Flow Tests', () => {
  // נתוני טסט
  const testData = {
    // נתוני לקוח
    client: {
      first_name: 'ישראל',
      last_name: 'ישראלי',
      id_number: '123456789',
      mobile_phone: '0501234567',
      email: 'test@example.com',
      status: 'active',
      user_id: 'test-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // נתוני מכירת פנסיה
    pensionSale: {
      salary: 15000,
      provision_rate: 20,
      commission_rate: 7,
      accumulation: 500000,
      company: 'כלל',
      date: new Date().toISOString().split('T')[0],
      scope_commission: 0, // יחושב אוטומטית
      monthly_commission: 0, // יחושב אוטומטית
      total_commission: 0, // יחושב אוטומטית
      commission_amount: 0 // יחושב אוטומטית
    },
    // נתוני מכירת ביטוח
    insuranceSale: {
      premium: 1000,
      commission_rate: 30,
      payment_method: 'monthly' as const,
      insurance_type: 'life' as const,
      company: 'הראל',
      date: new Date().toISOString().split('T')[0],
      scope_commission: 0, // יחושב אוטומטית
      monthly_commission: 0, // יחושב אוטומטית
      total_commission: 0, // יחושב אוטומטית
      commission_amount: 0, // יחושב אוטומטית
      nifraim: 0 // יחושב אוטומטית
    }
  };

  let clientId: string;
  let journeyId: string;

  beforeAll(async () => {
    // ניקוי נתוני טסט קודמים
    await supabase.from('clients').delete().eq('id_number', testData.client.id_number);
  });

  describe('תהליך מסע לקוח מלא', () => {
    it('1. יצירת לקוח חדש', async () => {
      const client = await clientService.createClient(testData.client);
      clientId = client.id;
      expect(client).toBeDefined();
      expect(client.id).toBeDefined();
      expect(client.first_name).toBe(testData.client.first_name);
      expect(client.last_name).toBe(testData.client.last_name);
    });

    it('2. התחלת מסע לקוח', async () => {
      const journey = await clientService.startClientJourney({
        client_id: clientId,
        user_id: testData.client.user_id
      });
      journeyId = journey.id;
      expect(journey).toBeDefined();
      expect(journey.status).toBe('active');
      expect(journey.client_id).toBe(clientId);
    });

    it('3. הוספת מכירת פנסיה', async () => {
      const pensionSale = await clientService.addPensionSale({
        ...testData.pensionSale,
        client_id: clientId,
        user_id: testData.client.user_id,
        journey_id: journeyId
      });

      expect(pensionSale).toBeDefined();
      expect(pensionSale.id).toBeDefined();

      // בדיקה שהנתונים התעדכנו בדוחות
      const reports = await clientService.getSalesReport({
        user_id: testData.client.user_id,
        start_date: testData.pensionSale.date,
        end_date: testData.pensionSale.date
      });

      expect(reports.pension_sales).toContainEqual(
        expect.objectContaining({
          id: pensionSale.id,
          salary: testData.pensionSale.salary,
          commission_amount: expect.any(Number)
        })
      );

      // בדיקה שהנתונים התעדכנו ביעדים
      const goals = await clientService.getMonthlyGoals({
        user_id: testData.client.user_id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      const pensionGoal = goals.find(g => g.category === 'pension');
      expect(pensionGoal?.target_amount).toBeDefined();
    });

    it('4. הוספת מכירת ביטוח', async () => {
      const insuranceSale = await clientService.addInsuranceSale({
        ...testData.insuranceSale,
        client_id: clientId,
        user_id: testData.client.user_id,
        journey_id: journeyId
      });

      expect(insuranceSale).toBeDefined();
      expect(insuranceSale.id).toBeDefined();

      // בדיקה שהנתונים התעדכנו בדוחות
      const reports = await clientService.getSalesReport({
        user_id: testData.client.user_id,
        start_date: testData.insuranceSale.date,
        end_date: testData.insuranceSale.date
      });

      expect(reports.insurance_sales).toContainEqual(
        expect.objectContaining({
          id: insuranceSale.id,
          premium: testData.insuranceSale.premium,
          commission_amount: expect.any(Number)
        })
      );

      // בדיקה שהנתונים התעדכנו ביעדים
      const goals = await clientService.getMonthlyGoals({
        user_id: testData.client.user_id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      const insuranceGoal = goals.find(g => g.category === 'insurance');
      expect(insuranceGoal?.target_amount).toBeDefined();
    });

    it('5. בדיקת סיכומים בתיק לקוח', async () => {
      const clientPortfolio = await clientService.getClientPortfolio(clientId);

      // בדיקת נתוני פנסיה
      expect(clientPortfolio.pension).toBeDefined();
      expect(clientPortfolio.pension.total_amount).toBeGreaterThan(0);
      expect(clientPortfolio.pension.company).toBe(testData.pensionSale.company);

      // בדיקת נתוני ביטוח
      expect(clientPortfolio.insurance).toBeDefined();
      expect(clientPortfolio.insurance.total_premium).toBeGreaterThan(0);
      expect(clientPortfolio.insurance.products).toContainEqual(
        expect.objectContaining({
          insurance_type: testData.insuranceSale.insurance_type,
          premium: testData.insuranceSale.premium
        })
      );
    });

    it('6. בדיקת עדכון אוטומטי של דוחות', async () => {
      const monthlyReport = await clientService.getMonthlyReport({
        user_id: testData.client.user_id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      // בדיקת סיכומים חודשיים
      expect(monthlyReport.total_commission).toBeGreaterThan(0);
      expect(monthlyReport.sales_count).toBe(2); // פנסיה + ביטוח
      expect(monthlyReport.categories).toEqual(
        expect.objectContaining({
          pension: 1,
          insurance: 1
        })
      );
    });

    it('7. בדיקת עדכון אוטומטי של יעדים', async () => {
      const achievements = await clientService.getAchievements({
        user_id: testData.client.user_id,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      // בדיקת אחוזי עמידה ביעדים
      expect(achievements.pension).toBeDefined();
      expect(achievements.pension.achieved).toBeGreaterThan(0);
      expect(achievements.insurance).toBeDefined();
      expect(achievements.insurance.achieved).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    // ניקוי נתוני הטסט
    if (clientId) {
      await supabase.from('clients').delete().eq('id', clientId);
      await supabase.from('client_journeys').delete().eq('client_id', clientId);
      await supabase.from('pension_sales').delete().eq('client_id', clientId);
      await supabase.from('insurance_sales').delete().eq('client_id', clientId);
    }
  });
}); 