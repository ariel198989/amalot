import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPensionClient } from '../../store/calculatorsSlice';
import { RootState } from '../../store';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';

const PensionCalculator: React.FC = () => {
  const dispatch = useDispatch();
  const clients = useSelector((state: RootState) => state.calculators.pension);

  const fields = [
    { name: 'date', label: 'תאריך', type: 'date', required: true },
    { name: 'name', label: 'שם הלקוח', type: 'text', required: true },
    {
      name: 'company',
      label: 'חברת ביטוח',
      type: 'select',
      options: [
        { value: 'כלל', label: 'כלל' },
        { value: 'הראל', label: 'הראל' },
        { value: 'מגדל', label: 'מגדל' },
        { value: 'הפניקס', label: 'הפניקס' },
        { value: 'מיטב דש', label: 'מיטב דש' },
        { value: 'מור', label: 'מור' },
      ],
      required: true,
    },
    { name: 'salary', label: 'שכר חודשי', type: 'number', required: true },
    { name: 'accumulation', label: 'סכום צבירה', type: 'number', required: true },
    {
      name: 'provision',
      label: 'אחוז הפרשה',
      type: 'select',
      options: [
        { value: '18.5', label: '18.5% (6+6.5+6)' },
        { value: '19.5', label: '19.5% (7+6.5+6)' },
        { value: '20.5', label: '20.5% (7+7.5+6)' },
        { value: '20.83', label: '20.83% (6+6.5+8.33)' },
        { value: '21.83', label: '21.83% (7+6.5+8.33)' },
        { value: '22.83', label: '22.83% (7+7.5+8.33)' },
      ],
      required: true,
    },
  ];

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'company', label: 'חברת ביטוח' },
    { key: 'salary', label: 'שכר חודשי', format: (value: number) => `${value.toLocaleString()} ₪` },
    { key: 'accumulation', label: 'סכום צבירה', format: (value: number) => `${value.toLocaleString()} ₪` },
    { key: 'provision', label: 'אחוז הפרשה', format: (value: number) => `${value}%` },
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => `${value.toLocaleString()} ₪` },
    { key: 'accumulationCommission', label: 'עמלת צבירה', format: (value: number) => `${value.toLocaleString()} ₪` },
    { key: 'totalCommission', label: 'סה"כ עמלה', format: (value: number) => `${value.toLocaleString()} ₪` },
  ];

  const handleSubmit = (data: any) => {
    const salary = Number(data.salary);
    const accumulation = Number(data.accumulation);
    const provision = Number(data.provision);

    // Calculate commissions based on the rates
    const scopeCommission = salary * 12 * 0.09 * (provision / 100);
    const accumulationCommission = (accumulation / 1000000) * 3000;
    const totalCommission = scopeCommission + accumulationCommission;

    dispatch(addPensionClient({
      ...data,
      salary,
      accumulation,
      provision,
      scopeCommission,
      accumulationCommission,
      totalCommission,
    }));
  };

  const handleDownload = () => {
    // Implementation for downloading Excel file
  };

  const handleShare = () => {
    // Implementation for WhatsApp sharing
  };

  const handleClear = () => {
    // Implementation for clearing results
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