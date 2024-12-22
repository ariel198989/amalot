import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface SalesTargetsContextType {
  updatePerformance: (category: string, amount: number, date: { month: number; year: number }) => Promise<void>;
  closingRate: number;
  monthlyMeetings: number;
  isDirty: boolean;
  setIsDirty: (value: boolean) => void;
  updateClosingRate: (value: number) => void;
  updateMonthlyMeetings: (value: number) => void;
  saveChanges: () => Promise<void>;
}

const SalesTargetsContext = createContext<SalesTargetsContextType | undefined>(undefined);

export const useSalesTargets = () => {
  const context = useContext(SalesTargetsContext);
  if (!context) {
    throw new Error('useSalesTargets must be used within a SalesTargetsProvider');
  }
  return context;
};

export const SalesTargetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [closingRate, setClosingRate] = useState<number>(30);
  const [monthlyMeetings, setMonthlyMeetings] = useState<number>(44);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('משתמש לא מחובר');
        return;
      }

      const { data: existingSettings, error: fetchError } = await supabase
        .from('sales_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Settings don't exist, create new ones
        const { data: newSettings, error: insertError } = await supabase
          .from('sales_settings')
          .upsert({
            user_id: user.id,
            monthly_meetings: 0,
            monthly_calls: 0,
            monthly_whatsapp: 0,
            monthly_pension_sales: 0,
            monthly_insurance_sales: 0,
            monthly_investment_sales: 0,
            closing_rate: 0
          })
          .select()
          .single();

        if (insertError) {
          console.error('שגיאה ביצירת הגדרות:', insertError);
          return;
        }

        if (newSettings) {
          setClosingRate(newSettings.closing_rate);
          setMonthlyMeetings(newSettings.monthly_meetings);
        }
      } else if (fetchError) {
        console.error('שגיאה בטעינת הגדרות:', fetchError);
        return;
      } else if (existingSettings) {
        setClosingRate(existingSettings.closing_rate);
        setMonthlyMeetings(existingSettings.monthly_meetings);
      }
    } catch (error) {
      console.error('שגיאה בטעינת הגדרות:', error);
    }
  };

  const updateClosingRate = (value: number) => {
    setClosingRate(value);
    setIsDirty(true);
  };

  const updateMonthlyMeetings = (value: number) => {
    setMonthlyMeetings(value);
    setIsDirty(true);
  };

  const saveChanges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('לא נמצא משתמש מחובר');
        return;
      }

      const { error } = await supabase
        .from('sales_settings')
        .upsert({
          user_id: user.id,
          closing_rate: closingRate,
          monthly_meetings: monthlyMeetings
        });

      if (error) {
        console.error('שגיאה בשמירת הגדרות:', error);
        toast.error('שגיאה בשמירת ההגדרות');
        return;
      }

      setIsDirty(false);
      toast.success('ההגדרות נשמרו בהצלחה');
    } catch (error) {
      console.error('שגיאה בשמירת נתונים:', error);
      toast.error('שגיאה בשמירת ההגדרות');
    }
  };

  const updatePerformance = useCallback(async (
    category: string,
    amount: number,
    date: { month: number; year: number }
  ): Promise<void> => {
    console.log('מעדכן ביצועים:', { category, amount, date });

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('לא נמצא משתמש מחובר');
        return;
      }

      // עדכון היעדים
      const { data: existingData, error: fetchError } = await supabase
        .from('sales_targets')
        .select('*')
        .eq('category', category)
        .eq('month', date.month)
        .eq('year', date.year)
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('נתונים קיימים:', existingData, 'שגיאה:', fetchError);

      if (existingData) {
        const { error: updateError } = await supabase
          .from('sales_targets')
          .update({
            performance: existingData.performance + amount
          })
          .eq('id', existingData.id);

        if (updateError) {
          console.error('שגיאה בעדכון היעדים:', updateError);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from('sales_targets')
          .insert({
            category,
            month: date.month,
            year: date.year,
            performance: amount,
            user_id: user.id
          });

        if (insertError) {
          console.error('שגיאה ביצירת יעד חדש:', insertError);
          return;
        }
      }

      console.log('היעדים עודכנו בהצלחה');

      // עולח אירוע מכירה חדשה
      const event = new CustomEvent('newSale', { 
        detail: { category, amount }
      });
      window.dispatchEvent(event);

    } catch (error) {
      console.error('שגיאה בעדכון ביצועים:', error);
    }
  }, []);

  return (
    <SalesTargetsContext.Provider value={{ 
      updatePerformance,
      closingRate,
      monthlyMeetings,
      isDirty,
      setIsDirty,
      updateClosingRate,
      updateMonthlyMeetings,
      saveChanges
    }}>
      {children}
    </SalesTargetsContext.Provider>
  );
}; 