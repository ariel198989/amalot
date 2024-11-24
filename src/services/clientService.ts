import { supabase } from '@/lib/supabase';
import { Client } from '@/types/client';

export const clientService = {
  // יצירת לקוח חדש
  async createClient(data: Partial<Client>): Promise<Client> {
    // וידוא שכל השדות החובה קיימים
    if (!data.first_name || !data.last_name || !data.id_number) {
      throw new Error('חסרים שדות חובה: שם פרטי, שם משפחה או תעודת זהות');
    }

    // בדיקה אם הלקוח כבר קיים
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('id_number', data.id_number)
      .single();

    if (existingClient) {
      throw new Error('לקוח עם תעודת זהות זו כבר קיים במערכת');
    }

    const clientData = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_contact: new Date().toISOString(),
      status: 'active',
      total_pension_sales: 0,
      total_insurance_sales: 0,
      total_investment_sales: 0,
      total_policy_sales: 0,
      total_commission: 0
    };

    const { data: client, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (error) throw error;
    return client;
  },

  // עדכון לקוח קיים
  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    const { data: client, error } = await supabase
      .from('clients')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return client;
  },

  // עדכון סכומי מכירות של לקוח
  async updateClientSales(id: string, saleType: 'pension' | 'insurance' | 'investment' | 'policy', amount: number) {
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select(`
        total_pension_sales,
        total_insurance_sales,
        total_investment_sales,
        total_policy_sales,
        total_commission,
        total_revenue,
        total_policies
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const updates = {
      [`total_${saleType}_sales`]: (client[`total_${saleType}_sales`] || 0) + amount,
      total_commission: (client.total_commission || 0) + amount,
      total_revenue: (client.total_revenue || 0) + amount,
      total_policies: (client.total_policies || 0) + 1,
      updated_at: new Date().toISOString(),
      last_contact: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id);

    if (updateError) throw updateError;
  },

  // קבלת כל הלקוחות ש סוכן
  async getClientsByAgent(userId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('last_contact', { ascending: false });

    if (error) throw error;
    return data;
  },

  // קבלת לקוח לפי מזהה
  async getClientById(id: string): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // חיפוש לקוח לפי תעודת זהות
  async findClientByIdNumber(userId: string, idNumber: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .eq('id_number', idNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // עדכון פרטי לקוח מורחב
  async updateClientDetails(id: string, data: Partial<Client>): Promise<Client> {
    const { data: client, error } = await supabase
      .from('clients')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return client;
  },

  // עדכון פגישה הבאה
  async updateNextMeeting(id: string, date: string) {
    const { error } = await supabase
      .from('clients')
      .update({
        next_meeting: date,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  // הוספת תגיות
  async addTag(id: string, tag: string) {
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('tags')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const tags = client.tags || [];
    if (!tags.includes(tag)) {
      const { error } = await supabase
        .from('clients')
        .update({ tags: [...tags, tag] })
        .eq('id', id);

      if (error) throw error;
    }
  },

  async addSale(saleType: 'pension' | 'insurance' | 'investment' | 'policy', data: any) {
    try {
      // וידוא שכל שדות החובה קיימים
      const requiredFields = {
        user_id: data.user_id,
        client_id: data.client_id,
        date: data.date || new Date().toISOString(),
        client_name: data.client_name,
        company: data.company,
        created_at: data.created_at || new Date().toISOString()
      };

      // בדיקה שכל השדות קיימים
      Object.entries(requiredFields).forEach(([key, value]) => {
        if (!value) throw new Error(`Missing required field: ${key}`);
      });

      // הוספת המכירה עם כל השדות הנדרשים
      const saleData = {
        ...data,
        ...requiredFields
      };

      console.log(`Adding ${saleType} sale:`, saleData); // לוג לבדיקה

      const { error: saleError } = await supabase
        .from(`${saleType}_sales`)
        .insert([saleData]);

      if (saleError) {
        console.error(`Error adding ${saleType} sale:`, saleError);
        throw saleError;
      }

      // עדכון סכומי המכירות של הלקוח
      await this.updateClientSales(data.client_id, saleType, data.total_commission);

    } catch (error) {
      console.error('Error in addSale:', error);
      throw error;
    }
  },

  async addPensionSale(data: any, clientId: string) {
    console.log('Adding pension sale:', { data, clientId }); // לוג לבדיקה

    const saleData = {
      user_id: data.user_id,
      client_id: clientId, // וידוא שה-client_id מועבר
      date: new Date().toISOString(),
      client_name: data.client_name,
      client_phone: data.client_phone || null,
      company: data.company,
      salary: Number(data.salary) || 0,
      accumulation: Number(data.accumulation) || 0,
      provision: Number(data.provision) || 0,
      scope_commission: Number(data.scope_commission) || 0,
      accumulation_commission: Number(data.accumulation_commission) || 0,
      total_commission: Number(data.total_commission) || 0,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('pension_sales')
      .insert([saleData]);

    if (error) {
      console.error('Error adding pension sale:', error);
      throw error;
    }

    // עדכון סכומי המכירות של הלקוח
    await this.updateClientSales(clientId, 'pension', saleData.total_commission);
  },

  async deleteClient(id: string) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw new Error('אירעה שגיאה במחיקת הלקוח וכל המכירות שלו');
    }
  }
}; 