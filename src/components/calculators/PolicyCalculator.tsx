import React from 'react';
import CalculatorForm from './CalculatorForm';
import ResultsTable from './ResultsTable';
import { PolicyClient } from '../../types/calculators';
import { calculateCommissions } from '@/services/AgentAgreementService';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

const PolicyCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<PolicyClient[]>([]);

  const fields = [
    { name: 'name', label: 'שם הלקוח', type: 'text', required: true },
    { name: 'company', label: 'יצרן', type: 'select', required: true,
      options: [
        { value: 'harel', label: 'הראל' },
        { value: 'migdal', label: 'מגדל' },
        { value: 'clal', label: 'כלל' },
        { value: 'phoenix', label: 'הפניקס' },
        { value: 'menora', label: 'מנורה' },
        { value: 'ayalon', label: 'איילון' }
      ]
    },
    { name: 'amount', label: 'סכום ההפקדה', type: 'number', required: true }
  ];

  const columns = [
    { key: 'monthlyCommission', label: 'עמלת נפרעים (חודשי)', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'scopeCommission', label: 'עמלת היקף', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'amount', label: 'סכום הפקדה', format: (value: number) => `₪${value.toLocaleString()}` },
    { key: 'company', label: 'יצרן' },
    { key: 'name', label: 'שם הלקוח' },
    { key: 'date', label: 'תאריך' }
  ];

  const handleSubmit = async (data: any) => {
    const amount = Number(data.amount) || 0;
    
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('משתמש לא מחובר');
      return;
    }

    const commissions = await calculateCommissions(
      user.id,
      'policy',
      data.company,
      amount,
      '1', // Default contribution rate for policies
      0 // No accumulation for policies
    );
    
    if (!commissions) {
      toast.error('החברה לא פעילה בהסכמי הסוכן');
      return;
    }

    const newClient: PolicyClient = {
      date: new Date().toLocaleDateString('he-IL'),
      name: data.name,
      company: data.company,
      amount: amount,
      scopeCommission: commissions.scope_commission,
      monthlyCommission: commissions.monthly_commission
    };

    setClients([...clients, newClient]);
  };

  const handleDownload = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים להורדה');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "תאריך,שם הלקוח,יצרן,סכום הפקדה,עמלת היקף,עמלת נפרעים\n";
    
    clients.forEach((client) => {
      const row = [
        client.date,
        client.name,
        client.company,
        client.amount,
        client.scopeCommission,
        client.monthlyCommission
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "דוח_עמלות_פוליסת_חסכון.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (clients.length === 0) {
      toast.error('אין נתונים לשליחה');
      return;
    }
    
    let message = "סיכום עמלות פוליסת חסכון:\n\n";
    clients.forEach((client, index) => {
      message += `${index + 1}. ${client.name} (${client.company}):\n`;
      message += `   תאריך: ${client.date}\n`;
      message += `   סכום הפקדה: ${client.amount.toLocaleString()} ₪\n`;
      message += `   עמלת היקף: ${client.scopeCommission.toLocaleString()} ₪\n`;
      message += `   עמלת נפרעים: ${client.monthlyCommission.toLocaleString()} ₪\n\n`;
    });
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
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
        onShare={() => {}}
        onClear={() => setClients([])}
        customerName={clients[0]?.name || ''}
      />
    </div>
  );
};

export default PolicyCalculator;