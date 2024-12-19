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

interface InsuranceCommissionInput {
  insurance_type: 'life' | 'disability' | 'ltc' | 'health';
  premium: number;
  commission_rate: number;
  payment_method: 'monthly' | 'annual';
}

interface InsuranceCommissionResult {
  scope_commission: number;
  nifraim: number;
  total_commission: number;
}

interface MonthlyGoalInput {
  user_id: string;
  category: 'pension' | 'insurance';
  month: number;
  year: number;
  target_amount: number;
}

interface MonthlyGoalsQuery {
  user_id: string;
  month: number;
  year: number;
}

interface PensionSale {
  salary: number;
  provision_rate: number;
  commission_rate: number;
  accumulation: number;
  client_id: string;
  user_id: string;
  date: string;
  journey_id?: string;
  commission?: number;
  company?: string;
}

interface InsuranceSale {
  premium: number;
  commission_rate: number;
  payment_method: 'monthly' | 'annual';
  insurance_type: 'life' | 'disability' | 'ltc';
  client_id: string;
  user_id: string;
  date: string;
  journey_id?: string;
}

interface Achievements {
  pension: {
    target: number;
    achieved: number;
    percentage: number;
  };
  insurance: {
    target: number;
    achieved: number;
    percentage: number;
  };
}

interface ClientJourney {
  id: string;
  client_id: string;
  user_id: string;
  status: string;
  start_date: string;
  end_date?: string;
}

interface SalesReport {
  pension_sales: PensionSale[];
  insurance_sales: InsuranceSale[];
  total_commission: number;
  sales_count: number;
}

interface ClientPortfolio {
  pension: {
    products: PensionSale[];
    total_value: number;
    count: number;
    total_amount: number;
    company: string;
  };
  insurance: {
    products: InsuranceSale[];
    total_value: number;
    count: number;
    total_premium: number;
    policies: string[];
  };
  total_value: number;
}

interface ClientHistory {
  pension_sales: PensionSale[];
  insurance_sales: InsuranceSale[];
  total_value: number;
  total_commission: number;
  sales: Array<PensionSale | InsuranceSale>;
}

