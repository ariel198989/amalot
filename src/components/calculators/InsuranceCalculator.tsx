import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { InsuranceClient } from '../../types/calculators';
import { calculateCommissions } from '../../services/AgentAgreementService';
import { useUser } from '../../contexts/UserContext';

const InsuranceCalculator: React.FC = () => {
  const [clients, setClients] = useState<InsuranceClient[]>([]);
  const { user } = useUser();

  const fields = [
    { name: 'name', label: 'שם הלקוח', type: 'text', required: true },
    { name: 'company', label: 'יצרן', type: 'select', required: true,
      options: [
        { value: 'מגדל', label: 'מגדל' },
        { value: 'מנורה', label: 'מנורה' },
        { value: 'כלל', label: 'כלל' },
        { value: 'הראל', label: 'הראל' },
        { value: 'הפניקס', label: 'הפניקס' }
      ]
    },
    { name: 'insuranceType', label: 'סוג ביטוח', type: 'select', required: true,
      options: [
        { value: 'personal_accident', label: 'תאונות אישיות' },
        { value: 'mortgage', label: 'משכנתא' },
        { value: 'health', label: 'בריאות' },
        { value: 'critical_illness', label: 'מחלות קשות' },
        { value: 'insurance_umbrella', label: 'מטריה ביטוחית' },
        { value: 'risk', label: 'ריסק' },
        { value: 'service', label: 'שירות' },
        { value: 'disability', label: 'נכות' }
      ]
    },
    { name: 'premium', label: 'פרמיה חודשית', type: 'number', required: true },
  ];

  const handleSubmit = async (data: any) => {
    if (!user?.id) {
      alert('משתמש לא מחובר');
      return;
    }

    const premium = Number(data.premium);
    
    const commissions = await calculateCommissions(
      user.id,
      'insurance',
      data.company,
      premium,
      data.insuranceType
    );
    
    if (!commissions) {
      alert('אין הסכם פעיל עבור חברה זו');
      return;
    }

    const newClient: InsuranceClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      insuranceType: data.insuranceType,
      premium: premium,
      scopeCommission: commissions.scope_commission,
      monthlyCommission: commissions.monthly_commission,
    };

    setClients([...clients, newClient]);
  };

  const insuranceTypeLabels = {
    personal_accident: 'תאונות אישיות',
    mortgage: 'משכנתא',
    health: 'בריאות',
    critical_illness: 'מחלות קשות',
    insurance_umbrella: 'מטריה ביטוחית',
    risk: 'ריסק',
    service: 'שירות',
    disability: 'נכות'
  };

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'יצרן' },
    { key: 'insuranceType', label: 'סוג ביטוח', format: (value: string) => insuranceTypeLabels[value as keyof typeof insuranceTypeLabels] || value },
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