import { describe, beforeAll, it, expect } from '@jest/globals';
import { clientService } from '../services/clientService';

describe('Goals Tracking', () => {
  const testData = {
    user_id: 'test-user-id',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    monthlyGoal: {
      category: 'pension' as const,
      target_amount: 5000000
    }
  };

  beforeAll(async () => {
    await clientService.setMonthlyGoal({
      user_id: testData.user_id,
      category: 'pension',
      month: testData.month,
      year: testData.year,
      target_amount: testData.monthlyGoal.target_amount
    });

    await clientService.setMonthlyGoal({
      user_id: testData.user_id,
      category: 'insurance',
      month: testData.month,
      year: testData.year,
      target_amount: 3000000
    });
  });

  it('should set and get monthly goals', async () => {
    const goals = await clientService.getMonthlyGoals({
      user_id: testData.user_id,
      month: testData.month,
      year: testData.year
    });

    const pensionGoal = goals.find(g => g.category === 'pension');
    const insuranceGoal = goals.find(g => g.category === 'insurance');

    expect(pensionGoal?.target_amount).toBe(testData.monthlyGoal.target_amount);
    expect(insuranceGoal?.target_amount).toBe(3000000);
  });

  it('should track pension sales', async () => {
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

  it('should track insurance sales', async () => {
    const insuranceSale = {
      premium: 1000,
      commission_rate: 30,
      payment_method: 'monthly' as const,
      insurance_type: 'life' as const,
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

  it('should get achievements', async () => {
    const achievements = await clientService.getAchievements({
      user_id: testData.user_id,
      month: testData.month,
      year: testData.year
    });

    expect(achievements).toEqual({
      pension: {
        target: testData.monthlyGoal.target_amount,
        achieved: expect.any(Number),
        percentage: expect.any(Number)
      },
      insurance: {
        target: 3000000,
        achieved: expect.any(Number),
        percentage: expect.any(Number)
      }
    });
  });
}); 