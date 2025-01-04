import React, { useState } from 'react';
import { useSalesTargets } from '@/contexts/SalesTargetsContext';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface JourneyFormData {
  productType: string;
  amount: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  id_number: string;
}

// הוספת פונט עברי
const heeboFont = `
  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
`;

export function CreateJourney() {
  const { user } = useUser();
  const { updatePerformance } = useSalesTargets();
  const [formData, setFormData] = useState<JourneyFormData>({
    productType: '',
    amount: 0,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
    id_number: ''
  });
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const createOrUpdateClient = async () => {
    try {
      if (!user) return null;

      // בדיקה אם הלקוח קיים לפי תעודת זהות
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .eq('id_number', formData.id_number)
        .single();

      if (existingClient) {
        // עדכון לקוח קיים
        const { data: updatedClient, error: updateError } = await supabase
          .from('clients')
          .update({
            last_contact: new Date().toISOString(),
            status: 'active'
          })
          .eq('id', existingClient.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedClient;
      } else {
        // יצירת לקוח חדש
        const nameParts = formData.clientName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: newClient, error: insertError } = await supabase
          .from('clients')
          .insert({
            user_id: user.id,
            first_name: firstName,
            last_name: lastName,
            phone: formData.clientPhone,
            email: formData.clientEmail,
            id_number: formData.id_number,
            status: 'active',
            last_contact: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newClient;
      }
    } catch (error) {
      console.error('Error in createOrUpdateClient:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      // וידוא שכל השדות החובה מלאים
      if (!formData.clientName || !formData.clientPhone || !formData.id_number || !formData.productType || formData.amount <= 0) {
        toast.error('נא למלא את כל שדות החובה');
        return;
      }

      // יצירה או עדכון של הלקוח
      const client = await createOrUpdateClient();
      if (!client) {
        toast.error('שגיאה בעדכון פרטי הלקוח');
        return;
      }

      // שדכון הביצועים
      const currentDate = new Date();
      const date = { 
        month: currentDate.getMonth() + 1, 
        year: currentDate.getFullYear() 
      };
      
      // עדכון הביצועים בהתאם לסוג המוצר
      switch (formData.productType) {
        case 'pension':
        case 'pension-transfer':
          await updatePerformance('pension-transfer', date.month, formData.amount);
          break;
        case 'risk':
          await updatePerformance('risks', date.month, formData.amount);
          break;
        case 'finance-transfer':
          await updatePerformance('finance-transfer', date.month, formData.amount);
          break;
        case 'regular-deposit':
          await updatePerformance('regular-deposit', date.month, formData.amount);
          break;
        case 'financial-planning':
          await updatePerformance('financial-planning', date.month, formData.amount);
          break;
      }

      toast.success('המכירה נוספה בהצלחה');
      
      // איפוס הטופס
      setFormData({
        productType: '',
        amount: 0,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        notes: '',
        id_number: ''
      });

    } catch (error) {
      console.error('Error creating journey:', error);
      toast.error('שגיאה ביצירת מסע הלקוח');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // הגדרת פונט עברי
      doc.addFileToVFS('Heebo.ttf', heeboFont);
      doc.addFont('Heebo.ttf', 'Heebo', 'normal');
      doc.setFont('Heebo');
      
      // כותרת
      doc.setFontSize(20);
      doc.text('סיכום מכירה', 105, 20, { align: 'center' });
      
      // תאריך
      doc.setFontSize(12);
      const currentDate = new Date().toLocaleDateString('he-IL');
      doc.text(`תאריך: ${currentDate}`, 195, 30, { align: 'right' });
      
      // פרטי לקוח
      doc.setFontSize(14);
      doc.text('פרטי לקוח:', 195, 45, { align: 'right' });
      
      const customerDetails = [
        ['שם מלא:', formData.clientName],
        ['תעודת זהות:', formData.id_number],
        ['טלפון:', formData.clientPhone],
        ['אימייל:', formData.clientEmail]
      ];
      
      // טבלת פרטי לקוח
      (doc as any).autoTable({
        startY: 50,
        head: [],
        body: customerDetails,
        theme: 'plain',
        styles: {
          font: 'Heebo',
          fontSize: 12,
          cellPadding: 5
        },
        columnStyles: {
          0: { halign: 'right', cellWidth: 40 },
          1: { halign: 'right', cellWidth: 100 }
        },
        margin: { right: 15 }
      });
      
      // פרטי מכירה
      doc.text('פרטי מכירה:', 195, (doc as any).lastAutoTable.finalY + 20, { align: 'right' });
      
      const productTypeMap: { [key: string]: string } = {
        'pension': 'פנסיה',
        'risk': 'סיכונים',
        'pension-transfer': 'ניוד פנסיה',
        'finance-transfer': 'ניוד פיננסים',
        'regular-deposit': 'הפקדה שוטפת',
        'financial-planning': 'תכנון פיננסי'
      };
      
      const saleDetails = [
        ['סוג מוצר:', productTypeMap[formData.productType] || formData.productType],
        ['סכום:', `₪${formData.amount.toLocaleString()}`],
        ['הערות:', formData.notes]
      ];
      
      // טבלת פרטי מכירה
      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 25,
        head: [],
        body: saleDetails,
        theme: 'plain',
        styles: {
          font: 'Heebo',
          fontSize: 12,
          cellPadding: 5
        },
        columnStyles: {
          0: { halign: 'right', cellWidth: 40 },
          1: { halign: 'right', cellWidth: 100 }
        },
        margin: { right: 15 }
      });
      
      // שמירת הקובץ
      const fileName = `סיכום_מכירה_${formData.clientName}_${currentDate.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      toast.success('הדוח יוצא בהצלחה');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('שגיאה בייצוא הדוח');
    }
  };

  const exportToExcel = () => {
    try {
      const productTypeMap: { [key: string]: string } = {
        'pension': 'פנסיה',
        'risk': 'סיכונים',
        'pension-transfer': 'ניוד פנסיה',
        'finance-transfer': 'ניוד פיננסים',
        'regular-deposit': 'הפקדה שוטפת',
        'financial-planning': 'תכנון פיננסי'
      };

      const data = [
        ['סיכום מכירה'],
        ['תאריך:', new Date().toLocaleDateString('he-IL')],
        [''],
        ['פרטי לקוח'],
        ['שם מלא:', formData.clientName],
        ['תעודת זהות:', formData.id_number],
        ['טלפון:', formData.clientPhone],
        ['אימייל:', formData.clientEmail],
        [''],
        ['פרטי מכירה'],
        ['סוג מוצר:', productTypeMap[formData.productType] || formData.productType],
        ['סכום:', `₪${formData.amount.toLocaleString()}`],
        ['הערות:', formData.notes]
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'סיכום מכירה');

      // התאמת רוחב העמודות
      const colWidths = [
        { wch: 20 }, // עמודה ראשונה
        { wch: 30 }  // עמודה שנייה
      ];
      ws['!cols'] = colWidths;

      // שמירת הקובץ
      const currentDate = new Date().toLocaleDateString('he-IL').replace(/\//g, '-');
      const fileName = `סיכום_מכירה_${formData.clientName}_${currentDate}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('הקובץ יוצא בהצלחה');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('שגיאה בייצוא הקובץ');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">תעודת זהות</label>
            <input
              type="text"
              name="id_number"
              value={formData.id_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">סוג מוצר</label>
            <select
              name="productType"
              value={formData.productType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">בחר סוג מוצר</option>
              <option value="pension">פנסיה</option>
              <option value="risk">סיכונים</option>
              <option value="pension-transfer">ניוד פנסיה</option>
              <option value="finance-transfer">ניוד פיננסים</option>
              <option value="regular-deposit">הפקדה שוטפת</option>
              <option value="financial-planning">תכנון פיננסי</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">סכום</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">שם הלקוח</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">טלפון</label>
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">אימייל</label>
            <input
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">הערות</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ייצא דוח
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    type="button"
                    onClick={() => {
                      exportToExcel();
                      setShowExportMenu(false);
                    }}
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    ייצא לאקסל
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportToPDF();
                      setShowExportMenu(false);
                    }}
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    ייצא לPDF
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            שמור מכירה
          </button>
        </div>
      </form>
      
      {/* סגירת התפריט בלחיצה מחוץ לתפריט */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
} 