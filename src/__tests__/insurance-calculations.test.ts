import { describe, it, expect } from '@jest/globals';
import { calculateInsuranceCommission } from '../utils/calculators';

describe('Insurance Commission Calculations', () => {
  describe('Life Insurance', () => {
    it('should calculate life insurance correctly', () => {
      const result = calculateInsuranceCommission({
        insurance_type: 'life',
        premium: 1000,
        commission_rate: 20,
        payment_method: 'monthly' as const
      });

      expect(result).toBe(200);
    });

    it('should handle annual payment method', () => {
      const result = calculateInsuranceCommission({
        insurance_type: 'life',
        premium: 1000,
        commission_rate: 20,
        payment_method: 'annual' as const
      });

      expect(result).toBe(400);
    });
  });

  describe('Disability Insurance', () => {
    const baseInput = {
      premium: 1000,
      commission_rate: 20,
      payment_method: 'monthly' as const
    };

    it('should calculate disability insurance correctly', () => {
      const result = calculateInsuranceCommission({
        ...baseInput,
        insurance_type: 'disability' as const
      });

      expect(result).toBe(300);
    });

    it('should handle annual payment method', () => {
      const result = calculateInsuranceCommission({
        ...baseInput,
        insurance_type: 'disability' as const,
        payment_method: 'annual' as const
      });

      expect(result).toBe(600);
    });
  });

  describe('Long Term Care Insurance', () => {
    const baseInput = {
      premium: 1000,
      commission_rate: 20,
      payment_method: 'monthly' as const
    };

    it('should calculate LTC insurance correctly', () => {
      const result = calculateInsuranceCommission({
        ...baseInput,
        insurance_type: 'ltc' as const
      });

      expect(result).toBe(250);
    });

    it('should handle annual payment method', () => {
      const result = calculateInsuranceCommission({
        ...baseInput,
        insurance_type: 'ltc' as const,
        payment_method: 'annual' as const
      });

      expect(result).toBe(500);
    });
  });
}); 