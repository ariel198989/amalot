import React from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { InvestmentClient } from '../../types/calculators';
import { toast } from 'react-hot-toast';

const InvestmentCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<InvestmentClient[]>([]);

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
    { name: 'scopeRate', label: 'עמלת היקף למיליון', type: 'number', required: true, defaultValue: 6000 },
    { name: 'monthlyRate', label: 'אחוז עמלת נפרעים', type: 'number', required: true, defaultValue: 0.025, step: 0.001 }
  ];

  const columns = [
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברת ניהול' },
    { key: 'date', label: 'תאריך' },
    { key: 'amount', label: 'סכום הניוד', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommission', label: 'עמלת נפרעים (חודשי)', format: (value: number) => `₪${value.toLocaleString()}` }
  ];

  const calculateScopeCommission = (amount: number, scopeRate: number) => {
    return (amount / 1000000) * scopeRate;
  };

  const calculateMonthlyCommission = (amount: number, monthlyRate: number) => {
    return amount * (monthlyRate / 100);
  };

  const handleSubmit = (data: any) => {
    const amount = Number(data.amount) || 0;
    const scopeRate = Number(data.scopeRate) || 6000;
    const monthlyRate = Number(data.monthlyRate) || 0.025;
    
    const scopeCommission = calculateScopeCommission(amount, scopeRate);
    const monthlyCommission = calculateMonthlyCommission(amount, monthlyRate);
    
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
    csvContent += "שם הלקוח,חברת ניהול,תאריך,סכום הניוד,עמלת היקף,עמלת נפרעים חודשית\n";
    
    clients.forEach((client) => {
      const row = [
        client.name,
        client.company,
        client.date,
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
    let totalAmount = 0;
    let totalScopeCommission = 0;
    let totalMonthlyCommission = 0;

    clients.forEach((client, index) => {
      totalAmount += client.amount;
      totalScopeCommission += client.scopeCommission;
      totalMonthlyCommission += client.monthlyCommission;

      message += `${index + 1}. ${client.name} (${client.company}):\n`;
      message += `   תאריך: ${client.date}\n`;
      message += `   סכום ניוד: ${client.amount.toLocaleString()} ₪\n`;
      message += `   עמלת היקף: ${client.scopeCommission.toLocaleString()} ₪\n`;
      message += `   עמלת נפרעים: ${client.monthlyCommission.toLocaleString()} ₪\n\n`;
    });

    message += "\nסיכום:\n";
    message += `סך ניודים: ${totalAmount.toLocaleString()} ₪\n`;
    message += `סך עמלות היקף: ${totalScopeCommission.toLocaleString()} ₪\n`;
    message += `סך עמלות נפרעים: ${totalMonthlyCommission.toLocaleString()} ₪\n`;
    
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