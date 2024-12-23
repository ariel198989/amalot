import { supabase } from '@/lib/supabaseClient';

interface SaleData {
  type: 'pension' | 'insurance' | 'finance';
  pensionaccumulation?: number;
  investment_amount?: number;
  premium?: number;
  [key: string]: any;
}

export const saveSaleToDatabase = async (saleData: SaleData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error('משתמש לא מחובר') };
    }

    let tableName = '';
    switch (saleData.type) {
      case 'pension':
        tableName = 'pension_sales';
        break;
      case 'insurance':
        tableName = 'insurance_sales';
        break;
      case 'finance':
        tableName = 'investment_sales';
        break;
      default:
        return { error: new Error('סוג מכירה לא תקין') };
    }

    const { error } = await supabase
      .from(tableName)
      .insert([{ ...saleData, user_id: user.id }]);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}; 