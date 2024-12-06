interface InsuranceCommissionInput {
  premium: number;           // פרמיה שנתית
  commission_rate: number;   // אחוז עמלה (בין 15-40)
  payment_method: 'monthly' | 'annual'; // שיטת תשלום
  insurance_type: 'life' | 'health' | 'disability' | 'ltc'; // סוג ביטוח
}

interface InsuranceCommissionResult {
  nifraim: number;          // עמלה מנפרעים
  scope_commission: number;  // עמלת היקף
  total_commission: number;  // סה"כ עמלה
}

export function calculateInsuranceCommission(input: InsuranceCommissionInput): InsuranceCommissionResult {
  // וידוא תקינות אחוז העמלה
  if (input.commission_rate < 15 || input.commission_rate > 40) {
    throw new Error('אחוז העמלה חייב להיות בין 15% ל-40%');
  }

  // חישוב מקדם נפרעים לפי סוג הביטוח
  const nifraim_factor = {
    'life': 0.35,      // ריסק חיים
    'health': 0.40,    // בריאות
    'disability': 0.30,// אובדן כושר
    'ltc': 0.25       // סיעודי
  }[input.insurance_type];

  if (!nifraim_factor) {
    throw new Error('סוג ביטוח לא תקין');
  }

  // חישוב פרמיה שנתית
  const annual_premium = input.payment_method === 'monthly' 
    ? input.premium * 12 
    : input.premium;

  // חישוב עמלת היקף
  const scope_commission = Math.round(
    annual_premium * (input.commission_rate / 100)
  );

  // חישוב עמלת נפרעים
  const nifraim = Math.round(
    annual_premium * nifraim_factor * (input.commission_rate / 100)
  );

  // חישוב סה"כ עמלה
  const total_commission = scope_commission + nifraim;

  return {
    nifraim,
    scope_commission,
    total_commission
  };
} 