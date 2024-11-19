import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

interface CommissionData {
  date: string;
  company: string;
  clientName: string;
  productType: string;
  actualCommission: number;
  calculatedCommission: number;
  difference: number;
}

const CommissionReportsComparison: React.FC = () => {
  const [comparisonData, setComparisonData] = React.useState<CommissionData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // קריאת הגיליון הראשון
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          // השוואה מול הנתונים בדאטהבייס
          const comparisonResults = await compareWithDatabase(jsonData);
          setComparisonData(comparisonResults);
          
          toast.success('הדוח נטען בהצלחה');
        } catch (error) {
          console.error('Error processing Excel:', error);
          toast.error('שגיאה בעיבוד הקובץ');
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('שגיאה בטעינת הקובץ');
    } finally {
      setIsLoading(false);
    }
  };

  const compareWithDatabase = async (excelData: any[]): Promise<CommissionData[]> => {
    const results: CommissionData[] = [];

    for (const row of excelData) {
      // התאמת השדות מהאקסל לפורמט הנדרש
      const date = row['תאריך'] || row['DATE'] || '';
      const company = row['חברה'] || row['COMPANY'] || '';
      const clientName = row['שם לקוח'] || row['CLIENT_NAME'] || '';
      const actualCommission = Number(row['עמלה'] || row['COMMISSION'] || 0);

      // חיפוש העסקה המתאימה בדאטהבייס
      const { data: dbData } = await supabase
        .from('pension_sales')
        .select('total_commission')
        .eq('date', date)
        .eq('company', company)
        .eq('client_name', clientName)
        .single();

      const calculatedCommission = dbData?.total_commission || 0;
      const difference = actualCommission - calculatedCommission;

      results.push({
        date,
        company,
        clientName,
        productType: 'פנסיה', // יש להתאים לפי סוג המוצר
        actualCommission,
        calculatedCommission,
        difference
      });
    }

    return results;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>השוואת דוחות עמלות</CardTitle>
        <CardDescription>העלה דוח עמלות מחברת הביטוח להשוואה מול החישובים שלך</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? 'מעבד...' : 'העלה דוח אקסל'}
            </Button>
          </div>

          {comparisonData.length > 0 && (
            <div className="mt-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-right border">תאריך</th>
                    <th className="p-3 text-right border">חברה</th>
                    <th className="p-3 text-right border">שם לקוח</th>
                    <th className="p-3 text-right border">סוג מוצר</th>
                    <th className="p-3 text-right border">עמלה בפועל</th>
                    <th className="p-3 text-right border">עמלה מחושבת</th>
                    <th className="p-3 text-right border">הפרש</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border">{row.date}</td>
                      <td className="p-3 border">{row.company}</td>
                      <td className="p-3 border">{row.clientName}</td>
                      <td className="p-3 border">{row.productType}</td>
                      <td className="p-3 border">₪{row.actualCommission.toLocaleString()}</td>
                      <td className="p-3 border">₪{row.calculatedCommission.toLocaleString()}</td>
                      <td className={`p-3 border ${row.difference !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₪{row.difference.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommissionReportsComparison; 