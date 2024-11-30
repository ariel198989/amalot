import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { InsuranceClient } from '../../types/calculators';
import { calculateCommissions } from '../../services/AgentAgreementService';

const InsuranceCalculator: React.FC = () => {
  const [clients, setClients] = useState<InsuranceClient[]>([]);

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
    { name: 'premium', label: 'פרמיה חודשית', type: 'number', required: true },
  ];

  const handleSubmit = async (data: any) => {
    const premium = Number(data.premium);
    
    const commissions = await calculateCommissions('insurance', data.company, premium);
    if (!commissions) {
      // אם אין הסכם פעיל לחברה זו
      alert('אין הסכם פעיל עבור חברה זו');
      return;
    }

    const newClient: InsuranceClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      premium: premium,
      scopeCommission: commissions.scope_commission,
      monthlyCommission: commissions.monthly_commission,
    };

    setClients([...clients, newClient]);
  };

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברה' },
    { key: 'premium', label: 'פרמיה חודשית', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommission', label: 'נפרעים', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'actions', label: 'פעולות' }
  ];

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
      />
    </div>
  );
};

export default InsuranceCalculator;