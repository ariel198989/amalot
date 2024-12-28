import { Wallet, Shield, Coins } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Product {
  value: string;
  label: string;
}

export interface ProductType {
  id: 'pension' | 'insurance' | 'investment';
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  description: string;
  companies: string[];
  products?: Product[];
}

export const productTypes: ProductType[] = [
  {
    id: 'pension',
    label: 'פנסיה',
    icon: Wallet,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'בדיקת כדאיות מכירת מוצרי פנסיה',
    companies: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה', 'מיטב', 'אלטשולר שחם', 'מור']
  },
  {
    id: 'insurance',
    label: 'סיכונים',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'בדיקת כדאיות מכירת מוצרי סיכונים',
    companies: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה'],
    products: [
      { value: 'personal_accident', label: 'תאונות אישיות' },
      { value: 'mortgage', label: 'משכנתה' },
      { value: 'health', label: 'בריאות' },
      { value: 'critical_illness', label: 'מחלות קשות' },
      { value: 'insurance_umbrella', label: 'מטריה ביטוחית' },
      { value: 'risk', label: 'ריסק' },
      { value: 'service', label: 'כתבי שירות' },
      { value: 'disability', label: 'אכע' }
    ]
  },
  {
    id: 'investment',
    label: 'פיננסים',
    icon: Coins,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'בדיקת כדאיות מכירת מוצרי פיננסים',
    companies: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה', 'מיטב', 'אלטשולר שחם', 'מור', 'ילין לפידות', 'פסגות'],
    products: [
      { value: 'gemel', label: 'גמל' },
      { value: 'investment_gemel', label: 'גמל להשקעה' },
      { value: 'hishtalmut', label: 'השתלמות' },
      { value: 'savings_policy', label: 'חסכון' }
    ]
  }
]; 