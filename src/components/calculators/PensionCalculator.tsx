import React from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { PensionClient } from '../../types/calculators';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const PensionCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<PensionClient[]>([]);

  // עדכון נתוני העמלות לפי חברה - ערכים מציאותיים יותר
  const companyRates = {
    'clal': { scope: 0.07, accumulation: 2500 },    // 7% מהיקף, 2500 ש"ח למיליון צבירה
    'harel': { scope: 0.07, accumulation: 2000 },   // 7% מהיקף, 2000 ש"ח למיליון צבירה
    'migdal': { scope: 0.065, accumulation: 2200 }, // 6.5% מהיקף, 2200 ש"ח למיליון צבירה
    'phoenix': { scope: 0.075, accumulation: 2300 }, // 7.5% מהיקף, 2300 ש"ח למיליון צבירה
    'meitav': { scope: 0.07, accumulation: 2100 },  // 7% מהיקף, 2100 ש"ח למיליון צבירה
    'more': { scope: 0.068, accumulation: 2000 }    // 6.8% מהיקף, 2000 ש"ח למיליון צבירה
  };

  const fields = [
    { name: 'name', label: 'שם הלקוח', type: 'text', required: true },
    { name: 'company', label: 'חברת ביטוח/בית השקעות', type: 'select', required: true,
      options: [
        { value: 'clal', label: 'כלל' },
        { value: 'harel', label: 'הראל' },
        { value: 'migdal', label: 'מגדל' },
        { value: 'phoenix', label: 'הפניקס' },
        { value: 'meitav', label: 'מיטב דש' },
        { value: 'more', label: 'מור' }
      ]
    },
    { name: 'salary', label: 'שכר חודשי', type: 'number', required: true },
    { name: 'accumulation', label: 'סכום צבירה', type: 'number', required: true },
    { name: 'provision', label: 'אחוז הפרשה', type: 'select', required: true,
      options: [
        { value: '18.5', label: '18.5% (6+6.5+6)' },
        { value: '19.5', label: '19.5% (7+6.5+6)' },
        { value: '20.5', label: '20.5% (7+7.5+6)' },
        { value: '20.83', label: '20.83% (6+6.5+8.33)' },
        { value: '21.83', label: '21.83% (7+6.5+8.33)' },
        { value: '22.83', label: '22.83% (7+7.5+8.33)' }
      ]
    }
  ];

  const columns = [
    { key: 'actions', label: 'פעולות' },
    { key: 'totalCommission', label: "סה\"כ עמלה שנתית", format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'accumulationCommission', label: 'עמלה מצבירה שנתית', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'scopeCommission', label: 'עמלה מהפקדה שנתית', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'provision', label: 'אחוז הפרשה', format: (value: number) => `${value}%` },
    { key: 'accumulation', label: 'סכום צבירה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'salary', label: 'שכר חודשי', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'company', label: 'חברת ביטוח/בית השקעות' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'date', label: 'תאריך' }
  ];

  const handleSubmit = (data: any) => {
    const salary = Number(data.salary);
    const accumulation = Number(data.accumulation);
    const provision = Number(data.provision) / 100;
    const rates = companyRates[data.company];

    // חישוב העמלות עם הערכים החדשים
    const scopeCommission = salary * 12 * rates.scope * provision;  // עמלת היקף שנתית
    const accumulationCommission = (accumulation / 1000000) * rates.accumulation;  // עמלת צבירה שנתית
    const totalCommission = scopeCommission + accumulationCommission;
    
    const newClient: PensionClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      salary: salary,
      accumulation: accumulation,
      provision: Number(data.provision),
      scopeCommission: Math.round(scopeCommission * 100) / 100,
      accumulationCommission: Math.round(accumulationCommission * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100
    };

    setClients([...clients, newClient]);
  };

  const handleDownload = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים להורדה');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "תאריך,שם לקוח,חברה,שכר חודשי,סכום צבירה,אחוז הפרשה,עמלת היקף,עמלת צבירה,סה\"כ עמלה\n";
    
    clients.forEach((client) => {
      const row = [
        client.date,
        client.name,
        client.company,
        client.salary,
        client.accumulation,
        client.provision + '%',
        client.scopeCommission,
        client.accumulationCommission,
        client.totalCommission
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "דוח_עמלות_פנסיה.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים לשליחה');
      return;
    }
    
    const lastClient = clients[clients.length - 1];
    let message = `דוח עמלות פנסיה:\n`;
    message += `תאריך: ${lastClient.date}\n`;
    message += `שם לקוח: ${lastClient.name}\n`;
    message += `חברה: ${lastClient.company}\n`;
    message += `שכר חודשי: ${lastClient.salary.toLocaleString()} ₪\n`;
    message += `סכום צבירה: ${lastClient.accumulation.toLocaleString()} ₪\n`;
    message += `אחוז הפרשה: ${lastClient.provision}%\n`;
    message += `עמלת היקף שנתית: ${lastClient.scopeCommission.toLocaleString()} ₪\n`;
    message += `עמלה מצבירה: ${lastClient.accumulationCommission.toLocaleString()} ₪\n`;
    message += `סה"כ עמלה: ${lastClient.totalCommission.toLocaleString()} ₪\n`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleClear = () => {
    setClients([]);
  };

  const handleDeleteRow = async (index: number, rowData: any) => {
    try {
      // מחיקה מהדאטהבייס
      const { error } = await supabase
        .from('pension_sales')
        .delete()
        .eq('date', rowData.date)
        .eq('client_name', rowData.name)
        .eq('company', rowData.company);

      if (error) throw error;

      // מחיקה מהסטייט המקומי
      setClients(prevClients => prevClients.filter((_, i) => i !== index));
      toast.success('הדוח נמחק בהצלחה');

    } catch (error: any) {
      console.error('Error deleting row:', error);
      toast.error('אירעה שגיאה במחיקת הדוח');
    }
  };

  return (
    <div>
      <CalculatorForm
        onSubmit={handleSubmit}
        fields={fields}
        title="מחשבון עמלות פנסיה"
      />
      <ResultsTable
        data={clients}
        columns={columns}
        onDownload={handleDownload}
        onShare={handleShare}
        onClear={handleClear}
        onDeleteRow={handleDeleteRow}
      />
    </div>
  );
};

export default PensionCalculator;