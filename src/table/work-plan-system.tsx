import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

const WorkPlanTable = () => {
  const monthNames = [
    'ינואר 24׳', 'פברואר 24׳', 'מרץ 24׳', 'אפריל 24׳', 'מאי 24׳', 'יוני 24׳',
    'יולי 24׳', 'אוגוסט 24׳', 'ספטמבר 24׳', 'אוקטובר 24׳', 'נובמבר 24׳', 'דצמבר 24׳'
  ];

  const [yearlyWorkPlan, setYearlyWorkPlan] = useState({
    monthlyTargets: monthNames.map(month => ({
      month,
      workDays: '',
      meetingsPerDay: '',
      closureRate: '',
      actualMeetings: '',
      performanceRate: ''
    }))
  });

  const handleInputChange = (monthIndex: number, field: string, value: string) => {
    const newMonthlyTargets = [...yearlyWorkPlan.monthlyTargets];
    newMonthlyTargets[monthIndex] = {
      ...newMonthlyTargets[monthIndex],
      [field]: value
    };
    setYearlyWorkPlan({ ...yearlyWorkPlan, monthlyTargets: newMonthlyTargets });
  };

  const calculateTotals = () => {
    return {
      totalWorkDays: yearlyWorkPlan.monthlyTargets.reduce((acc, month) => acc + (Number(month.workDays) || 0), 0),
      totalMeetings: yearlyWorkPlan.monthlyTargets.reduce((acc, month) => acc + (Number(month.actualMeetings) || 0), 0),
      averageClosureRate: (yearlyWorkPlan.monthlyTargets.reduce((acc, month) => acc + (Number(month.closureRate) || 0), 0) / 12).toFixed(1)
    };
  };

  const totals = calculateTotals();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-200 p-2 text-right">חודש</th>
            <th className="border border-slate-200 p-2 text-right">ימי עבודה</th>
            <th className="border border-slate-200 p-2 text-right">פגישות ליום</th>
            <th className="border border-slate-200 p-2 text-right">יעד פגישות</th>
            <th className="border border-slate-200 p-2 text-right">ביצוע פגישות</th>
            <th className="border border-slate-200 p-2 text-right">אחוז סגירה</th>
            <th className="border border-slate-200 p-2 text-right">אחוז ביצוע</th>
          </tr>
        </thead>
        <tbody>
          {yearlyWorkPlan.monthlyTargets.map((month, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              <td className="border border-slate-200 p-2">{month.month}</td>
              <td className="border border-slate-200 p-2">
                <Input
                  type="number"
                  value={month.workDays}
                  onChange={(e) => handleInputChange(idx, 'workDays', e.target.value)}
                  className="w-full text-right"
                  min="0"
                  max="31"
                />
              </td>
              <td className="border border-slate-200 p-2">
                <Input
                  type="number"
                  value={month.meetingsPerDay}
                  onChange={(e) => handleInputChange(idx, 'meetingsPerDay', e.target.value)}
                  className="w-full text-right"
                  min="0"
                />
              </td>
              <td className="border border-slate-200 p-2">
                {Number(month.workDays || 0) * Number(month.meetingsPerDay || 0)}
              </td>
              <td className="border border-slate-200 p-2">
                <Input
                  type="number"
                  value={month.actualMeetings}
                  onChange={(e) => handleInputChange(idx, 'actualMeetings', e.target.value)}
                  className="w-full text-right"
                  min="0"
                />
              </td>
              <td className="border border-slate-200 p-2">
                <Input
                  type="number"
                  value={month.closureRate}
                  onChange={(e) => handleInputChange(idx, 'closureRate', e.target.value)}
                  className="w-full text-right"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </td>
              <td className="border border-slate-200 p-2">
                <Input
                  type="number"
                  value={month.performanceRate}
                  onChange={(e) => handleInputChange(idx, 'performanceRate', e.target.value)}
                  className="w-full text-right"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </td>
            </tr>
          ))}
          <tr className="bg-slate-800 text-white font-bold">
            <td className="border border-slate-200 p-2">שנתי</td>
            <td className="border border-slate-200 p-2">{totals.totalWorkDays}</td>
            <td className="border border-slate-200 p-2">-</td>
            <td className="border border-slate-200 p-2">{totals.totalWorkDays * 2}</td>
            <td className="border border-slate-200 p-2">{totals.totalMeetings}</td>
            <td className="border border-slate-200 p-2">{totals.averageClosureRate}%</td>
            <td className="border border-slate-200 p-2">
              {((totals.totalMeetings / (totals.totalWorkDays * 2)) * 100).toFixed(1)}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default WorkPlanTable;
