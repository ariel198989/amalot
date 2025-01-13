import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface CommissionAgreement {
  category: string;
  commission_rate: number;
  monthly_rate?: number;
}

interface SalesTargetsContextType {
  closingRate: number;
  monthlyMeetings: number;
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
  updateClosingRate: (value: number) => void;
  updateMonthlyMeetings: (value: number) => void;
  saveChanges: () => Promise<void>;
  deleteData: () => Promise<void>;
  performances: Record<string, number[]>;
  updatePerformances: (newPerformances: Record<string, number[]>) => void;
  updatePerformance: (category: string, month: number, value: number) => void;
  workingDays: number[];
  updateWorkingDays: (monthIndex: number, days: number) => void;
  commissionAgreements: CommissionAgreement[];
  updateCommissionAgreement: (category: string, commissionRate: number, monthlyRate?: number) => Promise<void>;
}

export const SalesTargetsContext = createContext<SalesTargetsContextType>({
  closingRate: 0,
  monthlyMeetings: 0,
  isDirty: false,
  setIsDirty: () => {},
  updateClosingRate: () => {},
  updateMonthlyMeetings: () => {},
  saveChanges: async () => {},
  deleteData: async () => {},
  performances: {},
  updatePerformances: () => {},
  updatePerformance: () => {},
  workingDays: Array(12).fill(22),
  updateWorkingDays: () => {},
  commissionAgreements: [],
  updateCommissionAgreement: async () => {},
});

export const useSalesTargets = () => {
  const context = useContext(SalesTargetsContext);
  if (!context) {
    throw new Error('useSalesTargets must be used within a SalesTargetsProvider');
  }
  return context;
};

