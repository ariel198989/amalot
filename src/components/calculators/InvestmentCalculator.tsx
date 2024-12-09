import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { InvestmentClient } from '../../types/calculators';
import { calculateCommissions } from '@/services/AgentAgreementService';
import { toast } from 'react-hot-toast';

const InvestmentCalculator: React.FC = () => {
  const [clients, setClients] = useState<InvestmentClient[]>([]);
  const [companyRates, setCompanyRates] = useState<{ [company: string]: any }>({});

  useEffect(() => {
    loadCompanyRates();
  }, []);

  const loadCompanyRates = async () => {
    const companies = ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס'];
    const rates: { [company: string]: any } = {};
    
    for (const company of companies) {
      const companyRate = await getCompanyRates('savings_and_study', company);
      if (companyRate) {
        rates[company] = companyRate;
      }
    }
    
    setCompanyRates(rates);
  };

  const fields = [
    { name: 'name', label: 'שם הלקוח', type: 'text', required: true },
    { name: 'company', label: 'יצרן', type: 'select', required: true,
      options: [
        { value: 'harel', label: 'הראל' },
        { value: 'migdal', label: 'מגדל' },
        { value: 'clal', label: 'כלל' },
        { value: 'phoenix', label: 'הפניקס' },
        { value: 'more', label: 'מור' },
        { value: 'yelin', label: 'ילין לפידות' }
      ]
    },
    { name: 'amount', label: 'סכו�� הניוד', type: 'number', required: true }
  ];

  const columns = [
    { key: 'monthlyCommission', label: 'עמלת נפרעים (חודשי)', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'amount', label: 'סכום הניוד', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'company', label: 'יצרן' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'date', label: 'תאריך' }
  ];

  const calculateScopeCommission = (amount: number, scopeRate: number) => {
    return (amount / 1000000) * scopeRate;
  };

  const calculateMonthlyCommission = (amount: number, monthlyRate: number) => {
    return amount * monthlyRate;
  };

  const handleSubmit = (data: any) => {
    const amount = Number(data.amount) || 0;
    
    // Get rates from agent agreements
    const companyRate = companyRates[data.company];
    if (!companyRate?.active) {
      toast.error('החברה לא פעילה בהסכמי הסוכן');
      return;
    }

    const scopeCommission = calculateScopeCommission(amount, companyRate.scope_rate_per_million);
    const monthlyCommission = calculateMonthlyCommission(amount, companyRate.monthly_rate);
    
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
    csvContent += "תאריך,שם הלקוח,יצרן,סכום הניוד,עמלת היקף,עמלת היקף על הצבירה\n";
    
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
      toast.error('אין נתונים לשל��חה');
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