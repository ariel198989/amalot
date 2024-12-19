import { supabase } from '@/lib/supabase';
import { Client } from './ClientServiceTypes';

export const validateClientData = (data: Partial<Client>): void => {
  if (!data.first_name || !data.last_name || !data.id_number) {
    throw new Error('חסרים שדות חובה: שם פרטי, שם משפחה או תעודת זהות');
  }
};

export const formatClientName = (client: Client): string => {
  return `${client.first_name} ${client.last_name}`;
};

export const formatPhoneNumber = (phone?: string | null): string => {
  if (!phone) return 'לא צוין';
  return phone.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
};

export const calculateClientTotals = async (clientId: string): Promise<void> => {
  try {
    const { data: sales, error } = await supabase
      .from('pension_sales')
      .select('total_commission')
      .eq('client_id', clientId);

    if (error) {
      console.error('Error calculating client totals:', error);
      return;
    }

    const totalCommission = sales.reduce((sum, sale) => sum + sale.total_commission, 0);

    await supabase
      .from('clients')
      .update({ total_sales: totalCommission })
      .eq('id', clientId);

  } catch (error) {
    console.error('Unexpected error in calculateClientTotals:', error);
  }
};

export const generateClientTag = (client: Client): string => {
  const currentYear = new Date().getFullYear();
  const birthYear = client.id_number.slice(0, 2);
  const age = currentYear - Number(`19${birthYear}`);

  const tags: string[] = [];

  if (age < 30) tags.push('צעיר');
  if (age >= 30 && age < 45) tags.push('בוגר');
  if (age >= 45 && age < 60) tags.push('מבוגר');
  if (age >= 60) tags.push('גמלאי');

  return tags.join(', ');
};
