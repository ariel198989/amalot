import React from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { InvestmentClient } from '../../types/calculators';
import { toast } from 'react-hot-toast';

const InvestmentCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<InvestmentClient[]>([]);

  // נתוני עמלות לפי חברה
  const companyRates = {
    'harel': { scopeRate: 6000, monthlyRate: 0.00025 },
    'migdal': { scopeRate: 7000, monthlyRate: 0.00025 },
    'clal': { scopeRate: 7000, monthlyRate: 0.00025 },
    'phoenix': { scopeRate: 6500, monthlyRate: 0.00025 },
    'more': { scopeRate: 4000, monthlyRate: 0.00025 },
    'yelin': { scopeRate: 4000, monthlyRate: 0.00025 }
  };

  const fields = [
    { name: 'name', label: 'שם הלקוח', type: 'text', required: true },
    { name: 'company', label: 'חברת ניהול', type: 'select', required: true,
      options: [
        { value: 'harel', label: 'הראל' },
        { value: 'migdal', label: 'מגדל' },
        { value: 'clal', label: 'כלל' },
        { value: 'phoenix', label: 'הפניקס' },
        { value: 'more', label: 'מור' },
        { value: 'yelin', label: 'ילין לפידות' }
      ]
    },
    { name: 'amount', label: 'סכום הניוד', type: 'number', required: true },
  ];

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברת ניהול' },
    { key: 'amount', label: 'סכום הניוד', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommission', label: 'עמלת נפרעים (חודשי)', format: (value: number) => `₪${value.toLocaleString()}` }
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
    const amount = Number(data.amount);
    const scopeCommission = calculateScopeCommission(amount, data.company);
    const monthlyCommission = calculateMonthlyCommission(amount, data.company);
    
    const newClient: InvestmentClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      amount: amount,
      scopeCommission: scopeCommission,
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
    csvContent += "תאריך,שם הלקוח,חברת ניהול,סכום הניוד,עמלת היקף,עמלת נפרעים חודשית\n";
    
    clients.forEach((client) => {
      const row = [
        client.date,
        client.name,
        client.company,
        client.amount,
        client.scopeCommission,
        client.monthlyCommission
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "עמלות_גמל_והשתלמות.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים לשליחה');
      return;
    }
    
    let message = "סיכום עמלות גמל והשתלמות:\n\n";
    clients.forEach((client, index) => {
      message += `${index + 1}. ${client.name} (${client.company}) - ${client.date}:\n`;
      message += `   סכום ניוד: ${client.amount.toLocaleString()} ₪\n`;
      message += `   עמלת היקף: ${client.scopeCommission.toLocaleString()} ₪\n`;
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
        title="מחשבון עמלות גמל והשתלמות"
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

export default InvestmentCalculator; 