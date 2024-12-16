interface FinancialData {
  // ... existing fields
  SUG_KEREN_PENSIA?: number;
  SCHUM_KITZVAT_ZIKNA?: number;
  KITZVAT_HODSHIT_TZFUYA?: number;
}

interface ProductDetails {
  // ... existing fields
  productType: 'פנסיה' | 'ביטוח' | 'גמל' | 'השתלמות' | 'אחר';
  pensionType?: 'חדשה' | 'ותיקה';
} 