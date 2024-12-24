import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkPlanTable from '../table/work-plan-system';
import SalesTargetsSystem from '../table/sales-targets-system';
import { useUser } from '../contexts/UserContext';
import { SalesTargetsProvider, useSalesTargets } from '@/contexts/SalesTargetsContext';
import SalesTargetsTab from '../components/dashboard/sales-targets-tab';
import { SalesProgressChart } from '../components/dashboard/sales-progress-charts';

const AnnualWorkPlan = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('work-plan');
  const currentYear = new Date().getFullYear();
  const selectedYear = currentYear;

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">יש להתחבר למערכת</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">תכנית עבודה שנתית - {selectedYear}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir="rtl">
        <TabsList className="grid grid-cols-2 gap-4 bg-transparent h-auto p-0">
          <TabsTrigger
            value="work-plan"
            className={`data-[state=active]:bg-slate-800 data-[state=active]:text-white px-6 py-3 rounded-lg text-lg font-medium transition-all
              ${activeTab === 'work-plan' ? '' : 'bg-white hover:bg-slate-50'}`}
          >
            תכנית עבודה
          </TabsTrigger>
          <TabsTrigger
            value="sales-targets"
            className={`data-[state=active]:bg-slate-800 data-[state=active]:text-white px-6 py-3 rounded-lg text-lg font-medium transition-all
              ${activeTab === 'sales-targets' ? '' : 'bg-white hover:bg-slate-50'}`}
          >
            יעדי מכירות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="work-plan" className="mt-6">
          <Card className="bg-white shadow-lg">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-xl text-slate-800">תכנית עבודה חודשית</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <SalesTargetsProvider>
                <WorkPlanContent user={user} selectedYear={selectedYear} />
              </SalesTargetsProvider>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales-targets" className="mt-6">
          <SalesTargetsProvider>
            <div className="space-y-6">
              <SalesProgressChart />
              <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="text-xl text-slate-800">יעדי מכירות שנתיים</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <SalesTargetsSystem />
                </CardContent>
              </Card>
            </div>
          </SalesTargetsProvider>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const WorkPlanContent: React.FC<{ user: any; selectedYear: number }> = ({ user, selectedYear }) => {
  const { workingDays, updateWorkingDays } = useSalesTargets();
  const months = ['ינואר 24׳', 'פברואר 24׳', 'מרץ 24׳', 'אפריל 24׳', 'מאי 24׳', 'יוני 24׳',
                 'יולי 24׳', 'אוגוסט 24׳', 'ספטמבר 24׳', 'אוקטובר 24׳', 'נובמבר 24׳', 'דצמבר 24׳'];

  return (
    <div className="space-y-6">
      <SalesTargetsTab />
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-slate-800">ימי עבודה בחודש</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {months.map((month, index) => (
            <div key={month} className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">{month}</label>
              <input
                type="number"
                min="0"
                max="31"
                value={workingDays[index]}
                onChange={(e) => updateWorkingDays(index, parseInt(e.target.value) || 0)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      <WorkPlanTable agent_id={user.id} year={selectedYear} />
      
      <div className="mt-8 p-6 bg-blue-50 rounded-xl space-y-6">
        <h3 className="text-xl font-bold text-blue-900">איך זה עובד?</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">1</div>
            <div>
              <h4 className="font-bold text-blue-900">הגדרת יעדים בסיסיים</h4>
              <p className="text-blue-800">הגדר את מספר הפגישות היומי ואת אחוז הסגירה הצפוי. אלו הם הפרמטרים הבסיסיים שישפיעו על כל היעדים.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">2</div>
            <div>
              <h4 className="font-bold text-blue-900">חישוב אוטומטי</h4>
              <p className="text-blue-800">המערכת מחשבת אוטומטית את היעדים החודשיים בהתבסס על הפרמטרים שהגדרת ועל הקטגוריות השונות.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">3</div>
            <div>
              <h4 className="font-bold text-blue-900">מעקב ביצועים</h4>
              <p className="text-blue-800">בכל חודש תוכל לעקוב אחר הביצועים בפועל מול היעדים שהוגדרו, כולל אחוזי עמידה ביעדים.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-inner">
          <h4 className="text-lg font-bold text-blue-900 mb-4">תרשים זרימה - תהליך העבודה</h4>
          <div className="flex justify-center">
            <svg className="w-full max-w-2xl" viewBox="0 0 800 200">
              <defs>
                <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#EBF5FF' }} />
                  <stop offset="100%" style={{ stopColor: '#E1EFFE' }} />
                </linearGradient>
              </defs>

              <g transform="translate(50, 50)">
                <rect width="200" height="100" rx="10" fill="url(#boxGradient)" stroke="#3B82F6" strokeWidth="2" />
                <text x="100" y="45" textAnchor="middle" fill="#1E40AF" fontSize="16" fontWeight="bold">הגדרות בסיסיות</text>
                <text x="100" y="70" textAnchor="middle" fill="#1E40AF" fontSize="14">פגישות ואחוזי סגירה</text>
              </g>

              <path d="M 260,100 L 300,100" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)" />

              <g transform="translate(300, 50)">
                <rect width="200" height="100" rx="10" fill="url(#boxGradient)" stroke="#3B82F6" strokeWidth="2" />
                <text x="100" y="45" textAnchor="middle" fill="#1E40AF" fontSize="16" fontWeight="bold">חישוב יעדים</text>
                <text x="100" y="70" textAnchor="middle" fill="#1E40AF" fontSize="14">חישוב אוטומטי לכל קטגוריה</text>
              </g>

              <path d="M 510,100 L 550,100" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowhead)" />

              <g transform="translate(550, 50)">
                <rect width="200" height="100" rx="10" fill="url(#boxGradient)" stroke="#3B82F6" strokeWidth="2" />
                <text x="100" y="45" textAnchor="middle" fill="#1E40AF" fontSize="16" fontWeight="bold">מעקב ביצועים</text>
                <text x="100" y="70" textAnchor="middle" fill="#1E40AF" fontSize="14">השוואה מול יעדים</text>
              </g>

              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-100 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-2">💡 טיפים לשימוש יעיל:</h4>
          <ul className="list-disc list-inside space-y-2 text-blue-800">
            <li>עדכן את היעדים בתחילת כל חודש בהתאם לתוצאות החודש הקודם</li>
            <li>השתמש בדוח העמלות החודשי לניתוח מגמות וקבלת החלטות</li>
            <li>שים לב לקטגוריות עם אחוזי ביצוע נמוכים ונסה לזהות את הסיבות</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnnualWorkPlan; 