import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface SalesTargetsContextType {
  closingRate: number;
  monthlyMeetings: number;
  isDirty: boolean;
  updateClosingRate: (rate: number) => void;
  updateMonthlyMeetings: (meetings: number) => void;
  saveChanges: () => Promise<void>;
  discardChanges: () => void;
  updatePerformance: (category: string, amount: number, month: number) => Promise<void>;
}

const SalesTargetsContext = createContext<SalesTargetsContextType | undefined>(undefined);

export const SalesTargetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [closingRate, setClosingRate] = useState(() => {
    const saved = localStorage.getItem('salesTargets.closingRate');
    console.log('Initial closingRate from localStorage:', saved);
    return saved ? Number(saved) : 43;
  });
  
  const [monthlyMeetings, setMonthlyMeetings] = useState(() => {
    const saved = localStorage.getItem('salesTargets.monthlyMeetings');
    console.log('Initial monthlyMeetings from localStorage:', saved);
    return saved ? Number(saved) : 44;
  });

  const [isDirty, setIsDirty] = useState(false);
  const [tempValues, setTempValues] = useState({ closingRate, monthlyMeetings });

  const updateClosingRate = (rate: number) => {
    console.log('Updating closing rate to:', rate);
    setTempValues(prev => ({ ...prev, closingRate: rate }));
    setIsDirty(true);
  };

  const updateMonthlyMeetings = (meetings: number) => {
    console.log('Updating monthly meetings to:', meetings);
    setTempValues(prev => ({ ...prev, monthlyMeetings: meetings }));
    setIsDirty(true);
  };

  const saveChanges = async () => {
    try {
      console.log('Saving changes:', tempValues);
      
      setClosingRate(tempValues.closingRate);
      setMonthlyMeetings(tempValues.monthlyMeetings);
      
      localStorage.setItem('salesTargets.closingRate', String(tempValues.closingRate));
      localStorage.setItem('salesTargets.monthlyMeetings', String(tempValues.monthlyMeetings));
      
      setIsDirty(false);
      toast.success('הנתונים נשמרו בהצלחה');

      console.log('Verifying saved values:', {
        localStorage: {
          closingRate: localStorage.getItem('salesTargets.closingRate'),
          monthlyMeetings: localStorage.getItem('salesTargets.monthlyMeetings')
        },
        state: {
          closingRate: tempValues.closingRate,
          monthlyMeetings: tempValues.monthlyMeetings
        }
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('שגיאה בשמירת הנתונים');
      throw error;
    }
  };

  const discardChanges = () => {
    console.log('Discarding changes, reverting to:', { closingRate, monthlyMeetings });
    setTempValues({ closingRate, monthlyMeetings });
    setIsDirty(false);
    toast.success('השינויים בוטלו');
  };

  const updatePerformance = async (category: string, amount: number, month: number) => {
    try {
      const year = new Date().getFullYear();
      console.log('מעדכן ביצועים:', { category, amount, month, year });
      
      // קודם כל מנסים לקבל את הנתונים הקיימים
      const { data: existingData, error: fetchError } = await supabase
        .from('sales_targets')
        .select('performance')
        .eq('month', month)
        .eq('year', year)
        .eq('category', category)
        .maybeSingle();

      console.log('נתונים קיימים:', existingData, 'שגיאה:', fetchError);

      const currentPerformance = existingData?.performance || 0;
      const newPerformance = currentPerformance + amount;

      console.log('חישוב ביצועים חדש:', { currentPerformance, newPerformance });

      // משתמשים ב-upsert במקום insert
      const { data: upsertResult, error: upsertError } = await supabase
        .from('sales_targets')
        .upsert({
          category,
          month,
          year,
          performance: newPerformance
        }, {
          onConflict: 'category,month,year'
        });

      console.log('תוצאת העדכון:', { data: upsertResult, error: upsertError });

      if (upsertError) throw upsertError;

      toast.success('הביצועים עודכנו בהצלחה');
    } catch (error) {
      console.error('שגיאה בעדכון הביצועים:', error);
      toast.error('שגיאה בעדכון הביצועים');
    }
  };

  useEffect(() => {
    console.log('Context values updated:', {
      closingRate: tempValues.closingRate,
      monthlyMeetings: tempValues.monthlyMeetings,
      isDirty
    });
  }, [tempValues, isDirty]);

  return (
    <SalesTargetsContext.Provider value={{
      closingRate: tempValues.closingRate,
      monthlyMeetings: tempValues.monthlyMeetings,
      isDirty,
      updateClosingRate,
      updateMonthlyMeetings,
      saveChanges,
      discardChanges,
      updatePerformance
    }}>
      {children}
    </SalesTargetsContext.Provider>
  );
};

export const useSalesTargets = () => {
  const context = useContext(SalesTargetsContext);
  if (!context) {
    throw new Error('useSalesTargets must be used within a SalesTargetsProvider');
  }
  return context;
}; 