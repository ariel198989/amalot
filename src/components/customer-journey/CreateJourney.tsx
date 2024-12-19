import React, { useState } from 'react';
import { useSalesTargets } from '@/contexts/SalesTargetsContext';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-hot-toast';

interface JourneyFormData {
  productType: string;
  amount: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  id_number: string;
}

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

      // שמירת מסע הלקוח
      const { error: journeyError } = await supabase
        .from('customer_journeys')
        .insert([
          {
            agent_id: user.id,
            client_id: client.id,
            product_type: formData.productType,
            amount: formData.amount,
            client_name: formData.clientName,
            client_phone: formData.clientPhone,
            client_email: formData.clientEmail,
            notes: formData.notes
          }
        ]);

      if (journeyError) throw journeyError;

      // עדכון הביצועים
      const currentDate = new Date();
      const date = { 
        month: currentDate.getMonth() + 1, 
        year: currentDate.getFullYear() 
      };
      
      // עדכון הביצועים בהתאם לסוג המוצר
      switch (formData.productType) {
        case 'pension':
        case 'pension-transfer':
          await updatePerformance('pension-transfer', formData.amount, date);
          break;
        case 'risk':
          await updatePerformance('risks', formData.amount, date);
          break;
        case 'finance-transfer':
          await updatePerformance('finance-transfer', formData.amount, date);
          break;
        case 'regular-deposit':
          await updatePerformance('regular-deposit', formData.amount, date);
          break;
        case 'financial-planning':
          await updatePerformance('financial-planning', formData.amount, date);
          break;
      }

      toast.success('מסע הלקוח נוצר בהצלחה');
      
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            צור מסע לקוח
          </button>
        </div>
      </form>
    </div>
  );
} 