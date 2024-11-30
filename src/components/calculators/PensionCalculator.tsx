import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { PensionClient } from '../../types/calculators';
import { calculateCommissions } from '../../services/AgentAgreementService';

const PensionCalculator: React.FC = () => {
  const [clients, setClients] = useState<PensionClient[]>([]);

  const fields = [
    { name: 'name', label: 'שם הלקוח', type: 'text', required: true },
    { name: 'company', label: 'חברה', type: 'select', required: true,
      options: [
        { value: 'מגדל', label: 'מגדל' },
        { value: 'מנורה', label: 'מנורה' },
        { value: 'כלל', label: 'כלל' },
        { value: 'הראל', label: 'הראל' },
        { value: 'הפניקס', label: 'הפניקס' }
      ]
    },
    { name: 'salary', label: 'שכר', type: 'number', required: true },
  ];

  const handleSubmit = async (data: any) => {
    const salary = Number(data.salary);
    const annualSalary = salary * 12;
    
    const commissions = await calculateCommissions('pension', data.company, annualSalary);
    if (!commissions) {
      alert('אין הסכם פעיל עבור חברה זו');
      return;
    }

    const newClient: PensionClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      salary: salary,
      scopeCommission: commissions.scope_commission,
      monthlyCommission: commissions.monthly_commission,
    };

    setClients([...clients, newClient]);
  };

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברה' },
    { key: 'salary', label: 'שכר', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'scopeCommission', label: 'עמלת היקף על הפקדה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommission', label: 'עמלת היקף על הצבירה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'actions', label: 'פעולות' }
  ];

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
      />
    </div>
  );
};

export default PensionCalculator;