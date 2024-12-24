import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SalesTargetsContextType {
  closingRate: number;
  monthlyMeetings: number;
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
  updateClosingRate: (value: number) => void;
  updateMonthlyMeetings: (value: number) => void;
  saveChanges: () => Promise<void>;
  performances: Record<string, number[]>;
  updatePerformances: (newPerformances: Record<string, number[]>) => void;
  updatePerformance: (category: string, month: number, value: number) => void;
  workingDays: number[];
  updateWorkingDays: (monthIndex: number, days: number) => void;
}

export const SalesTargetsContext = createContext<SalesTargetsContextType>({
  closingRate: 0,
  monthlyMeetings: 0,
  isDirty: false,
  setIsDirty: () => {},
  updateClosingRate: () => {},
  updateMonthlyMeetings: () => {},
  saveChanges: async () => {},
  performances: {},
  updatePerformances: () => {},
  updatePerformance: () => {},
  workingDays: Array(12).fill(22),
  updateWorkingDays: () => {},
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

      // First check if a record exists
      const { data: existingData } = await supabase
        .from('sales_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      if (existingData) {
        console.log('Updating existing record:', existingData.id);
        // Update existing record
        const { error: updateError } = await supabase
          .from('sales_settings')
          .update({
            closing_rate: closingRate,
            monthly_meetings: monthlyMeetings,
            working_days: workingDays,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
        error = updateError;
      } else {
        console.log('Creating new record');
        // Insert new record
        const { error: insertError } = await supabase
          .from('sales_settings')
          .insert({
            user_id: user.id,
            closing_rate: closingRate,
            monthly_meetings: monthlyMeetings,
            working_days: workingDays
          });
        error = insertError;
      }

      if (error) {
        console.error('Database operation error:', error);
        throw error;
      }
      
      setIsDirty(false);
      alert('הנתונים נשמרו בהצלחה');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('אירעה שגיאה בשמירת הנתונים. אנא נסה שוב.');
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
          .maybeSingle();

        if (settingsError) {
          console.error('Settings fetch error:', settingsError);
          throw settingsError;
        }

        console.log('Fetched settings:', settingsData);

        // Update settings
        if (settingsData) {
          setClosingRate(settingsData.closing_rate || 0);
          setMonthlyMeetings(settingsData.monthly_meetings || 0);
          setWorkingDays(settingsData.working_days || Array(12).fill(22));
        }

        // Fetch performances from sales_targets table
        const { data: performancesData, error: performancesError } = await supabase
          .from('sales_targets')
          .select('category, performance')
          .eq('user_id', user.id)
          .eq('year', new Date().getFullYear());

        if (performancesError) {
          console.error('Performances fetch error:', performancesError);
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
            if (record.performance) {
              organizedPerformances[record.category] = record.performance;
            }
          });
          setPerformances(organizedPerformances);
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
        performances,
        updatePerformances,
        updatePerformance,
        workingDays,
        updateWorkingDays
      }}
    >
      {children}
    </SalesTargetsContext.Provider>
  );
}; 