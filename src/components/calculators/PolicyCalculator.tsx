import React from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { PolicyClient } from '../../types/calculators';

const PolicyCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<PolicyClient[]>([]);

  const fields = [
    { name: 'name', label: 'שם הלקוח', type: 'text', required: true },
    { name: 'company', label: 'חברה', type: 'select', required: true,
      options: [
        { value: 'migdal', label: 'מגדל' },
        { value: 'menora', label: 'מנורה' },
        { value: 'clal', label: 'כלל' },
        { value: 'harel', label: 'הראל' }
      ]
    },
    { name: 'policyType', label: 'סוג פוליסה', type: 'select', required: true,
      options: [
        { value: 'best_invest', label: 'בסט אינווסט' },
        { value: 'top_finance', label: 'טופ פיננסים' },
        { value: 'more_savings', label: 'מור חיסכון' }
      ]
    },
    { name: 'depositAmount', label: 'סכום הפקדה', type: 'number', required: true },
    { name: 'depositPeriod', label: 'תקופת הפקדה (בשנים)', type: 'number', required: true },
  ];

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברה' },
    { key: 'policyType', label: 'סוג פוליסה' },
    { key: 'depositAmount', label: 'סכום הפקדה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'totalDeposit', label: 'סה"כ הפקדות', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'oneTimeCommission', label: 'עמלה חד פעמית', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommission', label: 'עמלה חודשית', format: (value: number) => `₪${value.toLocaleString()}` }
  ];

  const handleSubmit = (data: any) => {
    const depositAmount = Number(data.depositAmount);
    const depositPeriod = Number(data.depositPeriod);
    const totalDeposit = depositAmount * 12 * depositPeriod;
    
    const newClient: PolicyClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      policyType: data.policyType,
      depositAmount: depositAmount,
      totalDeposit: totalDeposit,
      oneTimeCommission: totalDeposit * 0.025, // 2.5% עמלה חד פעמית
      monthlyCommission: depositAmount * 0.003 // 0.3% עמלה חודשית
    };
    setClients([...clients, newClient]);
  };

  const handleDownload = () => {
    // TODO: Implement Excel export
  };

  const handleShare = () => {
    // TODO: Implement WhatsApp sharing
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