export interface MonthlyTarget {
  month: string;
  workDays: string;
  potentialMeetings: string;
  actualMeetings: string;
  closureRate: string;
}

export interface YearlyTargets {
  year: string;
  monthlyTargets: MonthlyTarget[];
  lastModified: string;
} 