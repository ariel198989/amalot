import React from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { InsuranceClient } from '../../types/calculators';

const InsuranceCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<InsuranceClient[]>([]);

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
    { name: 'insuranceType', label: 'סוג ביטוח', type: 'select', required: true,
      options: [
        { value: 'life', label: 'ביטוח חיים' },
        { value: 'health', label: 'ביטוח בריאות' },
        { value: 'disability', label: 'ביטוח אובדן כושר עבודה' }
      ]
    },
    { name: 'monthlyPremium', label: 'פרמיה חודשית', type: 'number', required: true },
  ];

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברה' },
    { key: 'insuranceType', label: 'סוג ביטוח' },
    { key: 'monthlyPremium', label: 'פרמיה חודשית', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'oneTimeCommission', label: 'עמלה חד פעמית', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommission', label: 'עמלה חודשית', format: (value: number) => `₪${value.toLocaleString()}` }
  ];

  const handleSubmit = (data: any) => {
    const newClient: InsuranceClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      insuranceType: data.insuranceType,
      monthlyPremium: Number(data.monthlyPremium),
      oneTimeCommissionRate: 0.4, // Example rate
      oneTimeCommission: Number(data.monthlyPremium) * 12 * 0.4, // Example calculation
      monthlyCommissionRate: 0.1, // Example rate
      monthlyCommission: Number(data.monthlyPremium) * 0.1 // Example calculation
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