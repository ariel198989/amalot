// אחוזי הפרשה אפשריים לפנסיה
export const PENSION_PROVISION_OPTIONS = [
  { value: '18.5', label: '18.5%' },
  { value: '19.5', label: '19.5%' },
  { value: '20.5', label: '20.5%' },
  { value: '20.83', label: '20.83%' },
  { value: '21.83', label: '21.83%' },
  { value: '22.83', label: '22.83%' }
];

interface PensionCalcParams {
  salary: number;            // משכורת חודשית (משתנה)
  provision: number;         // אחוז הפרשה לפנסיה (משתנה - נבחר ע"י הסוכן)
  commission_rate: number;   // אחוז עמלה מחברת הביטוח (משתנה - 6% עד 8%)
  accumulation?: number;     // צבירה קיימת (משתנה)
}

interface InsuranceCalcParams {
  premium: number;           // פרמיה חודשית
  productType: string;       // סוג המוצר (ריסק, בריאות וכו')
  company: string;          // חברת ביטוח
  years?: number;           // תקופת הביטוח בשנים
  age?: number;             // גיל המבוטח
}

interface InvestmentCalcParams {
  amount: number;           // סכום השקעה
  company: string;         // חברת ביטוח
  investmentType: string;  // סוג ההשקעה
  period?: number;         // תקופת ההשקעה בשנים
}

// מקדם קבוע לחישוב עמלה מצבירה (0.3% למיליון)
const ACCUMULATION_RATE = 0.0003;

export const calculators = {
  // חישוב עמלות פנסיה
  calculatePensionCommission: (params: PensionCalcParams) => {
    const { 
      salary,           // משתנה
      provision,        // משתנה
      commission_rate,  // משתנה (6-8%)
      accumulation = 0  // משתנה
    } = params;

    // המרת אחוזים לעשרוני
    const provisionRate = provision / 100;        // למשל: 21.83% -> 0.2183
    const commissionRate = commission_rate / 100; // למשל: 8% -> 0.08
    
    // חישוב עמלה חד פעמית מהפקדה
    // נוסחה: שכר * 12 חודשים * אחוז עמלה * אחוז הפרשה
    const depositCommission = salary * 12 * commissionRate * provisionRate;

    // חישוב עמלה חד פעמית מצבירה
    // נוסחה: צבירה * מקדם קבוע (0.3% למיליון)
    const accumulationCommission = accumulation * ACCUMULATION_RATE;

    return {
      depositCommission,
      accumulationCommission,
      totalCommission: depositCommission + accumulationCommission,
      // פירוט החישובים להצגה
      calculations: {
        depositCalc: `${salary.toLocaleString()} * 12 * ${commission_rate}% * ${provision}% = ${depositCommission.toLocaleString()}`,
        accumulationCalc: accumulation > 0 ? 
          `${accumulation.toLocaleString()} * ${(ACCUMULATION_RATE * 100).toFixed(3)}% = ${accumulationCommission.toLocaleString()}` : 
          null
      }
    };
  },

  // חישוב עמלות ביטוח
  calculateInsuranceCommission: (params: InsuranceCalcParams) => {
    const { premium, productType, company, years = 1, age = 30 } = params;
    const annualPremium = premium * 12;

    // מקדמי עמלות לפי סוג מוצר וחברה
    const productRates = {
      'ריסק': {
        'מגדל': { oneTime: 0.4, monthly: 0.2, age_factor: 0.01 },
        'הראל': { oneTime: 0.45, monthly: 0.22, age_factor: 0.012 },
        'כלל': { oneTime: 0.42, monthly: 0.21, age_factor: 0.011 }
      },
      'בריאות': {
        'מגדל': { oneTime: 0.5, monthly: 0.25, period_factor: 0.02 },
        'הראל': { oneTime: 0.55, monthly: 0.27, period_factor: 0.022 },
        'כלל': { oneTime: 0.52, monthly: 0.26, period_factor: 0.021 }
      },
      'סיעוד': {
        'מגדל': { oneTime: 0.6, monthly: 0.3, period_factor: 0.025 },
        'הראל': { oneTime: 0.65, monthly: 0.32, period_factor: 0.027 },
        'כלל': { oneTime: 0.62, monthly: 0.31, period_factor: 0.026 }
      }
    };

    const rates = productRates[productType as keyof typeof productRates]?.[company as keyof typeof productRates['ריסק']];
    if (!rates) return null;

    // חישוב מקדמים נוספים
    let ageFactor = 1;
    let periodFactor = 1;

    if (productType === 'ריסק') {
      ageFactor = 1 + (age - 30) * (rates.age_factor || 0);
    } else {
      periodFactor = 1 + years * (rates.period_factor || 0);
    }

    const oneTimeCommission = annualPremium * rates.oneTime * ageFactor * periodFactor;
    const monthlyCommission = premium * rates.monthly * ageFactor * periodFactor;
    const annualCommission = monthlyCommission * 12;

    return {
      oneTimeCommission,
      monthlyCommission,
      annualCommission,
      totalFirstYear: oneTimeCommission + annualCommission,
      ageFactor,
      periodFactor
    };
  },

  // חישוב עמלות השקעות
  calculateInvestmentCommission: (params: InvestmentCalcParams) => {
    const { amount, company, investmentType, period = 1 } = params;

    // מקדמי עמלות לפי חברה וסוג השקעה
    const investmentRates = {
      'גמל': {
        'מגדל': { scope: 0.01, annual: 0.004, period_factor: 0.001 },
        'הראל': { scope: 0.012, annual: 0.005, period_factor: 0.0012 },
        'כלל': { scope: 0.011, annual: 0.0045, period_factor: 0.0011 }
      },
      'השתלמות': {
        'מגדל': { scope: 0.015, annual: 0.006, period_factor: 0.0015 },
        'הראל': { scope: 0.017, annual: 0.007, period_factor: 0.0017 },
        'כלל': { scope: 0.016, annual: 0.0065, period_factor: 0.0016 }
      },
      'פיננסים': {
        'מגדל': { scope: 0.02, annual: 0.008, period_factor: 0.002 },
        'הראל': { scope: 0.022, annual: 0.009, period_factor: 0.0022 },
        'כלל': { scope: 0.021, annual: 0.0085, period_factor: 0.0021 }
      }
    };

    const rates = investmentRates[investmentType as keyof typeof investmentRates]?.[company as keyof typeof investmentRates['גמל']];
    if (!rates) return null;

    // חישוב מקדם תקופה
    const periodFactor = 1 + period * rates.period_factor;

    const scopeCommission = amount * rates.scope * periodFactor;
    const annualCommission = amount * rates.annual * periodFactor;
    const totalCommission = scopeCommission + (annualCommission * period);

    return {
      scopeCommission,
      annualCommission,
      totalCommission,
      periodFactor
    };
  }
};