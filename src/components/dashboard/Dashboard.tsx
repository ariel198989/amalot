import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Calculator, ArrowUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  // נתוני דוגמה לגרף
  const monthlyData = [
    { name: 'ינואר', עמלות: 4000 },
    { name: 'פברואר', עמלות: 3000 },
    { name: 'מרץ', עמלות: 2000 },
    { name: 'אפריל', עמלות: 2780 },
    { name: 'מאי', עמלות: 1890 },
    { name: 'יוני', עמלות: 2390 },
  ];

  const stats = [
    {
      title: 'סה״כ עמלות החודש',
      value: '₪15,300',
      change: '+12.5%',
      icon: TrendingUp,
    },
    {
      title: 'לקוחות פעילים',
      value: '64',
      change: '+4.3%',
      icon: Users,
    },
    {
      title: 'חישובים החודש',
      value: '156',
      change: '+8.2%',
      icon: Calculator,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* כרטיסי סטטיסטיקה */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500 mr-1">{stat.change}</span>
                  <span className="text-sm text-gray-500">מהחודש שעבר</span>
                </div>
              </div>
              <stat.icon className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </div>
        ))}
      </div>

      {/* גרף עמלות */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-6">סיכום עמלות חודשי</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="עמלות" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 