interface MonthlyReport {
  sales_count: number;
  total_commission: number;
  categories: {
    pension: number;
    insurance: number;
  };
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

export function calculateInsuranceCommission(input: InsuranceCommissionInput): InsuranceCommissionResult {
  // Validate commission rate
  if (input.commission_rate < 15 || input.commission_rate > 40) {
    throw new Error('אחוז העמלה חייב להיות בין 15% ל-40%');
  }

  // Validate insurance type
  const nifraim_rates = {
    life: 0.35,
    health: 0.40,
    disability: 0.30,
    ltc: 0.25
  };

  const nifraim_rate = nifraim_rates[input.insurance_type];
  if (!nifraim_rate) {
    throw new Error('סוג ביטוח לא תקין');
  }

  // Calculate annual premium
  const annual_premium = input.payment_method === 'monthly' 
    ? input.premium * 12 
    : input.premium;

  // Calculate scope commission
  const scope_commission = Math.round(annual_premium * (input.commission_rate / 100));

  // Calculate nifraim
  const nifraim = Math.round(scope_commission * nifraim_rate);

  // Calculate total commission
  const total_commission = scope_commission + nifraim;

  return {
    scope_commission,
    nifraim,
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
  },

  async setMonthlyGoal(input: MonthlyGoalInput): Promise<void> {
    const { data: existingGoal } = await supabase
      .from('sales_targets')
      .select('*')
      .eq('user_id', input.user_id)
      .eq('category', input.category)
      .eq('month', input.month)
      .eq('year', input.year)
      .single();

    if (existingGoal) {
      const { error } = await supabase
        .from('sales_targets')
        .update({ target_amount: input.target_amount })
        .eq('id', existingGoal.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('sales_targets')
        .insert([input]);

      if (error) throw error;
    }
  },

  async getMonthlyGoals(query: MonthlyGoalsQuery): Promise<any[]> {
    const { data, error } = await supabase
      .from('sales_targets')
      .select('*')
      .eq('user_id', query.user_id)
      .eq('month', query.month)
      .eq('year', query.year);

    if (error) throw error;
    return data;
  },

  async startClientJourney(input: { client_id: string; user_id: string }): Promise<ClientJourney> {
    const journey = {
      ...input,
      status: 'active',
      start_date: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('client_journeys')
      .insert([journey])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addPensionSale(sale: PensionSale): Promise<{ id: string }> {
    const commission = calculatePensionCommission({
      salary: sale.salary,
      provision_rate: sale.provision_rate,
      commission_rate: sale.commission_rate,
      accumulation: sale.accumulation
    });

    const { data, error } = await supabase
      .from('pension_sales')
      .insert([{
        ...sale,
        commission_amount: commission.total_commission
      }])
      .select('id')
      .single();

    if (error) throw error;
    return data;
  },

  async addInsuranceSale(sale: InsuranceSale): Promise<{ id: string }> {
    const commission = calculateInsuranceCommission({
      insurance_type: sale.insurance_type,
      premium: sale.premium,
      commission_rate: sale.commission_rate,
      payment_method: sale.payment_method
    });

    const { data, error } = await supabase
      .from('insurance_sales')
      .insert([{
        ...sale,
        commission_amount: commission.total_commission
      }])
      .select('id')
      .single();

    if (error) throw error;
    return data;
  },

  async getSalesReport(query: { user_id: string; start_date: string; end_date: string }): Promise<SalesReport> {
    const { data: pensionSales, error: pensionError } = await supabase
      .from('pension_sales')
      .select('*')
      .eq('user_id', query.user_id)
      .gte('date', query.start_date)
      .lte('date', query.end_date);

    if (pensionError) throw pensionError;

    const { data: insuranceSales, error: insuranceError } = await supabase
      .from('insurance_sales')
      .select('*')
      .eq('user_id', query.user_id)
      .gte('date', query.start_date)
      .lte('date', query.end_date);

    if (insuranceError) throw insuranceError;

    const total_commission = [
      ...pensionSales.map(sale => sale.commission_amount),
      ...insuranceSales.map(sale => sale.commission_amount)
    ].reduce((sum, amount) => sum + amount, 0);

    return {
      pension_sales: pensionSales,
      insurance_sales: insuranceSales,
      total_commission,
      sales_count: pensionSales.length + insuranceSales.length
    };
  },

  async getClientPortfolio(client_id: string): Promise<ClientPortfolio> {
    const { data: pensionProducts, error: pensionError } = await supabase
      .from('pension_sales')
      .select('*')
      .eq('client_id', client_id);

    if (pensionError) throw pensionError;

    const { data: insuranceProducts, error: insuranceError } = await supabase
      .from('insurance_sales')
      .select('*')
      .eq('client_id', client_id);

    if (insuranceError) throw insuranceError;

    const pension_total = pensionProducts.reduce((sum, product) => sum + product.accumulation, 0);
    const insurance_total = insuranceProducts.reduce((sum, product) => sum + product.premium * 12, 0);
    const total_value = pension_total + insurance_total;

    return {
      pension: {
        products: pensionProducts,
        total_value: pension_total,
        count: pensionProducts.length,
        total_amount: pension_total,
        company: pensionProducts[0]?.company || ''
      },
      insurance: {
        products: insuranceProducts,
        total_value: insurance_total,
        count: insuranceProducts.length,
        total_premium: insurance_total,
        policies: insuranceProducts.map(p => p.policy_number || '')
      },
      total_value
    };
  },

  async getClientHistory(client_id: string): Promise<ClientHistory> {
    const { data: pensionSales, error: pensionError } = await supabase
      .from('pension_sales')
      .select('*')
      .eq('client_id', client_id)
      .order('date', { ascending: false });

    if (pensionError) throw pensionError;

    const { data: insuranceSales, error: insuranceError } = await supabase
      .from('insurance_sales')
      .select('*')
      .eq('client_id', client_id)
      .order('date', { ascending: false });

    if (insuranceError) throw insuranceError;

    const pension_total = pensionSales.reduce((sum, sale) => sum + sale.accumulation, 0);
    const insurance_total = insuranceSales.reduce((sum, sale) => sum + sale.premium * 12, 0);
    const total_commission = [
      ...pensionSales.map(sale => sale.commission_amount),
      ...insuranceSales.map(sale => sale.commission_amount)
    ].reduce((sum, amount) => sum + amount, 0);

    // Combine and sort all sales by date
    const allSales = [...pensionSales, ...insuranceSales].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      pension_sales: pensionSales,
      insurance_sales: insuranceSales,
      total_value: pension_total + insurance_total,
      total_commission,
      sales: allSales
    };
  },

  async getMonthlyReport(input: { user_id: string; month: number; year: number }): Promise<MonthlyReport> {
    const startDate = new Date(input.year, input.month - 1, 1);
    const endDate = new Date(input.year, input.month, 0);

    const { data: pensionSales, error: pensionError } = await supabase
      .from('pension_sales')
      .select('commission_amount')
      .eq('user_id', input.user_id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (pensionError) throw pensionError;

    const { data: insuranceSales, error: insuranceError } = await supabase
      .from('insurance_sales')
      .select('commission_amount')
      .eq('user_id', input.user_id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (insuranceError) throw insuranceError;

    const pension_total = pensionSales.reduce((sum, sale) => sum + sale.commission_amount, 0);
    const insurance_total = insuranceSales.reduce((sum, sale) => sum + sale.commission_amount, 0);

    return {
      sales_count: pensionSales.length + insuranceSales.length,
      total_commission: pension_total + insurance_total,
      categories: {
        pension: pensionSales.length,
        insurance: insuranceSales.length
      }
    };
  },

  async getAchievements(query: MonthlyGoalsQuery): Promise<Achievements> {
    // Get goals
    const goals = await this.getMonthlyGoals(query);
    const pensionGoal = goals.find(g => g.category === 'pension')?.target_amount || 0;
    const insuranceGoal = goals.find(g => g.category === 'insurance')?.target_amount || 0;

    // Get pension sales
    const { data: pensionSales, error: pensionError } = await supabase
      .from('pension_sales')
      .select('commission_amount')
      .eq('user_id', query.user_id)
      .gte('date', `${query.year}-${String(query.month).padStart(2, '0')}-01`)
      .lte('date', `${query.year}-${String(query.month).padStart(2, '0')}-31`);

    if (pensionError) throw pensionError;

    // Get insurance sales
    const { data: insuranceSales, error: insuranceError } = await supabase
      .from('insurance_sales')
      .select('commission_amount')
      .eq('user_id', query.user_id)
      .gte('date', `${query.year}-${String(query.month).padStart(2, '0')}-01`)
      .lte('date', `${query.year}-${String(query.month).padStart(2, '0')}-31`);

    if (insuranceError) throw insuranceError;

    const pensionAchieved = pensionSales.reduce((sum, sale) => sum + sale.commission_amount, 0);
    const insuranceAchieved = insuranceSales.reduce((sum, sale) => sum + sale.commission_amount, 0);

    return {
      pension: {
        target: pensionGoal,
        achieved: pensionAchieved,
        percentage: pensionGoal > 0 ? (pensionAchieved / pensionGoal) * 100 : 0
      },
      insurance: {
        target: insuranceGoal,
        achieved: insuranceAchieved,
        percentage: insuranceGoal > 0 ? (insuranceAchieved / insuranceGoal) * 100 : 0
      }
    };
  }
};