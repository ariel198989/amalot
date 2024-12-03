import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

interface YearlyTargets {
  workDays: string;
  meetingsPerDay: string;
  closureRate: string;
}

const SalesTargets = () => {
  const [yearlyTargets, setYearlyTargets] = useState<YearlyTargets>({
    workDays: '',
    meetingsPerDay: '',
    closureRate: ''
  });

  // חישוב עמלות לפי טווחים
  const commissionRanges = [
    { range: 'עד ₪150,000', commission: '35%' },
    { range: '₪150,000-₪200,000', commission: '25%' },
    { range: 'מעל ₪200,000', commission: '20%' }
  ];

  // יעדים לפי סוג מוצר
  const productTargets = [
    { name: 'ביטוחים', target: '', actual: '' },
    { name: 'ניוד פנסיה', target: '', actual: '' },
    { name: 'ניוד פיננסים', target: '', actual: '' },
    { name: 'גמל והשתלמות', target: '', actual: '' }
  ];

  return (
    <div className="space-y-8">
      {/* הגדרות יסוד */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-right">הגדרות יסוד</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-right mb-2">ימי עבודה בשנה:</label>
            <Input
              type="number"
              value={yearlyTargets.workDays}
              onChange={(e) => setYearlyTargets(prev => ({ ...prev, workDays: e.target.value }))}
              className="text-right"
            />
          </div>
          <div>
            <label className="block text-right mb-2">פגישות ליום:</label>
            <Input
              type="number"
              value={yearlyTargets.meetingsPerDay}
              onChange={(e) => setYearlyTargets(prev => ({ ...prev, meetingsPerDay: e.target.value }))}
              className="text-right"
            />
          </div>
          <div>
            <label className="block text-right mb-2">אחוז סגירה:</label>
            <Input
              type="number"
              value={yearlyTargets.closureRate}
              onChange={(e) => setYearlyTargets(prev => ({ ...prev, closureRate: e.target.value }))}
              className="text-right"
            />
          </div>
        </div>
      </div>

      {/* חישוב עמלות */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-right">חישוב עמלות</h3>
        <table className="w-full">
          <tbody>
            {commissionRanges.map((range, idx) => (
              <tr key={idx}>
                <td className="text-right p-2">{range.range}</td>
                <td className="text-right p-2">{range.commission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* יעדים לפי מוצר */}
      <div className="grid grid-cols-4 gap-4">
        {productTargets.map((product, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-bold text-right mb-3">{product.name}</h4>
            <div className="space-y-2">
              <Input
                placeholder="יעד חודשי"
                className="text-right mb-2"
                value={product.target}
              />
              <Input
                placeholder="ערך ירידה"
                className="text-right"
                value={product.actual}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesTargets; 