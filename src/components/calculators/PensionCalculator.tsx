import React from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { PensionClient } from '../../types/calculators';

const PensionCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<PensionClient[]>([]);

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
    { name: 'salary', label: 'שכר ברוטו', type: 'number', required: true },
    { name: 'accumulation', label: 'אחוז צבירה', type: 'number', required: true },
    { name: 'provision', label: 'הפרשות מעסיק', type: 'number', required: true }
  ];

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברה' },
    { key: 'salary', label: 'שכר ברוטו', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'accumulation', label: 'אחוז צבירה', format: (value: number) => `${value}%` },
    { key: 'provision', label: 'הפרשות מעסיק', format: (value: number) => `${value}%` },
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'accumulationCommission', label: 'עמלת צבירה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'totalCommission', label: 'סה"כ עמלות', format: (value: number) => `₪${value.toLocaleString()}` }
  ];

  const handleSubmit = (data: any) => {
    const salary = Number(data.salary);
    const accumulation = Number(data.accumulation);
    const provision = Number(data.provision);
    
    const scopeCommission = salary * 0.03; // 3% עמלת היקף
    const accumulationCommission = (salary * (accumulation + provision) / 100) * 0.02; // 2% עמלת צבירה
    const totalCommission = scopeCommission + accumulationCommission;

    const newClient: PensionClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      salary: salary,
      accumulation: accumulation,
      provision: provision,
      scopeCommission: scopeCommission,
      accumulationCommission: accumulationCommission,
      totalCommission: totalCommission
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
        title="מחשבון עמלות פנסיה"
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

export default PensionCalculator;