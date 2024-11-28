import React from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { InsuranceClient } from '../../types/calculators';
import { toast } from 'react-hot-toast';

const InsuranceCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<InsuranceClient[]>([]);

  const getCommissionRates = (company: string, insuranceType: string) => {
    // עמלת היקף
    const oneTimeRate = (company === 'ayalon' || company === 'migdal') ? 67 : 65;
    
    // עמלת נפרעים
    let monthlyRate = 0;
    if (company === 'ayalon') {
      switch (insuranceType) {
        case 'risk':
        case 'health':
        case 'critical_illness':
        case 'service_letter':
          monthlyRate = 20;
          break;
        case 'mortgage_risk':
          monthlyRate = 14;
          break;
        case 'disability':
          monthlyRate = 12;
          break;
      }
    } else {
      switch (insuranceType) {
        case 'risk':
        case 'health':
        case 'critical_illness':
        case 'service_letter':
          monthlyRate = 20;
          break;
        case 'mortgage_risk':
          monthlyRate = 17;
          break;
        case 'disability':
          monthlyRate = 12;
          break;
      }
    }
    
    return { oneTimeRate, monthlyRate };
  };

  const fields = [
    { name: 'name', label: 'שם הלקוח', type: 'text', required: true },
    { name: 'company', label: 'חברת ביטוח', type: 'select', required: true,
      options: [
        { value: 'ayalon', label: 'איילון' },
        { value: 'harel', label: 'הראל' },
        { value: 'migdal', label: 'מגדל' },
        { value: 'menora', label: 'מנורה' },
        { value: 'clal', label: 'כלל' },
        { value: 'phoenix', label: 'הפניקס' },
        { value: 'hachshara', label: 'הכשרה' }
      ]
    },
    { name: 'insuranceType', label: 'סוג ביטוח', type: 'select', required: true,
      options: [
        { value: 'risk', label: 'ריסק' },
        { value: 'mortgage_risk', label: 'ריסק למשכנתא' },
        { value: 'health', label: 'בריאות' },
        { value: 'critical_illness', label: 'מחלות קשות' },
        { value: 'service_letter', label: 'כתבי שירות' },
        { value: 'disability', label: 'אובדן כושר עבודה' }
      ]
    },
    { name: 'premium', label: 'פרמיה חודשית', type: 'number', required: true }
  ];

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברת ביטוח' },
    { key: 'insuranceType', label: 'סוג ביטוח' },
    { key: 'premium', label: 'פרמיה חודשית', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'scopeRate', label: 'אחוז עמלת היקף' },
    { key: 'scopeCommission', label: 'עמלת היקף (חד פעמית)', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyRate', label: 'אחוז עמלת נפרעים' },
    { key: 'monthlyCommission', label: 'עמלת נפרעים (חודשי)', format: (value: number) => `₪${value.toLocaleString()}` }
  ];

  const handleSubmit = (data: any) => {
    const premium = Number(data.premium);
    const { oneTimeRate, monthlyRate } = getCommissionRates(data.company, data.insuranceType);
    
    const scopeCommission = premium * 12 * (oneTimeRate / 100);
    const monthlyCommission = premium * (monthlyRate / 100);
    
    const newClient: InsuranceClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      insuranceType: data.insuranceType,
      premium: premium,
      scopeRate: oneTimeRate,
      scopeCommission: scopeCommission,
      monthlyRate: monthlyRate,
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
    csvContent += "תאריך,פרמיה חודשית,אחוז עמלת היקף,עמלת היקף,אחוז עמלת נפרעים,עמלת נפרעים חודשית,שם הלקוח,חברת ביטוח,סוג ביטוח\n";
    
    clients.forEach((client) => {
      const row = [
        client.date,
        client.premium,
        client.scopeRate,
        client.scopeCommission,
        client.monthlyRate,
        client.monthlyCommission,
        client.name,
        client.company,
        client.insuranceType
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "דוח_עמלות_ביטוח.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים לשליחה');
      return;
    }
    
    let message = "סיכום עמלות ביטוח:\n\n";
    let totalPremium = 0;
    let totalScopeCommission = 0;
    let totalMonthlyCommission = 0;

    clients.forEach((client, index) => {
      totalPremium += client.premium;
      totalScopeCommission += client.scopeCommission;
      totalMonthlyCommission += client.monthlyCommission;

      message += `${index + 1}. ${client.name} (${client.company}):\n`;
      message += `   סוג ביטוח: ${client.insuranceType}\n`;
      message += `   פרמיה חודשית: ${client.premium.toLocaleString()} ₪\n`;
      message += `   עמלת היקף: ${client.scopeCommission.toLocaleString()} ₪\n`;
      message += `   עמלת נפרעים: ${client.monthlyCommission.toLocaleString()} ₪\n\n`;
    });

    message += `סיכום:\n`;
    message += `סך פרמיות חודשיות: ${totalPremium.toLocaleString()} ₪\n`;
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
        title="מחשבון עמלות ביטוח"
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

export default InsuranceCalculator;