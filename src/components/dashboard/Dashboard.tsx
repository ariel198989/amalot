'use client'

import * as React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowUpIcon, TrendingUp, Users, DollarSign, Clock, Target, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { reportService } from '@/services/reportService'
import { toast } from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DashboardStats {
  totalSales: number;
  totalCommission: number;
  monthlySales: any[];
  productDistribution: ProductDistribution[];
}

interface ProductDistribution {
  type: string;
  count: number;
  commission: number;
  details: any[];
}

export default function ModernAnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const dashboardStats = await reportService.fetchDashboardStats();
      
      // Transform the data into the expected format
      const transformedStats: DashboardStats = {
        totalSales: dashboardStats.total.count || 0,
        totalCommission: dashboardStats.total.commission || 0,
        monthlySales: [],
        productDistribution: [
          {
            type: 'pension',
            count: dashboardStats.total.pension.count || 0,
            commission: dashboardStats.total.pension.commission || 0,
            details: []
          },
          {
            type: 'insurance',
            count: dashboardStats.total.insurance.count || 0,
            commission: dashboardStats.total.insurance.commission || 0,
            details: []
          },
          {
            type: 'investment',
            count: dashboardStats.total.investment.count || 0,
            commission: dashboardStats.total.investment.commission || 0,
            details: []
          },
          {
            type: 'policy',
            count: dashboardStats.total.policy.count || 0,
            commission: dashboardStats.total.policy.commission || 0,
            details: []
          }
        ]
      };

      setStats(transformedStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('שגיאה בטעינת נתוני הדשבורד');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-lg">טוען נתונים...</div>
    </div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const kpiData = [
    { 
      title: 'סה"כ הכנסות', 
      value: formatCurrency(stats.totalCommission), 
      change: '+14.5%',
      trend: [0, 0, 0, 0, 0, stats.totalCommission],
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'הכנסות מכל המוצרים'
    },
    { 
      title: 'סה"כ מכירות', 
      value: stats.totalSales.toString(), 
      change: '+5.2%',
      trend: [0, 0, 0, 0, 0, stats.totalSales],
      icon: Users,
      color: 'bg-blue-500',
      description: 'סך כל המכירות'
    },
    { 
      title: 'עמלה ממוצעת', 
      value: formatCurrency(stats.totalSales ? stats.totalCommission / stats.totalSales : 0), 
      change: '+0.5%', 
      trend: [0, 0, 0, 0, 0, stats.totalSales ? stats.totalCommission / stats.totalSales : 0],
      icon: Activity,
      color: 'bg-orange-500',
      description: 'עמלה ממוצעת למכירה'
    },
    { 
      title: 'מכירות החודש', 
      value: stats.productDistribution.reduce((sum, product) => sum + product.count, 0).toString(), 
      change: '+2.1%', 
      trend: stats.productDistribution.map(product => product.count),
      icon: Target,
      color: 'bg-purple-500',
      description: 'מכירות בחודש הנוכחי'
    },
  ];

  const monthlyData = [
    {
      name: 'החודש',
      revenue: stats.totalCommission,
      commissions: stats.totalCommission
    }
  ];

  const productData = stats.productDistribution.map(product => ({
    name: getProductHebrewName(product.type),
    value: product.count,
    color: getProductColor(product.type)
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">דשבורד ניהולי</h1>
          <p className="mt-2 text-gray-600">סקירה כללית של הביצועים העסקיים</p>
        </div>

        {/* כרטיסי KPI */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                  <CardDescription className="text-xs">{kpi.description}</CardDescription>
                </div>
                <div className={`p-2 rounded-lg ${kpi.color} bg-opacity-10`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color.replace('bg-', 'text-')}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-4 space-x-reverse">
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="text-xs text-green-500 font-medium flex items-center">
                    <ArrowUpIcon className="w-3 h-3 ml-1" />
                    {kpi.change}
                  </div>
                </div>
                <div className="h-[40px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpi.trend.map((value, i) => ({ name: i, value }))}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={kpi.color.replace('bg-', '#')} 
                        strokeWidth={2} 
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* תרשימים ראשיים */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>הכנסות ועמלות</CardTitle>
              <CardDescription>השוואת הכנסות ועמלות לאורך זמן</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bar" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                  <TabsTrigger value="bar">תרשים עמודות</TabsTrigger>
                  <TabsTrigger value="line">תרשים קווי</TabsTrigger>
                </TabsList>
                <TabsContent value="bar">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" name="הכנסות" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="commissions" name="עמלות" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="line">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          name="הכנסות"
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="commissions" 
                          name="עמלות"
                          stroke="#82ca9d" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>התפלגות מוצרים</CardTitle>
              <CardDescription>התפלגות העמלות לפי סוגי מוצרים</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {productData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>מגמות חודשיות</CardTitle>
              <CardDescription>השוואת ביצועים חודש מול חודש</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="הכנסות"
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getProductHebrewName(type: string): string {
  const names: Record<string, string> = {
    pension: 'פנסיה',
    insurance: 'ביטוח',
    investment: 'השקעות',
    policy: 'פוליסות'
  };
  return names[type] || type;
}

function getProductColor(type: string): string {
  const colors: Record<string, string> = {
    pension: '#8884d8',
    insurance: '#82ca9d',
    investment: '#ffc658',
    policy: '#ff7300'
  };
  return colors[type] || '#000000';
}