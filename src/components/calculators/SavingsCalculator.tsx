import React from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { SavingsClient } from '../../types/calculators';

const SavingsCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<SavingsClient[]>([]);

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
    { name: 'amount', label: 'סכום חיסכון', type: 'number', required: true },
  ];

  const columns = [
    { key: 'actions', label: 'פעולות' },
    { key: 'totalCommission', label: "סה\"כ עמלה שנתית", format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommission', label: 'עמלה חודשית', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'amount', label: 'סכום חיסכון', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'company', label: 'חברה' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'date', label: 'תאריך' }
  ];

  const handleSubmit = (data: any) => {
    const amount = Number(data.amount);
    
    const newClient: SavingsClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      amount: amount,
      scopeCommission: amount * 0.03, // 3% עמלת היקף
      monthlyCommission: amount * 0.02 // 2% עמלה חודשית
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
        title="מחשבון עמלות חיסכון"
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

export default SavingsCalculator; 