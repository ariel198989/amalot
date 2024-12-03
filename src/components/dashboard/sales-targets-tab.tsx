import React from 'react';
import { Card } from '@/components/ui/card';

const SalesTargetsTab = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {/* טבלה 1 - מטרות יסוד */}
        <Card>
          <div className="bg-[#1e3a8a] text-white p-2 text-center font-bold rounded-t-lg">
            מטרות יסוד
          </div>
          <div className="p-4">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2">פגישות ליום</td>
                  <td className="py-2 text-left">2</td>
                </tr>
                <tr>
                  <td className="py-2">אחוז סגירה</td>
                  <td className="py-2 text-left">43%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* טבלה 2 - ממוצע פעילות לפגישה */}
        <Card>
          <div className="bg-[#1e3a8a] text-white p-2 text-center font-bold rounded-t-lg">
            ממוצע פעילות לפגישה
          </div>
          <div className="p-4">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2">סיכונים</td>
                  <td className="py-2 text-left">₪ 150</td>
                </tr>
                <tr>
                  <td className="py-2">פנסיוני</td>
                  <td className="py-2 text-left">₪ 1,500</td>
                </tr>
                <tr>
                  <td className="py-2">ניוד פנסיה</td>
                  <td className="py-2 text-left">₪ 150,000</td>
                </tr>
                <tr>
                  <td className="py-2">פיננסים ניוד</td>
                  <td className="py-2 text-left">₪ 200,000</td>
                </tr>
                <tr>
                  <td className="py-2">משכנתא</td>
                  <td className="py-2 text-left">₪ 300</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* טבלה 3 - ממוצע לפגישה מוצרי גולה */}
        <Card>
          <div className="bg-[#1e3a8a] text-white p-2 text-center font-bold rounded-t-lg">
            ממוצע לפגישה מוצרי גולה
          </div>
          <div className="p-4">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2">תכנון פיננסי</td>
                  <td className="py-2 text-left">35%</td>
                </tr>
                <tr>
                  <td className="py-2">כלכלת המשפחה</td>
                  <td className="py-2 text-left">27%</td>
                </tr>
                <tr>
                  <td className="py-2">תעסוקה</td>
                  <td className="py-2 text-left">10%</td>
                </tr>
                <tr>
                  <td className="py-2">יעוץ עסקי ארגוני</td>
                  <td className="py-2 text-left">5%</td>
                </tr>
                <tr>
                  <td className="py-2">פרישה</td>
                  <td className="py-2 text-left">7%</td>
                </tr>
                <tr>
                  <td className="py-2">גיוס ארגונים</td>
                  <td className="py-2 text-left">15%</td>
                </tr>
                <tr>
                  <td className="py-2">משכנתא</td>
                  <td className="py-2 text-left">10%</td>
                </tr>
                <tr>
                  <td className="py-2">מנוי חודשי</td>
                  <td className="py-2 text-left">20%</td>
                </tr>
                <tr>
                  <td className="py-2">הלוואות</td>
                  <td className="py-2 text-left">20%</td>
                </tr>
                <tr>
                  <td className="py-2">נדל"ן</td>
                  <td className="py-2 text-left">20%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesTargetsTab; 