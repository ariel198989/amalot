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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
      </div>

      {/* טבלת פנסיוני */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">פנסיוני</h2>
        <div className="bg-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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

      {/* טבלת ניוד פנסיה */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">ניוד פנסיה</h2>
        <div className="bg-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[5700000, 6000000, 3900000, 6600000, 5700000, 6600000, 5400000, 5400000, 4800000, 5400000, 6300000, 6600000].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      ₪ {amount.toLocaleString()}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">₪ 68,400,000</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {[0, 150000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      ₪ {amount.toLocaleString()}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">₪ 150,000</td>
                </tr>
                {/* שורת אחוז ביצוע */}
                <tr>
                  <td className="text-right px-4 py-2">אחוז ביצוע</td>
                  {[0.0, 2.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0].map((percentage, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {percentage.toFixed(1)}%
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.2%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* טבלת פיננסים ניוד */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">פיננסים ניוד</h2>
        <div className="bg-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[7600000, 8000000, 5200000, 8800000, 7600000, 8800000, 7200000, 7200000, 6400000, 7200000, 8400000, 8800000].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      ₪ {amount.toLocaleString()}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">₪ 91,200,000</td>
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

      {/* טבלת הפקדה שוטפת */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">הפקדה שוטפת</h2>
        <div className="bg-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[19000, 20000, 13000, 22000, 19000, 22000, 18000, 18000, 16000, 18000, 21000, 22000].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      ₪ {amount.toLocaleString()}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">₪ 228,000</td>
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

      {/* טבלת תכנון פיננסי */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">תכנון פיננסי</h2>
        <div className="bg-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[13.3, 14.0, 9.1, 15.4, 13.3, 15.4, 12.6, 12.6, 11.2, 12.6, 14.7, 15.4].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {amount.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">159.6</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {Array(12).fill(0).map((_, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      ₪ 0
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
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

      {/* טבלת כלכלת המשפחה */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">כלכלת המשפחה</h2>
        <div className="bg-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[9.5, 10.0, 6.5, 11.0, 9.5, 11.0, 9.0, 9.0, 8.0, 9.0, 10.5, 11.0].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {amount.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">114.0</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {Array(12).fill(0).map((_, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      0.0
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
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

      {/* טבלת תעסוקה */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">תעסוקה</h2>
        <div className="bg-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[3.8, 4.0, 2.6, 4.4, 3.8, 4.4, 3.6, 3.6, 3.2, 3.6, 4.2, 4.4].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {amount.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">45.6</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {Array(12).fill(0).map((_, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      0.0
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
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

      {/* טבלת ייעוץ עסקי ארגוני */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">ייעוץ עסקי ארגוני</h2>
        <div className="bg-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[1.9, 2.0, 1.3, 2.2, 1.9, 2.2, 1.8, 1.8, 1.6, 1.8, 2.1, 2.2].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {amount.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">22.8</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {Array(12).fill(0).map((_, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      0.0
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
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

      {/* טבלת פרישה */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">פרישה</h2>
        <div className="bg-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[2.66, 2.8, 1.82, 3.08, 2.66, 3.08, 2.52, 2.52, 2.24, 2.52, 2.94, 3.08].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {amount.toFixed(2)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">31.9</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {Array(12).fill(0).map((_, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      0.0
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
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

      {/* טבלת גיוס ארגונים */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">גיוס ארגונים</h2>
        <div className="bg-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[5.7, 6.0, 3.9, 6.6, 5.7, 6.6, 5.4, 5.4, 4.8, 5.4, 6.3, 6.6].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {amount.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">68.4</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {Array(12).fill(0).map((_, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      0.0
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
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

      {/* טבלת משכנתא */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">משכנתא</h2>
        <div className="bg-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[3.8, 4.0, 2.6, 4.4, 3.8, 4.4, 3.6, 3.6, 3.2, 3.6, 4.2, 4.4].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {amount.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">45.6</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {Array(12).fill(0).map((_, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      0.0
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
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

      {/* טבלת מנוי חודשי */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">מנוי חודשי</h2>
        <div className="bg-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[7.6, 8.0, 5.2, 8.8, 7.6, 8.8, 7.2, 7.2, 6.4, 7.2, 8.4, 8.8].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {amount.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">91.2</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {Array(12).fill(0).map((_, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      0.0
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
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

      {/* טבלת הלוואות */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">הלוואות</h2>
        <div className="bg-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[7.6, 8.0, 5.2, 8.8, 7.6, 8.8, 7.2, 7.2, 6.4, 7.2, 8.4, 8.8].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {amount.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">91.2</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {Array(12).fill(0).map((_, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      0.0
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
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

      {/* טבלת נדל"ן */}
      <div>
        <h2 className="text-xl font-bold mb-2 text-blue-900">נדל"ן</h2>
        <div className="bg-orange-50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
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
                {/* שורת היעד */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">יעד</td>
                  {[7.6, 8.0, 5.2, 8.8, 7.6, 8.8, 7.2, 7.2, 6.4, 7.2, 8.4, 8.8].map((amount, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      {amount.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">91.2</td>
                </tr>
                {/* שורת הביצוע */}
                <tr className="border-b border-gray-200">
                  <td className="text-right px-4 py-2">ביצוע</td>
                  {Array(12).fill(0).map((_, i) => (
                    <td key={i} className="text-center px-4 py-2 border-r border-gray-200">
                      0.0
                    </td>
                  ))}
                  <td className="text-right px-4 py-2 font-medium bg-gray-50 border-r">0.0</td>
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
    </div>
  );
};

export default SalesTargetsSystem;
