import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface SalesTargetsSystemProps {
  agent_id: string;
  year: number;
}

const SalesTargetsSystem: React.FC<SalesTargetsSystemProps> = ({ agent_id, year }) => {
  return (
    <div className="space-y-4">
      {/* טבלת סיכונים */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">סיכונים</h2>
        <div className="bg-slate-100">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-right px-4 py-2 bg-blue-900 text-white">יעד</th>
                {['ינואר 24׳', 'פברואר 24׳', 'מרץ 24׳', 'אפריל 24׳', 'מאי 24׳', 'יוני 24׳',
                  'יולי 24׳', 'אוגוסט 24׳', 'ספטמבר 24׳', 'אוקטובר 24׳', 'נובמבר 24׳', 'דצמבר 24׳'].map(month => (
                    <th key={month} className="text-center px-4 py-2 bg-blue-900 text-white border-r border-blue-800">
                      {month}
                    </th>
                  ))}
                <th className="text-center px-4 py-2 bg-blue-800 text-white border-r">סיכום שנתי</th>
              </tr>
            </thead>
            <tbody>
              {/* שורת היעד - סיכונים */}
              <tr className="border-b border-gray-200">
                <td className="text-right px-4 py-2">יעד</td>
                {[5700, 6000, 3900, 6600, 5700, 6600, 5400, 5400, 4800, 5400, 6300, 6600].map((amount, i) => (
                  <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                    ₪ {amount.toLocaleString()}
                  </td>
                ))}
                <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">₪ 68,400</td>
              </tr>
              {/* שורת הביצוע */}
              <tr className="border-b border-gray-200">
                <td className="text-right px-4 py-2">ביצוע</td>
                {Array(12).fill(0).map((_, i) => (
                  <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                    ₪ 0
                  </td>
                ))}
                <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">₪ 0</td>
              </tr>
              {/* שורת אחוז ביצוע */}
              <tr>
                <td className="text-right px-4 py-2">אחוז ביצוע</td>
                {Array(12).fill(0).map((_, i) => (
                  <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                    0.0%
                  </td>
                ))}
                <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* טבלת פנסיוני */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">פנסיוני</h2>
        <div className="bg-slate-100">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-right px-4 py-2 bg-blue-900 text-white">יעד</th>
                {['ינואר 24׳', 'פברואר 24׳', 'מרץ 24׳', 'אפריל 24׳', 'מאי 24׳', 'יוני 24׳',
                  'יולי 24׳', 'אוגוסט 24׳', 'ספטמבר 24׳', 'אוקטובר 24׳', 'נובמבר 24׳', 'דצמבר 24׳'].map(month => (
                    <th key={month} className="text-center px-4 py-2 bg-blue-900 text-white border-r border-blue-800">
                      {month}
                    </th>
                  ))}
                <th className="text-center px-4 py-2 bg-blue-800 text-white border-r">סיכום שנתי</th>
              </tr>
            </thead>
            <tbody>
              {/* שורת היעד - פנסיוני */}
              <tr className="border-b border-gray-200">
                <td className="text-right px-4 py-2">יעד</td>
                {[57000, 60000, 39000, 66000, 57000, 66000, 54000, 54000, 48000, 54000, 63000, 66000].map((amount, i) => (
                  <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                    ₪ {amount.toLocaleString()}
                  </td>
                ))}
                <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">₪ 684,000</td>
              </tr>
              {/* שורת הביצוע */}
              <tr className="border-b border-gray-200">
                <td className="text-right px-4 py-2">ביצוע</td>
                {Array(12).fill(0).map((_, i) => (
                  <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                    ₪ 0
                  </td>
                ))}
                <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">₪ 0</td>
              </tr>
              {/* שורת אחוז ביצוע */}
              <tr>
                <td className="text-right px-4 py-2">אחוז ביצוע</td>
                {Array(12).fill(0).map((_, i) => (
                  <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                    0.0%
                  </td>
                ))}
                <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesTargetsSystem;
