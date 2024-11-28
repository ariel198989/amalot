export const COMPANIES = {
  pension: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס'],
  insurance: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס'],
  investment: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס']
};

export const PRODUCTS = {
  pension: {
    id: 'pension',
    name: 'פנסיה',
    companies: COMPANIES.pension
  },
  insurance: {
    id: 'insurance',
    name: 'ביטוח',
    companies: COMPANIES.insurance
  },
  investment: {
    id: 'investment',
    name: 'השקעות',
    companies: COMPANIES.investment
  }
};

export const COMMISSION_TYPES = {
  SCOPE: 'scope',
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
  ONE_TIME: 'oneTime'
}; 