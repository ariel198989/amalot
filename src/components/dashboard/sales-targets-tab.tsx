import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useSalesTargets } from '@/contexts/SalesTargetsContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface CategoryTarget {
  id: string;
  title: string;
  averageAmount: number;
  percentage: number;
  calculatedTarget: number;
  isEditing?: boolean;
}

const SalesTargetsTab = () => {
  const { 
    closingRate, 
    monthlyMeetings, 
    isDirty,
    setIsDirty,
    updateClosingRate, 
    updateMonthlyMeetings,
    saveChanges
  } = useSalesTargets();

  // הוספת לוג לכל שינוי בערכים
  useEffect(() => {
    console.log('Tab values changed:', { closingRate, monthlyMeetings, isDirty });
  }, [closingRate, monthlyMeetings, isDirty]);

  const handleClosingRateChange = (value: number) => {
    console.log('Changing closing rate to:', value);
    updateClosingRate(value);
  };

  const handleSave = async () => {
    console.log('Saving changes...');
    await saveChanges();
    console.log('Changes saved');
  };

  const [categories, setCategories] = useState<CategoryTarget[]>([
    { id: 'risks', title: 'סיכונים', averageAmount: 150, percentage: 100, calculatedTarget: 0 },
    { id: 'pension', title: 'פנסיוני', averageAmount: 1500, percentage: 100, calculatedTarget: 0 },
    { id: 'pension-transfer', title: 'ניוד פנסיה', averageAmount: 150000, percentage: 100, calculatedTarget: 0 },
    { id: 'finance-transfer', title: 'פיננסים ניוד', averageAmount: 200000, percentage: 100, calculatedTarget: 0 },
    { id: 'financial-planning', title: 'תכנון פיננסי', averageAmount: 0, percentage: 35, calculatedTarget: 0 },
    { id: 'family-economics', title: 'כלכלת המשפחה', averageAmount: 0, percentage: 27, calculatedTarget: 0 },
    { id: 'employment', title: 'תעסוקה', averageAmount: 0, percentage: 10, calculatedTarget: 0 },
    { id: 'organizational-consulting', title: 'יעוץ עסקי ארגוני', averageAmount: 0, percentage: 5, calculatedTarget: 0 },
    { id: 'retirement', title: 'פרישה', averageAmount: 0, percentage: 7, calculatedTarget: 0 },
    { id: 'organizational-recruitment', title: 'גיוס ארגונים', averageAmount: 0, percentage: 15, calculatedTarget: 0 },
    { id: 'mortgage', title: 'משכנתא', averageAmount: 300, percentage: 10, calculatedTarget: 0 },
    { id: 'monthly-subscription', title: 'מנוי חודשי', averageAmount: 0, percentage: 20, calculatedTarget: 0 },
    { id: 'loans', title: 'הלוואות', averageAmount: 0, percentage: 20, calculatedTarget: 0 },
    { id: 'real-estate', title: 'נדל"ן', averageAmount: 0, percentage: 20, calculatedTarget: 0 }
  ]);

  // פונקציה לחישוב היעד
  const calculateTarget = (category: CategoryTarget) => {
    const baseTarget = (closingRate / 100) * monthlyMeetings;
    return baseTarget * (category.percentage / 100) * category.averageAmount;
  };

  // עדכון היעדים כשהפרמטרים משתנים
  useEffect(() => {
    const updatedCategories = categories.map(category => ({
      ...category,
      calculatedTarget: calculateTarget(category)
    }));
    setCategories(updatedCategories);
  }, [closingRate, monthlyMeetings]);

  const handleAmountChange = (id: string, value: number) => {
    const updatedCategories = categories.map(category => 
      category.id === id ? { ...category, averageAmount: value } : category
    );
    setCategories(updatedCategories);
    setIsDirty(true);
  };

  const handlePercentageChange = (id: string, value: number) => {
    const updatedCategories = categories.map(category => 
      category.id === id ? { ...category, percentage: value } : category
    );
    setCategories(updatedCategories);
    setIsDirty(true);
  };

  const sendToReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('לא נמצא משתמש מחובר');
        return;
      }

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // שליחת היעדים לדוחות
      const promises = categories.map(async (category) => {
        const target = calculateTarget(category);
        
        // מידע נוסף לפי סוג הקטגוריה
        let additionalData = {};
        if (category.id === 'pension-transfer' || category.id === 'finance-transfer') {
          additionalData = {
            metric_type: 'transfer_amount',
            unit: 'ILS'
          };
        } else if (category.id === 'risks') {
          additionalData = {
            metric_type: 'monthly_premium',
            unit: 'ILS'
          };
        }

        const { error } = await supabase
          .from('sales_targets')
          .upsert({
            user_id: user.id,
            category: category.id,
            month: currentMonth,
            year: currentYear,
            target_amount: target,
            performance: 0, // מאפס את הביצועים בתחילת החודש
            ...additionalData
          });

        if (error) {
          console.error(`שגיאה בשמירת יעד ${category.title}:`, error);
          throw error;
        }
      });

      await Promise.all(promises);
      toast.success('היעדים נשלחו לדוחות בהצלחה');
    } catch (error) {
      console.error('שגיאה בשליחת היעדים לדוחות:', error);
      toast.error('שגיאה בשליחת היעדים לדוחות');
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg shadow-md border border-slate-200 transition-all duration-300 hover:shadow-lg">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {/* נתונים בסיסיים - מוקטן */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow transition-all duration-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
            <span className="bg-blue-100 p-1 rounded-md mr-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            נתונים בסיסיים
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-slate-600">פגישות ליום:</label>
              <Input
                type="number"
                value={monthlyMeetings / 22}
                onChange={(e) => updateMonthlyMeetings(Number(e.target.value) * 22)}
                className="w-20 text-left h-8"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-slate-600">אחוז סגירה:</label>
              <Input
                type="number"
                value={closingRate}
                onChange={(e) => handleClosingRateChange(Number(e.target.value))}
                className="w-20 text-left h-8"
              />
            </div>
          </div>
        </div>

        {/* ממוצע פעילות לפגישה - מוקטן */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-4 border border-emerald-100 shadow-sm hover:shadow transition-all duration-200">
          <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center">
            <span className="bg-emerald-100 p-1 rounded-md mr-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            ממוצע פעילות לפגישה
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {categories
              .filter(cat => cat.averageAmount > 0)
              .map(category => (
                <div key={category.id} 
                  className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-emerald-50 transition-colors duration-150"
                >
                  <span className="text-emerald-700">{category.title}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={category.averageAmount}
                      onChange={(e) => handleAmountChange(category.id, Number(e.target.value))}
                      className="w-24 h-7 text-left focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <span className="text-emerald-600 font-medium">₪</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ממוצע לפגישה מוצרי גולה - מוקן */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border border-purple-100 shadow-sm hover:shadow transition-all duration-200">
          <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
            <span className="bg-purple-100 p-1 rounded-md mr-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </span>
            אחוזי מוצרי גולה
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
            {categories
              .filter(cat => cat.percentage > 0)
              .map(category => (
                <div key={category.id} 
                  className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-purple-50 transition-colors duration-150"
                >
                  <span className="text-purple-700">{category.title}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={category.percentage}
                      onChange={(e) => handlePercentageChange(category.id, Number(e.target.value))}
                      className="w-16 h-7 text-left focus:ring-purple-500 focus:border-purple-500"
                    />
                    <span className="text-purple-600 font-medium">%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* כפתורי פעולה */}
      <div className="border-t border-slate-200 p-3 bg-gradient-to-b from-white to-slate-50 flex justify-between gap-3">
        <button
          onClick={sendToReports}
          className="px-4 py-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm rounded-md shadow-sm hover:shadow-md transition-all duration-200"
        >
          שלח לדוחות
        </button>
        
        {isDirty && (
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1 rounded-md hover:bg-slate-100 transition-all duration-200"
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            >
              שמירה
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTargetsTab; 