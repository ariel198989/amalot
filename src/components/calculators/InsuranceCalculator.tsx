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
    { name: 'monthlyPremium', label: 'פרמיה חודשית', type: 'number', required: true }
  ];

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברת ביטוח' },
    { key: 'insuranceType', label: 'סוג ביטוח' },
    { key: 'monthlyPremium', label: 'פרמיה חודשית', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'oneTimeCommissionRate', label: 'אחוז עמלת היקף', format: (value: number) => `${value}%` },
    { key: 'oneTimeCommission', label: 'עמלת היקף (חד פעמית)', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommissionRate', label: 'אחוז עמלת נפרעים', format: (value: number) => `${value}%` },
    { key: 'monthlyCommission', label: 'עמלת נפרעים (חודשית)', format: (value: number) => `₪${value.toLocaleString()}` }
  ];

  const handleSubmit = (data: any) => {
    const monthlyPremium = Number(data.monthlyPremium);
    const { oneTimeRate, monthlyRate } = getCommissionRates(data.company, data.insuranceType);
    
    const oneTimeCommission = monthlyPremium * 12 * (oneTimeRate / 100);
    const monthlyCommission = monthlyPremium * (monthlyRate / 100);
    
    const newClient: InsuranceClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      insuranceType: data.insuranceType,
      monthlyPremium: monthlyPremium,
      oneTimeCommissionRate: oneTimeRate,
      oneTimeCommission: oneTimeCommission,
      monthlyCommissionRate: monthlyRate,
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
    csvContent += "תאריך,שם הלקוח,חברת ביטוח,סוג ביטוח,פרמיה חודשית,אחוז עמלת היקף,עמלת היקף,אחוז עמלת נפרעים,עמלת נפרעים\n";
    
    clients.forEach((client) => {
      const row = [
        client.date,
        client.name,
        client.company,
        client.insuranceType,
        client.monthlyPremium,
        client.oneTimeCommissionRate,
        client.oneTimeCommission,
        client.monthlyCommissionRate,
        client.monthlyCommission
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
    let totalMonthlyPremium = 0;
    let totalOneTimeCommission = 0;
    let totalMonthlyCommission = 0;

    clients.forEach((client, index) => {
      totalMonthlyPremium += client.monthlyPremium;
      totalOneTimeCommission += client.oneTimeCommission;
      totalMonthlyCommission += client.monthlyCommission;

      message += `${index + 1}. ${client.name} (${client.company}):\n`;
      message += `   סוג ביטוח: ${client.insuranceType}\n`;
      message += `   פרמיה חודשית: ${client.monthlyPremium.toLocaleString()} ₪\n`;
      message += `   עמלת היקף: ${client.oneTimeCommission.toLocaleString()} ₪\n`;
      message += `   עמלת נפרעים: ${client.monthlyCommission.toLocaleString()} ₪\n\n`;
    });

    message += `סיכום:\n`;
    message += `סך פרמיות חודשיות: ${totalMonthlyPremium.toLocaleString()} ₪\n`;
    message += `סך עמלות היקף: ${totalOneTimeCommission.toLocaleString()} ₪\n`;
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