import { clientService } from '../services/clientService';
import { supabase } from '@/lib/supabase';

describe('Goals Tracking System Tests', () => {
  const testData = {
    user_id: 'test-user-id',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    goals: {
      pension: {
        target: 1000000,
        achieved: 0
      },
      insurance: {
        target: 500000,
        achieved: 0
      }
    }
  };

  beforeAll(async () => {
    // מחיקת יעדים קודמים
    await supabase.from('sales_targets')
      .delete()
      .eq('user_id', testData.user_id)
      .eq('month', testData.month)
      .eq('year', testData.year);

    // הגדרת יעדים חדשים
    await Promise.all([
      clientService.setMonthlyGoal({
        user_id: testData.user_id,
        category: 'pension',
        month: testData.month,
        year: testData.year,
        target_amount: testData.goals.pension.target
      }),
      clientService.setMonthlyGoal({
        user_id: testData.user_id,
        category: 'insurance',
        month: testData.month,
        year: testData.year,
        target_amount: testData.goals.insurance.target
      })
    ]);
  });

  describe('הגדרת יעדים', () => {
    it('should set monthly goals correctly', async () => {
      const goals = await clientService.getMonthlyGoals({
        user_id: testData.user_id,
        month: testData.month,
        year: testData.year
      });

      const pensionGoal = goals.find(g => g.category === 'pension');
      const insuranceGoal = goals.find(g => g.category === 'insurance');

      expect(pensionGoal?.target_amount).toBe(testData.goals.pension.target);
      expect(insuranceGoal?.target_amount).toBe(testData.goals.insurance.target);
    });

    it('should update existing goals', async () => {
      const newTarget = 1500000;
      
      await clientService.setMonthlyGoal({
        user_id: testData.user_id,
        category: 'pension',
        month: testData.month,
        year: testData.year,
        target_amount: newTarget
      });

      const goals = await clientService.getMonthlyGoals({
        user_id: testData.user_id,
        month: testData.month,
        year: testData.year
      });

      const updatedGoal = goals.find(g => g.category === 'pension');
      expect(updatedGoal?.target_amount).toBe(newTarget);
    });
  });

  describe('מעקב התקדמות', () => {
    it('should update progress when adding pension sale', async () => {
      const pensionSale = {
        salary: 15000,
        provision_rate: 20,
        commission_rate: 7,
        accumulation: 500000,
        client_id: 'test-client-id',
        user_id: testData.user_id,
        date: new Date().toISOString().split('T')[0]
      };

      await clientService.addPensionSale(pensionSale);

      const goals = await clientService.getMonthlyGoals({
        user_id: testData.user_id,
        month: testData.month,
        year: testData.year
      });

      const pensionGoal = goals.find(g => g.category === 'pension');
      expect(pensionGoal?.achieved_amount).toBeGreaterThan(0);
    });

    it('should update progress when adding insurance sale', async () => {
      const insuranceSale = {
        premium: 1000,
        commission_rate: 30,
        payment_method: 'monthly',
        insurance_type: 'life',
        client_id: 'test-client-id',
        user_id: testData.user_id,
        date: new Date().toISOString().split('T')[0]
      };

      await clientService.addInsuranceSale(insuranceSale);

      const goals = await clientService.getMonthlyGoals({
        user_id: testData.user_id,
        month: testData.month,
        year: testData.year
      });

      const insuranceGoal = goals.find(g => g.category === 'insurance');
      expect(insuranceGoal?.achieved_amount).toBeGreaterThan(0);
    });
  });

  describe('חישובי אחוזים והישגים', () => {
    it('should calculate achievement percentages correctly', async () => {
      const achievements = await clientService.getAchievements({
        user_id: testData.user_id,
        month: testData.month,
        year: testData.year
      });

      // בדיקה שהאחוזים מחושבים נכון
      expect(achievements.pension.percentage).toBe(
        (achievements.pension.achieved / testData.goals.pension.target) * 100
      );

      expect(achievements.insurance.percentage).toBe(
        (achievements.insurance.achieved / testData.goals.insurance.target) * 100
      );
    });

    it('should handle overachievement correctly', async () => {
      // הגדרת יעד נמוך
      await clientService.setMonthlyGoal({
        user_id: testData.user_id,
        category: 'pension',
        month: testData.month,
        year: testData.year,
        target_amount: 1000 // יעד נמוך במיוחד
      });

      // הוספת מכירה גדולה
      await clientService.addPensionSale({
        salary: 50000,
        provision_rate: 20,
        commission_rate: 7,
        accumulation: 1000000,
        client_id: 'test-client-id',
        user_id: testData.user_id,
        date: new Date().toISOString().split('T')[0]
      });

      const achievements = await clientService.getAchievements({
        user_id: testData.user_id,
        month: testData.month,
        year: testData.year
      });

      expect(achievements.pension.percentage).toBeGreaterThan(100);
    });
  });

  afterAll(async () => {
    // ניקוי נתוני הטסט
    await supabase.from('sales_targets')
      .delete()
      .eq('user_id', testData.user_id)
      .eq('month', testData.month)
      .eq('year', testData.year);

    await supabase.from('pension_sales')
      .delete()
      .eq('user_id', testData.user_id);

    await supabase.from('insurance_sales')
      .delete()
      .eq('user_id', testData.user_id);
  });
}); 