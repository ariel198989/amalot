/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

interface WorkPlanContextType {
  updatePerformance: (category: string, amount: number, month: number) => Promise<void>;
}

const WorkPlanContext = createContext<WorkPlanContextType | undefined>(undefined);

export function WorkPlanProvider({ children }: { children: React.ReactNode }) {
  const updatePerformance = async (category: string, amount: number, month: number) => {
    try {
      // Get existing work plan entry
      const { data: existingData, error: fetchError } = await supabase
        .from('work_plan')
        .select('performance')
        .eq('month', month)
        .eq('category', category)
        .single();

      if (fetchError) throw fetchError;

      const currentPerformance = existingData?.performance || 0;
      const newPerformance = currentPerformance + amount;

      // Update the performance
      const { error: updateError } = await supabase
        .from('work_plan')
        .update({ performance: newPerformance })
        .eq('month', month)
        .eq('category', category);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating performance:', error);
    }
  };

  return (
    <WorkPlanContext.Provider value={{ updatePerformance }}>
      {children}
    </WorkPlanContext.Provider>
  );
}

export const useWorkPlan = () => {
  const context = useContext(WorkPlanContext);
  if (!context) {
    throw new Error('useWorkPlan must be used within a WorkPlanProvider');
  }
  return context;
}; 