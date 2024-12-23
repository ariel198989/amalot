import { toast } from 'react-hot-toast';
import { reportService } from '@/services/reportService';
import { saveSaleToDatabase } from '../../services/databaseService';

export const handleSaleComplete = async (saleData: any) => {
  try {
    // שמירת המכירה בדאטאבייס
    const { error: saleError } = await saveSaleToDatabase(saleData);
    if (saleError) throw saleError;

    // עדכון הביצועים
    const result = await reportService.updatePerformanceMetrics(saleData);
    if (!result?.success) throw result?.error || new Error('שגיאה בעדכון הביצועים');

    toast.success('המכירה נשמרה והביצועים עודכנו בהצלחה');
  } catch (error) {
    console.error('Error completing sale:', error);
    toast.error(error instanceof Error ? error.message : 'שגיאה בשמירת המכירה');
  }
}; 