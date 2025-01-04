import { useState } from 'react';
import { motion } from 'framer-motion';
import ResultsTable from '../calculators/ResultsTable';
import { CustomerJourneyClient } from '@/types/calculators';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const CustomerJourneyComponent = () => {
  const [clients, setClients] = useState<CustomerJourneyClient[]>([]);

  const columns = [
    { key: 'date', label: 'תאריך' },
    { key: 'name', label: 'שם לקוח' },
    { key: 'type', label: 'סוג מוצר' },
    { key: 'amount', label: 'סכום', format: (value: number) => `₪${value.toLocaleString()}` }
  ];

  const handleDownload = () => {
    // יישום הורדת הקובץ
  };

  return (
    <div>
      <motion.div variants={staggerContainer}>
        <ResultsTable
          data={clients}
          columns={columns}
          onDownload={handleDownload}
          onShare={() => {}}
          onClear={() => setClients([])}
          customerName={clients[0]?.name || ''}
        />
      </motion.div>
    </div>
  );
};

export default CustomerJourneyComponent; 