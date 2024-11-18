'use client'

import * as React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ArrowUpIcon, TrendingUp, Users, DollarSign, Clock, Target, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const kpiData = [
  { 
    title: 'סה"כ הכנסות', 
    value: '₪54,239', 
    change: '+14.5%', 
    trend: [4, 6, 8, 7, 9, 10],
    icon: DollarSign,
    color: 'bg-green-500',
    description: 'הכנסות מכל המוצרים'
  },
  { 
    title: 'לקוחות חדשים', 
    value: '2,741', 
    change: '+5.2%', 
    trend: [3, 4, 5, 3, 4, 5],
    icon: Users,
    color: 'bg-blue-500',
    description: 'לקוחות שנוספו החודש'
  },
  { 
    title: 'אחוז המרה', 
    value: '3.24%', 
    change: '+2.1%', 
    trend: [2, 3, 2, 4, 3, 5],
    icon: Target,
    color: 'bg-purple-500',
    description: 'יחס המרה מפגישות לסגירות'
  },
  { 
    title: 'עמלות ממוצעות', 
    value: '₪2,956', 
    change: '+0.5%', 
    trend: [4, 3, 5, 4, 5, 6],
    icon: Activity,
    color: 'bg-orange-500',
    description: 'עמלות חודשיות ממוצעות'
  },
]

const monthlyData = [
  { name: 'ינו׳', revenue: 40000, commissions: 24000 },
  { name: 'פבר׳', revenue: 30000, commissions: 13980 },
  { name: 'מרץ', revenue: 20000, commissions: 9800 },
  { name: 'אפר׳', revenue: 27800, commissions: 39080 },
  { name: 'מאי', revenue: 18900, commissions: 48000 },
  { name: 'יוני', revenue: 23900, commissions: 38000 },
]

const productData = [
  { name: 'פנסיה', value: 400, color: '#8884d8' },
  { name: 'ביטוח', value: 300, color: '#82ca9d' },
  { name: 'השקעות', value: 300, color: '#ffc658' },
  { name: 'פוליסות', value: 200, color: '#ff7300' },
]

export default function ModernAnalyticsDashboard() {
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