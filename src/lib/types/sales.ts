export interface SalesData {
  pension: {
    transfers: number;  // ניודי פנסיה - סכום כולל שנויד
  };
  insurance: {
    monthlyPremium: number;  // פרמיה חודשית בביטוח
  };
  finance: {
    accumulation: number;  // צבירות בפיננסים
  };
}

export interface AgentSalesData {
  agentId: string;
  date: string;  // YYYY-MM-DD format
  sales: SalesData;
}

export interface PromotionTarget {
  pension: number;    // יעד ניודי פנסיה
  insurance: number;  // יעד פרמיה חודשית
  finance: number;    // יעד צבירות פיננסים
}

export interface Promotion {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  type: 'personal' | 'team' | 'branch';
  targets: PromotionTarget;
  currentAmounts: PromotionTarget;
  description?: string;
  prize: string;
  daysLeft: number;
  aiPrediction: number;
}

// Helper functions
export const calculatePromotionProgress = (
  salesData: AgentSalesData[],
  promotion: Promotion
): PromotionTarget => {
  // Filter sales data for the promotion period
  const relevantSales = salesData.filter(sale => {
    const saleDate = new Date(sale.date);
    return (
      saleDate >= new Date(promotion.startDate) &&
      saleDate <= new Date(promotion.endDate)
    );
  });

  // Calculate totals
  return relevantSales.reduce(
    (acc, sale) => ({
      pension: acc.pension + sale.sales.pension.transfers,
      insurance: acc.insurance + sale.sales.insurance.monthlyPremium,
      finance: acc.finance + sale.sales.finance.accumulation
    }),
    { pension: 0, insurance: 0, finance: 0 }
  );
}; 