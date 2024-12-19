import { describe, it, expect } from '@jest/globals';
import { calculateCommission } from '../utils/calculators';

describe('Insurance Commission Calculations', () => {
  describe('Life Insurance', () => {
    const lifeRates = {
      oneTime: 0.2,
      monthly: 0.1,
      age_factor: 0.02
    };

    it('should calculate life insurance correctly', () => {
      const result = calculateCommission(1000, 30, 1, lifeRates);
      expect(result.oneTime).toBe(200); // 1000 * 0.2 * 1 (age factor at 30)
      expect(result.monthly).toBe(100); // 1000 * 0.1
    });

    it('should handle age factor', () => {
      const result = calculateCommission(1000, 40, 1, lifeRates);
      expect(result.oneTime).toBe(400); // 1000 * 0.2 * 2 (age factor at 40)
    });
  });

  describe('Disability Insurance', () => {
    const disabilityRates = {
      oneTime: 0.3,
      monthly: 0.15,
      period_factor: 0.1
    };

    it('should calculate disability insurance correctly', () => {
      const result = calculateCommission(1000, 30, 1, disabilityRates);
      expect(result.oneTime).toBe(300); // 1000 * 0.3
      expect(result.monthly).toBe(165); // 1000 * 0.15 * 1.1 (period factor for 1 year)
    });

    it('should handle period factor', () => {
      const result = calculateCommission(1000, 30, 2, disabilityRates);
      expect(result.monthly).toBe(180); // 1000 * 0.15 * 1.2 (period factor for 2 years)
    });
  });

  describe('Long Term Care Insurance', () => {
    const ltcRates = {
      oneTime: 0.25,
      monthly: 0.12,
      age_factor: 0.015
    };

    it('should calculate LTC insurance correctly', () => {
      const result = calculateCommission(1000, 30, 1, ltcRates);
      expect(result.oneTime).toBe(250); // 1000 * 0.25 * 1 (age factor at 30)
      expect(result.monthly).toBe(120); // 1000 * 0.12
    });

    it('should handle age factor', () => {
      const result = calculateCommission(1000, 50, 1, ltcRates);
      expect(result.oneTime).toBe(400); // 1000 * 0.25 * 1.6 (age factor at 50)
    });
  });
}); 