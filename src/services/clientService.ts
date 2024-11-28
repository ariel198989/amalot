import { supabase } from '@/lib/supabase';
import { Client } from '@/types/client';

interface PensionSale {
  user_id: string;
  client_id: string;
  date: string;
  client_name: string;
  client_phone?: string | null;
  company: string;
  salary: number;
  accumulation: number;
  provision: number;
  scope_commission: number;
  accumulation_commission: number;
  total_commission: number;
  monthly_commission?: number | null;
  transfer_commission?: number | null;
  deposit_commission?: number | null;
  commission_rate: number;
  provision_rate: number;
  transfer_amount?: number | null;
}

interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  email?: string;
  mobile_phone?: string; // שם העמודה בבסיס הנתונים
  status: string;
  created_at: string;
  updated_at: string;
  last_contact?: string;
}

export const clientService = {
  // יצירת לקוח חדש
  async createClient(data: Partial<Client>): Promise<Client> {
    // וידוא שכל השדות החובה קיימים
    if (!data.first_name || !data.last_name || !data.id_number) {
      throw new Error('חסרים שדות חובה: שם פרטי, שם משפחה או תעודת זהות');
    }

    // בדיקה אם הלקוח כבר קיים
    const existingClient = await this.checkExistingClient(data.id_number, data.user_id);
    if (existingClient) {
      throw new Error('לקוח עם תעודת זהות זו כבר קיים במערכת');
    }

    // המרת phone ל-mobile_phone אם קיים
    if ('phone' in data) {
      const { phone, ...rest } = data;
      data = {
        ...rest,
        mobile_phone: phone
      };
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

    const client = await this.createClient(clientData);
    return client;
  },

  // עדכון לקוח קיים
  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    // המרת phone ל-mobile_phone אם קיים
    if ('phone' in data) {
      const { phone, ...rest } = data;
      data = {
        ...rest,
        mobile_phone: phone
      };
    }

    const client = await this.updateClient(id, data);
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
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .eq('id_number', idNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding client by ID number:', error);
      throw error;
    }
  },

  // עדכון פרטי לקוח מורחב
  async updateClientDetails(id: string, data: Partial<Client>): Promise<Client> {
    const client = await this.updateClient(id, data);
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

  async addPensionSale(saleData: Partial<PensionSale>) {
    try {
      console.log('Raw sale data:', saleData);

      if (!saleData.commission_rate || !saleData.provision_rate) {
        throw new Error('חובה להזין אחוז עמלה ואחוז הפרשה');
      }

      // וידוא שכל המספרים הם מספרים ולא מחרוזות
      const normalizedData = {
        user_id: saleData.user_id,
        client_id: saleData.client_id,
        client_name: saleData.client_name,
        client_phone: saleData.client_phone,
        company: saleData.company,
        salary: Number(saleData.salary) || 0,
        accumulation: Number(saleData.accumulation) || 0,
        provision: Number(saleData.provision) || 0,
        scope_commission: Number(saleData.scope_commission) || 0,
        accumulation_commission: Number(saleData.accumulation_commission) || 0,
        monthly_commission: saleData.monthly_commission ? Number(saleData.monthly_commission) : null,
        transfer_commission: saleData.transfer_commission ? Number(saleData.transfer_commission) : null,
        deposit_commission: saleData.deposit_commission ? Number(saleData.deposit_commission) : null,
        commission_rate: Number(saleData.commission_rate),
        provision_rate: Number(saleData.provision_rate),
        transfer_amount: saleData.transfer_amount ? Number(saleData.transfer_amount) : null,
        date: new Date().toISOString().split('T')[0], // רק תאריך ללא שעה
        created_at: new Date().toISOString()
      };

      // חישוב העמלה הכוללת
      const totalCommission = (
        (normalizedData.scope_commission || 0) + 
        (normalizedData.accumulation_commission || 0) +
        (normalizedData.monthly_commission || 0) +
        (normalizedData.transfer_commission || 0) +
        (normalizedData.deposit_commission || 0)
      );

      console.log('Calculated commission:', totalCommission);

      // שלב 1: הוספת המכירה
      const { error: insertError } = await supabase
        .from('pension_sales')
        .insert({
          ...normalizedData,
          total_commission: totalCommission
        });

      if (insertError) {
        console.error('Error inserting sale:', insertError);
        throw insertError;
      }

      // שלב 2: שליפת המכירה שנוספה
      const { data: insertedSale, error: selectError } = await supabase
        .from('pension_sales')
        .select('id, client_id, total_commission')
        .eq('client_id', normalizedData.client_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (selectError) {
        console.error('Error fetching inserted sale:', selectError);
        throw selectError;
      }

      // עדכון הסכומים המצטברים של הלקוח
      if (insertedSale?.client_id) {
        await this.updateClientTotals(insertedSale.client_id);
      }

      return insertedSale;
    } catch (error) {
      console.error('Error adding pension sale:', error);
      throw error;
    }
  },

  async updateClientTotals(clientId: string) {
    try {
      // שליפת כל המכירות של הלקוח
      const { data: salesData, error: salesError } = await supabase
        .from('pension_sales')
        .select('salary, accumulation, provision, total_commission')
        .eq('client_id', clientId);

      if (salesError) {
        console.error('Error fetching sales data:', salesError);
        throw salesError;
      }

      if (!salesData) {
        console.warn('No sales data found for client:', clientId);
        return null;
      }

      // חישוב הסכומים
      const totals = salesData.reduce((acc, sale) => ({
        total_salary: acc.total_salary + Number(sale.salary || 0),
        total_accumulation: acc.total_accumulation + Number(sale.accumulation || 0),
        total_provision: acc.total_provision + Number(sale.provision || 0),
        total_commission: acc.total_commission + Number(sale.total_commission || 0)
      }), {
        total_salary: 0,
        total_accumulation: 0,
        total_provision: 0,
        total_commission: 0
      });

      console.log('Calculated totals:', totals);

      // עדכון הלקוח
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          total_pension_sales: totals.total_salary,
          total_revenue: totals.total_accumulation + totals.total_provision,
          total_commission: totals.total_commission,
          total_policies: salesData.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (updateError) {
        console.error('Error updating client:', updateError);
        throw updateError;
      }

      return totals;
    } catch (error) {
      console.error('Error updating client totals:', error);
      throw error;
    }
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
  },

  async checkExistingClient(idNumber: string, userId: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id_number', idNumber)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error checking existing client:', error);
      throw error;
    }
  },

  async createClient(data: Partial<Client>): Promise<Client> {
    try {
      // המרת phone ל-mobile_phone אם קיים
      if ('phone' in data) {
        const { phone, ...rest } = data;
        data = {
          ...rest,
          mobile_phone: phone
        };
      }

      const clientData = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: data.status || 'active'
      };

      const { data: newClient, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;
      return newClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    try {
      // המרת phone ל-mobile_phone אם קיים
      if ('phone' in updates) {
        const { phone, ...rest } = updates;
        updates = {
          ...rest,
          mobile_phone: phone
        };
      }

      const { data, error } = await supabase
        .from('clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }
};