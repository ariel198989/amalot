import React from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { PolicyClient } from '../../types/calculators';
import { toast } from 'react-hot-toast';

const PolicyCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<PolicyClient[]>([]);

  // נתוני עמלות לפי חברה
  const companyRates = {
    'harel': { scopeRate: 7000, monthlyRate: 0.0003 },
    'migdal': { scopeRate: 7000, monthlyRate: 0.0003 },
    'clal': { scopeRate: 7000, monthlyRate: 0.0003 },
    'phoenix': { scopeRate: 7000, monthlyRate: 0.0003 },
    'menora': { scopeRate: 7000, monthlyRate: 0.0003 },
    'ayalon': { scopeRate: 7000, monthlyRate: 0.0003 }
  };

  const fields = [
    { name: 'name', label: 'שם הלקוח', type: 'text', required: true },
    { name: 'company', label: 'חברת ביטוח', type: 'select', required: true,
      options: [
        { value: 'harel', label: 'הראל' },
        { value: 'migdal', label: 'מגדל' },
        { value: 'clal', label: 'כלל' },
        { value: 'phoenix', label: 'הפניקס' },
        { value: 'menora', label: 'מנורה' },
        { value: 'ayalon', label: 'איילון' }
      ]
    },
    { name: 'depositAmount', label: 'סכום ההפקדה', type: 'number', required: true },
  ];

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברת ביטוח' },
    { key: 'depositAmount', label: 'סכום ההפקדה', format: (value: number) => value ? `₪${value.toLocaleString()}` : '0' },
    { key: 'oneTimeCommission', label: 'עמלת היקף', format: (value: number) => value ? `₪${value.toLocaleString()}` : '0' },
    { key: 'monthlyCommission', label: 'עמלת נפרעים (חודשי)', format: (value: number) => value ? `₪${value.toLocaleString()}` : '0' }
  ];

  const calculateScopeCommission = (amount: number, company: string) => {
    const { scopeRate } = companyRates[company];
    return (amount / 1000000) * scopeRate;
  };

  const calculateMonthlyCommission = (amount: number, company: string) => {
    const { monthlyRate } = companyRates[company];
    return amount * monthlyRate;
  };

  const handleSubmit = (data: any) => {
    const amount = Number(data.depositAmount) || 0;
    const scopeCommission = calculateScopeCommission(amount, data.company);
    const monthlyCommission = calculateMonthlyCommission(amount, data.company);
    
    const newClient: PolicyClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      policyType: 'regular',
      depositAmount: amount,
      totalDeposit: amount * 12,
      oneTimeCommission: scopeCommission,
      monthlyCommission: monthlyCommission
    };

    setClients([...clients, newClient]);
  };

  const handleDownload = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים להורדה');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "תאריך,שם הלקוח,חברת ביטוח,סכום ההפקדה,עמלת היקף,עמלת נפרעים חודשית\n";
    
    clients.forEach((client) => {
      const row = [
        client.date,
        client.name,
        client.company,
        client.depositAmount,
        client.oneTimeCommission,
        client.monthlyCommission
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "דוח_עמלות_פוליסת_חסכון.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים לשליחה');
      return;
    }
    
    let message = "סיכום עמלות פוליסת חסכון:\n\n";
    clients.forEach((client, index) => {
      message += `${index + 1}. ${client.name} (${client.company}):\n`;
      message += `   תאריך: ${client.date}\n`;
      message += `   סכום הפקדה: ${client.depositAmount.toLocaleString()} ₪\n`;
      message += `   עמלת היקף: ${client.oneTimeCommission.toLocaleString()} ₪\n`;
      message += `   עמלת נפרעים חודשית: ${client.monthlyCommission.toLocaleString()} ₪\n\n`;
    });
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleClear = () => {
    setClients([]);
  };

  return (
    <div>
      <CalculatorForm
        onSubmit={handleSubmit}
        fields={fields}
        title="מחשבון עמלות פוליסת חיסכון"
      />
      <ResultsTable
        data={clients}
        columns={columns}
        onDownload={handleDownload}
        onShare={handleShare}
        onClear={handleClear}
      />
    </div>
  );
};

export default PolicyCalculator; 