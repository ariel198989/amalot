import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { PolicyClient } from '../../types/calculators';
import { getCompanyRates } from '../../services/AgentAgreementService';
import { toast } from 'react-hot-toast';

const PolicyCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<PolicyClient[]>([]);
  const [companyRates, setCompanyRates] = React.useState<{ [company: string]: any }>({});

  useEffect(() => {
    loadCompanyRates();
  }, []);

  const loadCompanyRates = async () => {
    const rates = await getCompanyRates('policy');
    setCompanyRates(rates);
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
    { name: 'depositAmount', label: 'סכום ההפקדה', type: 'number', required: true }
  ];

  const columns = [
    { key: 'monthlyCommission', label: 'עמלת נפרעים (חודשי)', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'oneTimeCommission', label: 'עמלת היקף', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'totalDeposit', label: 'סה"כ הפקדה שנתית', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'depositAmount', label: 'סכום הפקדה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'policyType', label: 'סוג פוליסה' },
    { key: 'company', label: 'חברת ביטוח' },
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
    const amount = Number(data.depositAmount) || 0;
    
    // Get rates from agent agreements
    const companyRate = companyRates[data.company];
    if (!companyRate?.active) {
      toast.error('החברה לא פעילה בהסכמי הסוכן');
      return;
    }

    const scopeCommission = calculateScopeCommission(amount, companyRate.scope_rate_per_million);
    const monthlyCommission = calculateMonthlyCommission(amount, companyRate.monthly_rate);
    
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
    csvContent += "תאריך,שם הלקוח,חברת ביטוח,סכום הפקדה,סה\"כ הפקדה שנתית,עמלת היקף,עמלת היקף על הצבירה\n";
    
    clients.forEach((client) => {
      const row = [
        client.date,
        client.name,
        client.company,
        client.depositAmount,
        client.totalDeposit,
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
      message += `   עמלת היקף על הצבירה: ${client.monthlyCommission.toLocaleString()} ₪\n\n`;
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