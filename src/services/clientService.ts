import { supabase } from '@/lib/supabase';
import { Client as ClientType } from '@/types/client';

interface PensionCommissionInput {
  salary: number;
  provision_rate: number;
  commission_rate: number;
  accumulation: number;
}

interface PensionCommissionResult {
  scope_commission: number;
  accumulation_commission: number;
  total_commission: number;
}

export function calculatePensionCommission(input: PensionCommissionInput): PensionCommissionResult {
  // Validate provision rate
  if (input.provision_rate < 18.5 || input.provision_rate > 23) {
    throw new Error('אחוז הפרשה חייב להיות בין 18.5 ל-23');
  }

  // Validate commission rate
  if (input.commission_rate < 6 || input.commission_rate > 8) {
    throw new Error('אחוז עמלה חייב להיות בין 6 ל-8');
  }

  // Calculate scope commission (from monthly salary)
  const scope_commission = Math.round(
    input.salary * 12 * (input.commission_rate / 100) * (input.provision_rate / 100)
  );

  // Calculate accumulation commission
  const accumulation_commission = Math.round(
    input.accumulation * 0.0003
  );

  // Calculate total commission
  const total_commission = scope_commission + accumulation_commission;

  return {
    scope_commission,
    accumulation_commission,
    total_commission
  };
}

export const clientService = {
  async checkExistingClient(idNumber: string, userId: string): Promise<ClientType | null> {
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

  async createClient(data: Partial<ClientType>): Promise<ClientType> {
    if (!data.first_name || !data.last_name || !data.id_number || !data.user_id) {
      throw new Error('חסרים שדות חובה: שם פרטי, שם משפחה, תעודת זהות או מזהה משתמש');
    }

    const existingClient = await this.checkExistingClient(data.id_number, data.user_id);
    if (existingClient) {
      throw new Error('לקוח עם תעודת זהות זו כבר קיים במערכת');
    }

    const clientData = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (error) throw error;
    return newClient;
  },

  async updateClient(id: string, data: Partial<ClientType>): Promise<ClientType> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedClient;
  },

  async getClientsByAgent(userId: string): Promise<ClientType[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getClientById(id: string): Promise<ClientType> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async findClientByIdNumber(userId: string, idNumber: string): Promise<ClientType | null> {
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

  async deleteClient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }
};