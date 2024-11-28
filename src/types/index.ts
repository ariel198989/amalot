// טיפוסים בסיסיים
export interface CommissionDetails {
  pension: {
    companies: Record<string, PensionCommission>;
    total: number;
  };
  insurance: {
    companies: Record<string, InsuranceCommission>;
    total: number;
  };
  investment: {
    companies: Record<string, InvestmentCommission>;
    total: number;
  };
}

export interface PensionCommission {
  scopeCommission: number;
  monthlyCommission: number;
  annualCommission: number;
  totalCommission: number;
}

export interface InsuranceCommission {
  oneTimeCommission: number;
  monthlyCommission: number;
  annualCommission: number;
  totalCommission: number;
}

export interface InvestmentCommission {
  scopeCommission: number;
  annualCommission: number;
  totalCommission: number;
}

// טיפוסים למסע לקוח
export { CustomerJourney, CommissionDetails } from '../components/calculators/CustomerJourneyTypes';