export const SalesTargetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [closingRate, setClosingRate] = useState(0);
  const [monthlyMeetings, setMonthlyMeetings] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [performances, setPerformances] = useState<Record<string, number[]>>({});
  const [workingDays, setWorkingDays] = useState<number[]>(Array(12).fill(22));
  const [commissionAgreements, setCommissionAgreements] = useState<CommissionAgreement[]>([]);

  const updateClosingRate = (value: number) => {
    console.log('Updating closing rate to:', value);
    setClosingRate(value);
    setIsDirty(true);
  };

  const updateMonthlyMeetings = (value: number) => {
    console.log('Updating monthly meetings to:', value);
    setMonthlyMeetings(value);
    setIsDirty(true);
  };

  const updateWorkingDays = (monthIndex: number, days: number) => {
    const newWorkingDays = [...workingDays];
    newWorkingDays[monthIndex] = days;
    setWorkingDays(newWorkingDays);
    setIsDirty(true);
  };

  const saveChanges = async () => {
    try {
      console.log('Saving changes:', { closingRate, monthlyMeetings, workingDays });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('לא נמצא משתמש מחובר');
        return;
      }

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('sales_settings')
        .upsert({
          user_id: user.id,
          year: new Date().getFullYear(),
          closing_rate: closingRate,
          monthly_meetings: monthlyMeetings,
          working_days: workingDays,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Database operation error:', error);
        if (error.code === '409') {
          alert('נתונים עודכנו במקביל. מנסה לשמור שוב...');
          // Wait a bit and try one more time
          await new Promise(resolve => setTimeout(resolve, 1000));
          return saveChanges();
        }
        throw error;
      }
      
      setIsDirty(false);
      alert('הנתונים נשמרו בהצלחה');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('אירעה שגיאה בשמירת הנתונים. אנא נסה שוב.');
    }
  };

  const deleteData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('לא נמצא משתמש מחובר');
        return;
      }

      // Delete from sales_settings
      const { error: settingsError } = await supabase
        .from('sales_settings')
        .delete()
        .eq('user_id', user.id);

      if (settingsError) throw settingsError;

      // Delete from sales_targets
      const { error: targetsError } = await supabase
        .from('sales_targets')
        .delete()
        .eq('user_id', user.id);

      if (targetsError) throw targetsError;

      // Delete from commission_agreements
      const { error: agreementsError } = await supabase
        .from('commission_agreements')
        .delete()
        .eq('user_id', user.id);

      if (agreementsError) throw agreementsError;

      // Reset local state
      setClosingRate(0);
      setMonthlyMeetings(0);
      setWorkingDays(Array(12).fill(22));
      setPerformances({});
      setIsDirty(false);

      // Reset commission agreements state
      setCommissionAgreements([]);

      alert('הנתונים נמחקו בהצלחה');
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('אירעה שגיאה במחיקת הנתונים. אנא נסה שוב.');
    }
  };

  const updatePerformances = (newPerformances: Record<string, number[]>) => {
    setPerformances(newPerformances);
    setIsDirty(true);
  };

  const updatePerformance = async (category: string, month: number, value: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update the local state
      const newPerformances = { ...performances };
      if (!newPerformances[category]) {
        newPerformances[category] = Array(12).fill(0);
      }
      newPerformances[category][month - 1] = value;
      setPerformances(newPerformances);

      // Update the database
      const { error } = await supabase
        .from('sales_targets')
        .upsert({
          user_id: user.id,
          category,
          month,
          year: new Date().getFullYear(),
          performance: value
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating performance:', error);
      throw error;
    }
  };

  const updateCommissionAgreement = async (category: string, commissionRate: number, monthlyRate?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('commission_agreements')
        .upsert({
          user_id: user.id,
          category,
          commission_rate: commissionRate,
          monthly_rate: monthlyRate,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setCommissionAgreements(prev => {
        const newAgreements = [...prev];
        const index = newAgreements.findIndex(a => a.category === category);
        const newAgreement = { category, commission_rate: commissionRate, monthly_rate: monthlyRate };
        
        if (index !== -1) {
          newAgreements[index] = newAgreement;
        } else {
          newAgreements.push(newAgreement);
        }
        
        return newAgreements;
      });

      toast.success('הסכם העמלות עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating commission agreement:', error);
      toast.error('שגיאה בעדכון הסכם העמלות');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('sales_settings')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (settingsError) {
          throw settingsError;
        }

        if (settingsData) {
          setClosingRate(settingsData.closing_rate || 0);
          setMonthlyMeetings(settingsData.monthly_meetings || 0);
          setWorkingDays(settingsData.working_days || Array(12).fill(22));
        }

        // Fetch performances
        const { data: performancesData, error: performancesError } = await supabase
          .from('sales_targets')
          .select('*')
          .eq('user_id', user.id)
          .eq('year', new Date().getFullYear());

        if (performancesError) {
          throw performancesError;
        }

        console.log('Fetched performances:', performancesData);

        // Organize performances by category
        if (performancesData) {
          const organizedPerformances: Record<string, number[]> = {};
          performancesData.forEach(record => {
            if (!organizedPerformances[record.category]) {
              organizedPerformances[record.category] = Array(12).fill(0);
            }
            organizedPerformances[record.category][record.month - 1] = record.performance || 0;
          });

          setPerformances(organizedPerformances);
          console.log('Organized performances:', organizedPerformances);
        }

        // Fetch commission agreements
        const { data: agreementsData, error: agreementsError } = await supabase
          .from('commission_agreements')
          .select('*')
          .eq('user_id', user.id);

        if (agreementsError) {
          throw agreementsError;
        }

        if (agreementsData) {
          setCommissionAgreements(agreementsData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <SalesTargetsContext.Provider 
      value={{ 
        closingRate, 
        monthlyMeetings, 
        isDirty,
        setIsDirty,
        updateClosingRate,
        updateMonthlyMeetings,
        saveChanges,
        deleteData,
        performances,
        updatePerformances,
        updatePerformance,
        workingDays,
        updateWorkingDays,
        commissionAgreements,
        updateCommissionAgreement
      }}
    >
      {children}
    </SalesTargetsContext.Provider>
  );
}; 