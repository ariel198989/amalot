import { calculatePensionCommission } from '../services/clientService';

describe('Pension Commission Calculations', () => {
  describe('Basic Commission Calculations', () => {
    it('should calculate commission correctly for basic pension sale', () => {
      const result = calculatePensionCommission({
        salary: 10000,
        provision_rate: 20,
        commission_rate: 7,
        accumulation: 500000
      });

      expect(result.scope_commission).toBe(1680); // 10000 * 12 * 0.07 * 0.20
      expect(result.accumulation_commission).toBe(150); // 500000 * 0.0003
      expect(result.total_commission).toBe(1830); // 1680 + 150
    });

    it('should handle zero accumulation', () => {
      const result = calculatePensionCommission({
        salary: 15000,
        provision_rate: 19,
        commission_rate: 6,
        accumulation: 0
      });

      expect(result.scope_commission).toBe(2052); // 15000 * 12 * 0.06 * 0.19
      expect(result.accumulation_commission).toBe(0);
      expect(result.total_commission).toBe(2052);
    });

    it('should handle zero salary with accumulation', () => {
      const result = calculatePensionCommission({
        salary: 0,
        provision_rate: 20,
        commission_rate: 7,
        accumulation: 1000000
      });

      expect(result.scope_commission).toBe(0);
      expect(result.accumulation_commission).toBe(300); // 1000000 * 0.0003
      expect(result.total_commission).toBe(300);
    });
  });

  describe('Edge Cases and Validations', () => {
    it('should throw error for invalid provision rate (below 18.5)', () => {
      expect(() => {
        calculatePensionCommission({
          salary: 10000,
          provision_rate: 18,
          commission_rate: 7,
          accumulation: 500000
        });
      }).toThrow('אחוז הפרשה חייב להיות בין 18.5 ל-23');
    });

    it('should throw error for invalid provision rate (above 23)', () => {
      expect(() => {
        calculatePensionCommission({
          salary: 10000,
          provision_rate: 24,
          commission_rate: 7,
          accumulation: 500000
        });
      }).toThrow('אחוז הפרשה חייב להיות בין 18.5 ל-23');
    });

    it('should throw error for invalid commission rate (below 6)', () => {
      expect(() => {
        calculatePensionCommission({
          salary: 10000,
          provision_rate: 20,
          commission_rate: 5,
          accumulation: 500000
        });
      }).toThrow('אחוז עמלה חייב להיות בין 6 ל-8');
    });

    it('should throw error for invalid commission rate (above 8)', () => {
      expect(() => {
        calculatePensionCommission({
          salary: 10000,
          provision_rate: 20,
          commission_rate: 9,
          accumulation: 500000
        });
      }).toThrow('אחוז עמלה חייב להיות בין 6 ל-8');
    });
  });

  describe('Complex Scenarios', () => {
    it('should calculate commission correctly for maximum rates', () => {
      const result = calculatePensionCommission({
        salary: 20000,
        provision_rate: 23,
        commission_rate: 8,
        accumulation: 2000000
      });

      expect(result.scope_commission).toBe(4416); // 20000 * 12 * 0.08 * 0.23
      expect(result.accumulation_commission).toBe(600); // 2000000 * 0.0003
      expect(result.total_commission).toBe(5016);
    });

    it('should calculate commission correctly for minimum rates', () => {
      const result = calculatePensionCommission({
        salary: 5000,
        provision_rate: 18.5,
        commission_rate: 6,
        accumulation: 100000
      });

      expect(result.scope_commission).toBe(666); // 5000 * 12 * 0.06 * 0.185
      expect(result.accumulation_commission).toBe(30); // 100000 * 0.0003
      expect(result.total_commission).toBe(696);
    });

    it('should handle fractional numbers correctly', () => {
      const result = calculatePensionCommission({
        salary: 7523.45,
        provision_rate: 19.75,
        commission_rate: 7.5,
        accumulation: 345678.90
      });

      // Using toBeCloseTo for floating point comparisons
      expect(result.scope_commission).toBeCloseTo(1337.29); // 7523.45 * 12 * 0.075 * 0.1975
      expect(result.accumulation_commission).toBeCloseTo(103.70); // 345678.90 * 0.0003
      expect(result.total_commission).toBeCloseTo(1440.99);
    });
  });
}); 