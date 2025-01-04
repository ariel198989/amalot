import React, { useState } from 'react';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { PensionClient } from '../../types/calculators';
import { calculateCommissions } from '@/services/AgentAgreementService';
import { supabase } from '@/lib/supabase';

const PensionCalculator: React.FC = () => {
  const [clients, setClients] = useState<PensionClient[]>([]);

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
    { name: 'salary', label: 'שכר', type: 'number', required: true },
    { name: 'accumulation', label: 'צבירה', type: 'number', required: true },
    { name: 'contribution', label: 'אחוז הפרשה', type: 'select', required: true,
      options: [
        { value: '0.2283', label: '22.83%' },
        { value: '0.2183', label: '21.83%' },
        { value: '0.2083', label: '20.83%' },
        { value: '0.1950', label: '19.50%' },
        { value: '0.1850', label: '18.50%' }
      ]
    }
  ];

  const handleSubmit = async (data: any) => {
    const salary = Number(data.salary);
    const accumulation = Number(data.accumulation || 0);
    const contributionRate = Number(data.contribution || 0.2083);
    
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('משתמש לא מחובר');
      return;
    }

    console.log('Submitting pension calculation:', {
      salary,
      accumulation,
      contributionRate,
      company: data.company
    });

    const commissions = await calculateCommissions(
      user.id,
      'pension', 
      data.company, 
      salary,
      String(contributionRate),  // Convert to string as expected by the function
      accumulation  // Pass the accumulation amount
    );
    
    if (!commissions) {
      alert('אין הסכם פעיל עבור חברה זו');
      return;
    }

    console.log('Received commission calculation:', commissions);

    const newClient: PensionClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      salary: salary,
      accumulation: accumulation,
      scopeCommission: commissions.scope_commission,
      monthlyCommission: commissions.monthly_commission,
    };

    setClients([...clients, newClient]);
  };

  const handleDownload = () => {
    // TODO: Implement Excel export
  };

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'יצרן' },
    { key: 'salary', label: 'שכר', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'accumulation', label: 'צבירה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'scopeCommission', label: 'עמלת היקף על הפקדה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'monthlyCommission', label: 'עמלת היקף על הצבירה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'actions', label: 'פעולות' }
  ];

  return (
    <div dir="rtl">
      <CalculatorForm
        onSubmit={handleSubmit}
        fields={fields}
        title="מחשבון עמלות פנסיה"
      />
      <ResultsTable
        data={clients}
        columns={columns}
        onDownload={handleDownload}
        onShare={() => {}}
        onClear={() => setClients([])}
        customerName={clients[0]?.name || ''}
      />
    </div>
  );
};

export default PensionCalculator;