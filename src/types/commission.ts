export interface CompanyCommissionDetails {
  scopeCommission?: number;
  oneTimeCommission?: number;
  monthlyCommission?: number;
  annualCommission?: number;
  accumulationCommission?: number;
  totalCommission: number;
}

export interface CommissionDetails {
  pension: {
    companies: Record<string, CompanyCommissionDetails>;
    total: number;
  };
  insurance: {
    companies: Record<string, CompanyCommissionDetails>;
    total: number;
  };
  investment: {
    companies: Record<string, CompanyCommissionDetails>;
    total: number;
  };
  policy: {
    companies: Record<string, CompanyCommissionDetails>;
    total: number;
  };
} 