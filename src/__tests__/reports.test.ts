import { describe, beforeAll, it, expect } from '@jest/globals';
import { clientService } from '../services/clientService';

describe('Reports', () => {
  const testData = {
    user_id: 'test-user-id',
    client: {
      id: 'test-client-id',
      first_name: 'ישראל',
      last_name: 'ישראלי'
    },
    pensionSale: {
      salary: 15000,
      provision_rate: 20,
      commission_rate: 7,
      accumulation: 500000,
      company: 'כלל',
      date: new Date().toISOString().split('T')[0]
    },
    insuranceSale: {
      premium: 1000,
      commission_rate: 30,
      payment_method: 'monthly' as const,
      insurance_type: 'life' as const,
      company: 'הראל',
      date: new Date().toISOString().split('T')[0]
    }
  };

  beforeAll(async () => {
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

  it('should get sales report', async () => {
    const today = new Date();
    const report = await clientService.getSalesReport({
      user_id: testData.user_id,
      start_date: today.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0]
    });

    expect(report.pension_sales).toHaveLength(1);
    expect(report.insurance_sales).toHaveLength(1);
    expect(report.total_commission).toBeGreaterThan(0);
    expect(report.sales_count).toBe(2);
  });

  it('should get client portfolio', async () => {
    const portfolio = await clientService.getClientPortfolio(testData.client.id);

    expect(portfolio.pension.products).toHaveLength(1);
    expect(portfolio.insurance.products).toHaveLength(1);
    expect(portfolio.total_value).toBeGreaterThan(0);
  });
}); 