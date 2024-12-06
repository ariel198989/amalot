import { calculateInsuranceCommission } from '../services/insuranceService';

describe('Insurance Commission Calculations', () => {
  describe('Basic Commission Calculations', () => {
    it('should calculate life insurance commission correctly (monthly payment)', () => {
      const result = calculateInsuranceCommission({
        premium: 1000,          // 1000₪ לחודש
        commission_rate: 30,    // 30% עמלה
        payment_method: 'monthly',
        insurance_type: 'life'
      });

      // פרמיה שנתית: 1000 * 12 = 12000
      expect(result.scope_commission).toBe(3600);  // 12000 * 0.30
      expect(result.nifraim).toBe(1260);          // 12000 * 0.30 * 0.35
      expect(result.total_commission).toBe(4860);  // 3600 + 1260
    });

    it('should calculate health insurance commission correctly (annual payment)', () => {
      const result = calculateInsuranceCommission({
        premium: 12000,         // 12000₪ לשנה
        commission_rate: 25,    // 25% עמלה
        payment_method: 'annual',
        insurance_type: 'health'
      });

      expect(result.scope_commission).toBe(3000);  // 12000 * 0.25
      expect(result.nifraim).toBe(1200);          // 12000 * 0.25 * 0.40
      expect(result.total_commission).toBe(4200);  // 3000 + 1200
    });
  });

  describe('Edge Cases and Validations', () => {
    it('should throw error for invalid commission rate (below 15%)', () => {
      expect(() => {
        calculateInsuranceCommission({
          premium: 1000,
          commission_rate: 14,
          payment_method: 'monthly',
          insurance_type: 'life'
        });
      }).toThrow('אחוז העמלה חייב להיות בין 15% ל-40%');
    });

    it('should throw error for invalid commission rate (above 40%)', () => {
      expect(() => {
        calculateInsuranceCommission({
          premium: 1000,
          commission_rate: 41,
          payment_method: 'monthly',
          insurance_type: 'life'
        });
      }).toThrow('אחוז העמלה חייב להיות בין 15% ל-40%');
    });

    it('should throw error for invalid insurance type', () => {
      expect(() => {
        calculateInsuranceCommission({
          premium: 1000,
          commission_rate: 30,
          payment_method: 'monthly',
          insurance_type: 'invalid' as any
        });
      }).toThrow('סוג ביטוח לא תקין');
    });
  });

  describe('Different Insurance Types', () => {
    const baseInput = {
      premium: 1000,
      commission_rate: 20,
      payment_method: 'monthly'
    };

    it('should calculate disability insurance correctly', () => {
      const result = calculateInsuranceCommission({
        ...baseInput,
        insurance_type: 'disability'
      });

      // פרמיה שנתית: 1000 * 12 = 12000
      expect(result.scope_commission).toBe(2400);  // 12000 * 0.20
      expect(result.nifraim).toBe(720);           // 12000 * 0.20 * 0.30
      expect(result.total_commission).toBe(3120);  // 2400 + 720
    });

    it('should calculate LTC insurance correctly', () => {
      const result = calculateInsuranceCommission({
        ...baseInput,
        insurance_type: 'ltc'
      });

      // פרמיה שנתית: 1000 * 12 = 12000
      expect(result.scope_commission).toBe(2400);  // 12000 * 0.20
      expect(result.nifraim).toBe(600);           // 12000 * 0.20 * 0.25
      expect(result.total_commission).toBe(3000);  // 2400 + 600
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle high premium amounts correctly', () => {
      const result = calculateInsuranceCommission({
        premium: 50000,         // 50000₪ לחודש
        commission_rate: 35,    // 35% עמלה
        payment_method: 'monthly',
        insurance_type: 'health'
      });

      // פרמיה שנתית: 50000 * 12 = 600000
      expect(result.scope_commission).toBe(210000);  // 600000 * 0.35
      expect(result.nifraim).toBe(84000);           // 600000 * 0.35 * 0.40
      expect(result.total_commission).toBe(294000);  // 210000 + 84000
    });

    it('should handle fractional premium amounts', () => {
      const result = calculateInsuranceCommission({
        premium: 1234.56,
        commission_rate: 27.5,
        payment_method: 'monthly',
        insurance_type: 'life'
      });

      // פרמיה שנתית: 1234.56 * 12 = 14814.72
      const annualPremium = 1234.56 * 12;
      const expectedScope = Math.round(annualPremium * (27.5 / 100));
      const expectedNifraim = Math.round(annualPremium * (27.5 / 100) * 0.35);

      expect(result.scope_commission).toBe(expectedScope);
      expect(result.nifraim).toBe(expectedNifraim);
      expect(result.total_commission).toBe(expectedScope + expectedNifraim);
    });
  });
}); 