import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ResultsTable from './ResultsTable';
import { toast } from 'react-hot-toast';

interface InsuranceClient {
  id: string;
  date: string;
  name: string;
  company: string;
  insuranceType: string;
  premium: number;
  commission: number;
}

const InsuranceCalculator: React.FC = () => {
  const [clients, setClients] = useState<InsuranceClient[]>([]);

  const handleDownload = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים להורדה');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "תאריך,שם הלקוח,חברה,סוג ביטוח,פרמיה,עמלה\n";
    
    clients.forEach((client) => {
      const row = [
        client.date,
        client.name,
        client.company,
        client.insuranceType,
        client.premium,
        client.commission
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "דוח_ביטוח.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    // Implement share functionality
    toast.error('פונקציונליות השיתוף עדיין לא זמינה');
  };

  const handleClear = () => {
    setClients([]);
    toast.success('הנתונים נמחקו בהצלחה');
  };

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם לקוח' },
    { key: 'company', label: 'חברה' },
    { 
      key: 'insuranceType', 
      label: 'סוג ביטוח',
      format: (value: string) => {
        switch (value) {
          case 'life': return 'ביטוח חיים';
          case 'health': return 'ביטוח בריאות';
          case 'disability': return 'ביטוח נכות';
          default: return value;
        }
      }
    },
    { 
      key: 'premium', 
      label: 'פרמיה',
      format: (value: number) => `₪${value.toLocaleString()}`
    },
    { 
      key: 'commission', 
      label: 'עמלה',
      format: (value: number) => `₪${value.toLocaleString()}`
    }
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">מחשבון ביטוח</h2>
        </CardHeader>
        <CardContent>
          {/* Add your insurance calculator form here */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">תוצאות</h3>
        </CardHeader>
        <CardContent>
          <ResultsTable
            data={clients}
            columns={columns}
            onDownload={handleDownload}
            onShare={handleShare}
            onClear={handleClear}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InsuranceCalculator;