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
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Creating new customer journey:', formData);
      
      // שמירת מסע הלקוח
      const { error: journeyError } = await supabase
        .from('customer_journeys')
        .insert([
          {
            agent_id: user?.id,
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
      const currentMonth = new Date().getMonth() + 1;
      console.log('Updating performance for month:', currentMonth);
      
      // עדכון הביצועים בהתאם לסוג המוצר - כל מכירת פנסיה הולכת לניוד פנסיה
      try {
        switch (formData.productType) {
          case 'pension':
          case 'pension-transfer':
            console.log('Updating pension-transfer performance:', formData.amount);
            await updatePerformance('pension-transfer', formData.amount, currentMonth);
            break;
          case 'risk':
            console.log('Updating risks performance:', formData.amount);
            await updatePerformance('risks', formData.amount, currentMonth);
            break;
          case 'finance-transfer':
            console.log('Updating finance-transfer performance:', formData.amount);
            await updatePerformance('finance-transfer', formData.amount, currentMonth);
            break;
          case 'regular-deposit':
            console.log('Updating regular-deposit performance:', formData.amount);
            await updatePerformance('regular-deposit', formData.amount, currentMonth);
            break;
          case 'financial-planning':
            console.log('Updating financial-planning performance:', formData.amount);
            await updatePerformance('financial-planning', formData.amount, currentMonth);
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
          notes: ''
        });

      } catch (error) {
        console.error('Error updating performance:', error);
        toast.error('שגיאה בעדכון הביצועים');
      }

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