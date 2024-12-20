import { YearlyTargets, MonthlyTarget } from '@/types/targets';

// פונקציית עזר לעדכון יעדים חודשיים
export const handleTargetChange = (
  monthIndex: number, 
  field: keyof MonthlyTarget, 
  value: string,
  yearlyTargets: YearlyTargets | null,
  setYearlyTargets: (targets: YearlyTargets) => void,
  debouncedSave: (targets: YearlyTargets) => void
) => {
  if (!yearlyTargets) return;

  const newMonthlyTargets = [...yearlyTargets.monthlyTargets];
  newMonthlyTargets[monthIndex] = {
    ...newMonthlyTargets[monthIndex],
    [field]: value
  };

  const updatedTargets = {
    ...yearlyTargets,
    monthlyTargets: newMonthlyTargets,
    lastModified: new Date().toISOString()
  };

  setYearlyTargets(updatedTargets);
  debouncedSave(updatedTargets);
}; 