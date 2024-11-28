import { CustomerJourney, CommissionDetails } from './CustomerJourneyTypes';

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

export const generateSummaryText = (journey: CustomerJourney): string => {
  let summaryText = `סיכום פגישה עם ${journey.client_name}\n\n`;
  
  summaryText += "מוצרים שנבחרו:\n";
  journey.selected_products.forEach(product => {
    summaryText += `- ${getProductHebrewName(product)}\n`;
  });
  
  summaryText += "\nחברות שנבחרו:\n";
  Object.entries(journey.selected_companies).forEach(([product, companies]) => {
    summaryText += `${getProductHebrewName(product)}: ${companies.join(', ')}\n`;
  });
  
  summaryText += `\nסך עמלות כולל: ₪${journey.total_commission.toFixed(2)}`;
  
  return summaryText;
};

export const generateNextSteps = (journey: CustomerJourney): string => {
  let nextSteps = "המשך טיפול:\n";
  
  if (journey.selected_products.includes('pension')) {
    nextSteps += "- השלמת מסמכי פנסיה\n";
  }
  
  if (journey.selected_products.includes('insurance')) {
    nextSteps += "- הגשת בקשה לפוליסת ביטוח\n";
  }
  
  if (journey.selected_products.includes('investment')) {
    nextSteps += "- פתיחת תיק השקעות\n";
  }
  
  if (journey.selected_products.includes('policy')) {
    nextSteps += "- חתימה על מסמכי פוליסה\n";
  }
  
  nextSteps += "- קביעת מועד המשך פגישה";
  
  return nextSteps;
};

export const getProductHebrewName = (type: string): string => {
  switch (type) {
    case 'pension': return 'פנסיה';
    case 'insurance': return 'ביטוח';
    case 'investment': return 'גמל והשתלמות';
    case 'policy': return 'פוליסות';
    default: return type;
  }
};

export const calculateTotalOneTime = (commissionDetails: CommissionDetails): number => {
  return (
    commissionDetails.pension.scopeCommission +
    commissionDetails.insurance.oneTimeCommission +
    commissionDetails.investment.scopeCommission +
    commissionDetails.policy.scopeCommission
  );
};

export const calculateTotalRecurring = (commissionDetails: CommissionDetails): number => {
  return (
    commissionDetails.pension.accumulationCommission +
    commissionDetails.insurance.monthlyCommission * 12 +
    commissionDetails.investment.monthlyCommission * 12
  );
};
