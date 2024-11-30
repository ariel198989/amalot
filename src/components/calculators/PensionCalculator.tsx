import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { PensionClient } from '../../types/calculators';
import { calculateCommissions, getCompanyRates } from '../../services/AgentAgreementService';

const PensionCalculator: React.FC = () => {
  const [clients, setClients] = useState<PensionClient[]>([]);
  const [companyRates, setCompanyRates] = useState<{ [company: string]: any }>({});

  useEffect(() => {
    loadCompanyRates();
  }, []);

  const loadCompanyRates = async () => {
    const companies = ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס'];
    const rates: { [company: string]: any } = {};
    
    for (const company of companies) {
      const companyRate = await getCompanyRates('pension', company);
      if (companyRate) {
        rates[company] = companyRate;
      }
    }
    
    setCompanyRates(rates);
  };

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
    const accumulation = Number(data.accumulation);
    const contributionRate = Number(data.contribution);
    const annualContribution = salary * 12 * contributionRate;
    
    const commissions = await calculateCommissions('pension', data.company, annualContribution, accumulation);
    if (!commissions) {
      alert('אין הסכם פעיל עבור חברה זו');
      return;
    }

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

  const handleShare = () => {
    // TODO: Implement WhatsApp sharing
  };

  const handleClear = () => {
    setClients([]);
  };

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברה' },
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
        onShare={handleShare}
        onClear={handleClear}
      />
    </div>
  );
};

export default PensionCalculator;