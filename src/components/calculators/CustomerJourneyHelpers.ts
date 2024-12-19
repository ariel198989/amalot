import { CustomerJourney, CommissionDetails, JourneyProduct } from './CustomerJourneyTypes';

export const formatDate = (date: Date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

export const calculateTotalCommission = (commissionDetails: CommissionDetails): number => {
  return (
    commissionDetails.pension.total +
    commissionDetails.insurance.total +
    commissionDetails.investment.total +
    commissionDetails.policy.total
  );
};

const getProductHebrewName = (product: JourneyProduct): string => {
  switch (product.type) {
    case 'pension': return 'פנסיה';
    case 'insurance': return 'ביטוח';
    case 'investment': return 'גמל והשתלמות';
    case 'policy': return 'פוליסות';
    default: return product.type;
  }
};

export const generateSummaryText = (journey: CustomerJourney): string => {
  let summaryText = `סיכום פגישה עם ${journey.client_name}\n\n`;
  
  summaryText += "מוצרים שנבחרו:\n";
  journey.selected_products.forEach(product => {
    summaryText += `- ${getProductHebrewName(product)}\n`;
  });
  
  // Group products by company
  const companiesByProduct = journey.selected_products.reduce((acc, product) => {
    if (!acc[product.type]) {
      acc[product.type] = new Set<string>();
    }
    acc[product.type].add(product.company);
    return acc;
  }, {} as Record<string, Set<string>>);
  
  summaryText += "\nחברות שנבחרו:\n";
  Object.entries(companiesByProduct).forEach(([type, companies]) => {
    summaryText += `${getProductHebrewName({ type: type as JourneyProduct['type'], company: '', details: {} as any })}: ${Array.from(companies).join(', ')}\n`;
  });
  
  summaryText += `\nסך עמלות כולל: ₪${journey.total_commission.toFixed(2)}`;
  
  return summaryText;
};

export const generateNextSteps = (journey: CustomerJourney): string => {
  let nextSteps = "המשך טיפול:\n";
  
  const hasProductType = (type: JourneyProduct['type']) => 
    journey.selected_products.some(product => product.type === type);
  
  if (hasProductType('pension')) {
    nextSteps += "- השלמת מסמכי פנסיה\n";
  }
  
  if (hasProductType('insurance')) {
    nextSteps += "- הגשת בקשה לפוליסת ביטוח\n";
  }
  
  if (hasProductType('investment')) {
    nextSteps += "- פתיחת תיק השקעות\n";
  }
  
  if (hasProductType('policy')) {
    nextSteps += "- חתימה על מסמכי פוליסה\n";
  }
  
  nextSteps += "- קביעת מועד המשך פגישה";
  
  return nextSteps;
};

interface CommissionSummary {
  pension: {
    companies: Record<string, { scope: number; accumulation: number }>;
    total: number;
  };
  insurance: {
    companies: Record<string, { oneTime: number; monthly: number }>;
    total: number;
  };
  investment: {
    companies: Record<string, { scope: number; monthly: number }>;
    total: number;
  };
  policy: {
    companies: Record<string, { scope: number }>;
    total: number;
  };
}

export const calculateTotalOneTime = (commissionDetails: CommissionSummary): number => {
  return (
    Object.values(commissionDetails.pension.companies).reduce((sum, company) => sum + company.scope, 0) +
    Object.values(commissionDetails.insurance.companies).reduce((sum, company) => sum + company.oneTime, 0) +
    Object.values(commissionDetails.investment.companies).reduce((sum, company) => sum + company.scope, 0) +
    Object.values(commissionDetails.policy.companies).reduce((sum, company) => sum + company.scope, 0)
  );
};

export const calculateTotalRecurring = (commissionDetails: CommissionSummary): number => {
  return (
    Object.values(commissionDetails.pension.companies).reduce((sum, company) => sum + company.accumulation, 0) +
    Object.values(commissionDetails.insurance.companies).reduce((sum, company) => sum + company.monthly * 12, 0) +
    Object.values(commissionDetails.investment.companies).reduce((sum, company) => sum + company.monthly * 12, 0)
  );
};
