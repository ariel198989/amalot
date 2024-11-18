export interface SavingsClient {
  date: string;
  name: string;
  company: string;
  amount: number;
  scopeCommission: number;
  monthlyCommission: number;
}

export interface PensionClient {
  date: string;
  name: string;
  company: string;
  salary: number;
  accumulation: number;
  provision: number;
  scopeCommission: number;
  accumulationCommission: number;
  totalCommission: number;
}

export interface InvestmentClient {
  date: string;
  name: string;
  company: string;
  amount: number;
  scopeCommission: number;
  monthlyCommission: number;
}

export interface InsuranceClient {
  date: string;
  name: string;
  company: string;
  insuranceType: string;
  monthlyPremium: number;
  oneTimeCommissionRate: number;
  oneTimeCommission: number;
  monthlyCommissionRate: number;
  monthlyCommission: number;
}

export interface InvestmentCompanyData {
  scopeRate: number;
  monthlyRate: number;
}

export interface CompanyRates {
  [key: string]: {
    scope: number;
    accumulation: number;
  };
}

export interface PolicyClient {
  date: string;
  name: string;
  company: string;
  policyType: string;
  depositAmount: number;
  totalDeposit: number;
  oneTimeCommission: number;
  monthlyCommission: number;
}