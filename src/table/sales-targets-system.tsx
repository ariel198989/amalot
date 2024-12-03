import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

const SalesTargetsSystem = () => {
  const monthNames = [
    'ינואר 24׳', 'פברואר 24׳', 'מרץ 24׳', 'אפריל 24׳', 'מאי 24׳', 'יוני 24׳',
    'יולי 24׳', 'אוגוסט 24׳', 'ספטמבר 24׳', 'אוקטובר 24׳', 'נובמבר 24׳', 'דצמבר 24׳'
  ];

  const [yearlyTargets, setYearlyTargets] = useState({
    workingDays: '',
    meetingsPerDay: '',
    totalMeetings: '',
    closureRate: '',
    products: {
      insurance: {
        monthlyTarget: '',
        unitValue: '',
        targets: monthNames.map(() => ({
          target: '',
          achieved: '',
          rate: ''
        }))
      },
      pension: {
        monthlyTarget: '',
        unitValue: '',
        targets: monthNames.map(() => ({
          target: '',
          achieved: '',
          rate: ''
        }))
      },
      finance: {
        monthlyTarget: '',
        unitValue: '',
        targets: monthNames.map(() => ({
          target: '',
          achieved: '',
          rate: ''
        }))
      },
      providentFund: {
        monthlyTarget: '',
        unitValue: '',
        targets: monthNames.map(() => ({
          target: '',
          achieved: '',
          rate: ''
        }))
      }
    }
  });

  const handleBasicInputChange = (field: string, value: string) => {
    setYearlyTargets(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductInputChange = (product: string, field: string, value: string) => {
    setYearlyTargets(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: {
          ...prev.products[product],
          [field]: value
        }
      }
    }));
  };

  const handleTargetInputChange = (product: string, monthIndex: number, field: string, value: string) => {
    setYearlyTargets(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: {
          ...prev.products[product],
          targets: prev.products[product].targets.map((target, idx) =>
            idx === monthIndex ? { ...target, [field]: value } : target
          )
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 text-slate-600">הגדרות יסוד</h3>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-1.5">ימי עבודה בשנה:</td>
                <td className="py-1.5">
                  <Input
                    type="number"
                    value={yearlyTargets.workingDays}
                    onChange={(e) => handleBasicInputChange('workingDays', e.target.value)}
                    className="w-full text-right"
                    min="0"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-1.5">פגישות ליום:</td>
                <td className="py-1.5">
                  <Input
                    type="number"
                    value={yearlyTargets.meetingsPerDay}
                    onChange={(e) => handleBasicInputChange('meetingsPerDay', e.target.value)}
                    className="w-full text-right"
                    min="0"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-1.5">אחוז סגירה:</td>
                <td className="py-1.5">
                  <Input
                    type="number"
                    value={yearlyTargets.closureRate}
                    onChange={(e) => handleBasicInputChange('closureRate', e.target.value)}
                    className="w-full text-right"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 text-slate-600">מחשבון עמלות</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-1.5 text-right font-medium text-slate-600">טווח</th>
                <th className="py-1.5 text-right font-medium text-slate-600">עמלה</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1.5">עד ₪150,000</td>
                <td className="py-1.5 font-semibold text-slate-800">35%</td>
              </tr>
              <tr>
                <td className="py-1.5">₪150,000-₪200,000</td>
                <td className="py-1.5 font-semibold text-slate-800">25%</td>
              </tr>
              <tr>
                <td className="py-1.5">מעל ₪200,000</td>
                <td className="py-1.5 font-semibold text-slate-800">20%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(yearlyTargets.products).map(([key, product], idx) => {
          const colors = {
            insurance: { bg: 'bg-blue-50', text: 'text-blue-900', value: 'text-blue-700', sub: 'text-blue-600' },
            pension: { bg: 'bg-emerald-50', text: 'text-emerald-900', value: 'text-emerald-700', sub: 'text-emerald-600' },
            finance: { bg: 'bg-purple-50', text: 'text-purple-900', value: 'text-purple-700', sub: 'text-purple-600' },
            providentFund: { bg: 'bg-amber-50', text: 'text-amber-900', value: 'text-amber-700', sub: 'text-amber-600' }
          };
          const color = colors[key];
          const titles = {
            insurance: 'ביטוחים',
            pension: 'ניוד פנסיה',
            finance: 'ניוד פיננסים',
            providentFund: 'גמל והשתלמות'
          };

          return (
            <div key={key} className={`${color.bg} rounded-lg p-4`}>
              <h3 className={`text-sm font-semibold mb-2 ${color.text}`}>{titles[key]}</h3>
              <div className="space-y-2">
                <Input
                  type="number"
                  value={product.monthlyTarget}
                  onChange={(e) => handleProductInputChange(key, 'monthlyTarget', e.target.value)}
                  className="w-full text-right"
                  min="0"
                  placeholder="יעד חודשי"
                />
                <Input
                  type="number"
                  value={product.unitValue}
                  onChange={(e) => handleProductInputChange(key, 'unitValue', e.target.value)}
                  className="w-full text-right"
                  min="0"
                  placeholder="ערך יחידה"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-200 p-2 text-right">חודש</th>
              <th className="border border-slate-200 p-2 text-right">ביטוחים</th>
              <th className="border border-slate-200 p-2 text-right">ניוד פנסיה</th>
              <th className="border border-slate-200 p-2 text-right">ניוד פיננסים</th>
              <th className="border border-slate-200 p-2 text-right">גמל והשתלמות</th>
              <th className="border border-slate-200 p-2 text-right">סה״כ</th>
            </tr>
          </thead>
          <tbody>
            {monthNames.map((month, monthIndex) => (
              <tr key={monthIndex} className="hover:bg-slate-50">
                <td className="border border-slate-200 p-2">{month}</td>
                {Object.entries(yearlyTargets.products).map(([productKey, product]) => (
                  <td key={productKey} className="border border-slate-200 p-2">
                    <Input
                      type="number"
                      value={product.targets[monthIndex].target}
                      onChange={(e) => handleTargetInputChange(productKey, monthIndex, 'target', e.target.value)}
                      className="w-full text-right"
                      min="0"
                    />
                  </td>
                ))}
                <td className="border border-slate-200 p-2 font-bold">
                  ₪{Object.values(yearlyTargets.products).reduce((acc, product) => 
                    acc + (Number(product.targets[monthIndex].target) || 0), 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesTargetsSystem;
