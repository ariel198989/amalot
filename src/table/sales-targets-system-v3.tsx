import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/router';

interface MonthlyData {
  target: string;
  actual: string;
  performance: string;
}

interface ProductData {
  name: string;
  monthly: MonthlyData[];
}

interface YearlyData {
  [key: string]: ProductData;
}

export interface SalesTrackingTableProps {
  agent_id: string;
  year: number;
}

const SalesTrackingTable: React.FC<SalesTrackingTableProps> = ({ agent_id, year }) => {
  const router = useRouter();
  const monthNames = [
    'ינואר 24׳', 'פברואר 24׳', 'מרץ 24׳', 'אפריל 24׳', 'מאי 24׳', 'יוני 24׳',
    'יולי 24׳', 'אוגוסט 24׳', 'ספטמבר 24׳', 'אוקטובר 24׳', 'נובמבר 24׳', 'דצמבר 24׳'
  ];

  const [yearlyData, setYearlyData] = useState<YearlyData>({
    insurance: {
      name: 'שנתי סיכונים',
      monthly: monthNames.map(() => ({
        target: '',
        actual: '',
        performance: ''
      }))
    },
    pension: {
      name: 'שנתי ניודי פנסיה',
      monthly: monthNames.map(() => ({
        target: '',
        actual: '',
        performance: ''
      }))
    },
    finance: {
      name: 'שנתי פיננסים ניוד',
      monthly: monthNames.map(() => ({
        target: '',
        actual: '',
        performance: ''
      }))
    },
    providentFund: {
      name: 'שנתי פנסיוני',
      monthly: monthNames.map(() => ({
        target: '',
        actual: '',
        performance: ''
      }))
    }
  });

  const handleInputChange = (productKey: string, monthIndex: number, field: keyof MonthlyData, value: string) => {
    setYearlyData(prev => ({
      ...prev,
      [productKey]: {
        ...prev[productKey],
        monthly: prev[productKey].monthly.map((month, idx) =>
          idx === monthIndex ? { ...month, [field]: value } : month
        )
      }
    }));
  };

  const calculateTotals = (data: MonthlyData[]) => {
    const target = data.reduce((acc, m) => acc + (Number(m.target) || 0), 0);
    const actual = data.reduce((acc, m) => acc + (Number(m.actual) || 0), 0);
    const performance = target === 0 ? 0 : (actual / target * 100);
    return { target, actual, performance };
  };

  const TableComponent = ({ data, name, productKey }: { data: ProductData; name: string; productKey: string }) => {
    const totals = calculateTotals(data.monthly);

    return (
      <div className="mb-6 last:mb-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th colSpan={4} className="border border-slate-200 p-2 text-right bg-slate-800 text-white">
                  {name}
                </th>
              </tr>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-2 text-right">חודש</th>
                <th className="border border-slate-200 p-2 text-right">יעד</th>
                <th className="border border-slate-200 p-2 text-right">ביצוע</th>
                <th className="border border-slate-200 p-2 text-right">אחוז ביצוע</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-800 text-white font-bold">
                <td className="border border-slate-200 p-2">שנתי</td>
                <td className="border border-slate-200 p-2">₪{totals.target.toLocaleString()}</td>
                <td className="border border-slate-200 p-2">₪{totals.actual.toLocaleString()}</td>
                <td className="border border-slate-200 p-2">{totals.performance.toFixed(1)}%</td>
              </tr>
              {monthNames.map((month, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="border border-slate-200 p-2">{month}</td>
                  <td className="border border-slate-200 p-2">
                    <Input
                      type="number"
                      value={data.monthly[idx].target}
                      onChange={(e) => handleInputChange(productKey, idx, 'target', e.target.value)}
                      className="w-full text-right"
                      min="0"
                    />
                  </td>
                  <td className="border border-slate-200 p-2">
                    <Input
                      type="number"
                      value={data.monthly[idx].actual}
                      onChange={(e) => handleInputChange(productKey, idx, 'actual', e.target.value)}
                      className="w-full text-right"
                      min="0"
                    />
                  </td>
                  <td className="border border-slate-200 p-2">
                    <Input
                      type="number"
                      value={data.monthly[idx].performance}
                      onChange={(e) => handleInputChange(productKey, idx, 'performance', e.target.value)}
                      className="w-full text-right"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">מעקב יעדים</h1>
        <button
          onClick={() => router.push('/promotions')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <Sparkles className="h-4 w-4" />
          מבצעים פעילים
        </button>
      </div>
      {Object.entries(yearlyData).map(([key, data]) => (
        <TableComponent key={key} data={data} name={data.name} productKey={key} />
      ))}
    </div>
  );
};

export default SalesTrackingTable;
