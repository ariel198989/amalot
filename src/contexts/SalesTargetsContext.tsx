import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

<<<<<<< HEAD
      // First check if a record exists
      const { data: existingData, error: fetchError } = await supabase
        .from('sales_settings')
        .select('id, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing record:', fetchError);
        throw fetchError;
      }

      let error;
      const currentTime = new Date().toISOString();

      if (existingData) {
        console.log('Updating existing record:', existingData.id);
        // Update existing record with optimistic locking
        const { error: updateError } = await supabase
          .from('sales_settings')
          .update({
            closing_rate: closingRate,
            monthly_meetings: monthlyMeetings,
            working_days: workingDays,
            updated_at: currentTime
          })
          .eq('id', existingData.id)
          .eq('updated_at', existingData.updated_at); // Add optimistic locking
        error = updateError;

        if (error?.code === '409') {
          // Handle conflict by retrying the operation
          const { error: retryError } = await supabase
            .from('sales_settings')
            .upsert({
              id: existingData.id,
              user_id: user.id,
              closing_rate: closingRate,
              monthly_meetings: monthlyMeetings,
              working_days: workingDays,
              updated_at: currentTime
            });
          error = retryError;
        }
      } else {
        console.log('Creating new record');
        // Insert new record
        const { error: insertError } = await supabase
          .from('sales_settings')
          .insert({
            user_id: user.id,
            closing_rate: closingRate,
            monthly_meetings: monthlyMeetings,
            working_days: workingDays,
            updated_at: currentTime
          });
        error = insertError;
      }
=======
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
>>>>>>> b93a6b1 (feat: Add personal commission agreements support)

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

      const agreement = {
        user_id: user.id,
        category,
        commission_rate: commissionRate,
        monthly_rate: monthlyRate || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('commission_agreements')
        .upsert(agreement);

      if (error) throw error;

      // Update local state
      setCommissionAgreements(prev => {
        const newAgreements = [...prev];
        const index = newAgreements.findIndex(a => a.category === category);
        if (index >= 0) {
          newAgreements[index] = { category, commission_rate: commissionRate, monthly_rate: monthlyRate };
        } else {
          newAgreements.push({ category, commission_rate: commissionRate, monthly_rate: monthlyRate });
        }
        return newAgreements;
      });
    } catch (error) {
      console.error('Error updating commission agreement:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No user found');
          return;
        }

        // Fetch settings from sales_settings table
        const { data: settingsData, error: settingsError } = await supabase
          .from('sales_settings')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
<<<<<<< HEAD
          .single();
=======
          .maybeSingle();
>>>>>>> b93a6b1 (feat: Add personal commission agreements support)

        if (settingsError) {
          console.error('Settings fetch error:', settingsError);
          // Don't throw the error, just log it and continue with defaults
          console.log('Using default settings due to fetch error');
          setClosingRate(0);
          setMonthlyMeetings(0);
          setWorkingDays(Array(12).fill(22));
        } else {
          console.log('Fetched settings:', settingsData);

          // Update settings
          if (settingsData) {
            setClosingRate(settingsData.closing_rate || 0);
            setMonthlyMeetings(settingsData.monthly_meetings || 0);
            setWorkingDays(settingsData.working_days || Array(12).fill(22));
          }
        }

        // Fetch performances from sales_targets table
        const { data: performancesData, error: performancesError } = await supabase
          .from('sales_targets')
          .select('category, performance, month')
          .eq('user_id', user.id)
          .eq('year', new Date().getFullYear());

        if (performancesError) {
          console.error('Performances fetch error:', performancesError);
          // Don't throw the error, just log it and continue with empty performances
          console.log('Using empty performances due to fetch error');
          setPerformances({});
        } else {
          console.log('Fetched performances:', performancesData);

<<<<<<< HEAD
          // Organize performances by category
          if (performancesData) {
            const organizedPerformances: Record<string, number[]> = {};
            performancesData.forEach(record => {
              if (!organizedPerformances[record.category]) {
                organizedPerformances[record.category] = Array(12).fill(0);
              }
              if (record.performance) {
                organizedPerformances[record.category] = record.performance;
              }
            });
            setPerformances(organizedPerformances);
          }
=======
        console.log('Fetched performances:', performancesData);

        // Organize performances by category
        if (performancesData) {
          const organizedPerformances: Record<string, number[]> = {};
          performancesData.forEach(record => {
            if (!organizedPerformances[record.category]) {
              organizedPerformances[record.category] = Array(12).fill(0);
            }
            if (record.performance !== null && record.month) {
              // אם יש כבר ערך, נוסיף אליו את הביצוע החדש
              const currentValue = organizedPerformances[record.category][record.month - 1];
              organizedPerformances[record.category][record.month - 1] = currentValue + record.performance;
            }
          });
          setPerformances(organizedPerformances);
>>>>>>> b93a6b1 (feat: Add personal commission agreements support)
        }

        // Fetch commission agreements
        const { data: agreementsData, error: agreementsError } = await supabase
          .from('commission_agreements')
          .select('*')
          .eq('user_id', user.id);

        if (agreementsError) {
          console.error('Commission agreements fetch error:', agreementsError);
          throw agreementsError;
        }

        if (agreementsData) {
          setCommissionAgreements(agreementsData.map(agreement => ({
            category: agreement.category,
            commission_rate: agreement.commission_rate,
            monthly_rate: agreement.monthly_rate
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use default values in case of error
        setClosingRate(0);
        setMonthlyMeetings(0);
        setWorkingDays(Array(12).fill(22));
        setPerformances({});
      }
    };

    // Run fetchData immediately
    fetchData();

    // Set up real-time subscription for sales_targets changes
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = supabase
        .channel('sales_targets_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'sales_targets',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time update received for current user:', payload);
            fetchData(); // Reload data when changes occur for this user
          }
        )
        .subscribe();

      return subscription;
    };

    let subscription: any;
    setupSubscription().then(sub => {
      subscription = sub;
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
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