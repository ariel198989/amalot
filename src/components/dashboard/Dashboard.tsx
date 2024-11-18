'use client'

import * as React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowUpIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// נתוני דוגמה
const kpiData = [
  { title: 'סה"כ הכנסות', value: '₪54,239', change: '+14.5%', trend: [4, 6, 8, 7, 9, 10] },
  { title: 'משתמשים פעילים', value: '2,741', change: '+5.2%', trend: [3, 4, 5, 3, 4, 5] },
  { title: 'שיעור המרה', value: '3.24%', change: '+2.1%', trend: [2, 3, 2, 4, 3, 5] },
  { title: 'זמן שהייה ממוצע', value: '2:56 דק׳', change: '+0.5%', trend: [4, 3, 5, 4, 5, 6] },
]

const monthlyData = [
  { name: 'ינו׳', revenue: 4000, users: 2400 },
  { name: 'פבר׳', revenue: 3000, users: 1398 },
  { name: 'מרץ', revenue: 2000, users: 9800 },
  { name: 'אפר׳', revenue: 2780, users: 3908 },
  { name: 'מאי', revenue: 1890, users: 4800 },
  { name: 'יוני', revenue: 2390, users: 3800 },
]

export default function ModernAnalyticsDashboard() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* כרטיסי KPI */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium inline-flex items-center">
                    <ArrowUpIcon className="w-3 h-3 ml-1" />
                    {kpi.change}
                  </span>{' '}
                  לעומת החודש שעבר
                </p>
                <div className="h-[40px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpi.trend.map((value, i) => ({ name: i, value }))}>
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* תרשימים ראשיים */}
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>הכנסות לעומת משתמשים</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bar" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="bar">תרשים עמודות</TabsTrigger>
                  <TabsTrigger value="line">תרשים קווי</TabsTrigger>
                </TabsList>
                <TabsContent value="bar" className="space-y-4">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="הכנסות" />
                        <Bar yAxisId="right" dataKey="users" fill="#82ca9d" name="משתמשים" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="line" className="space-y-4">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" name="הכנסות" />
                        <Line yAxisId="right" type="monotone" dataKey="users" stroke="#82ca9d" name="משתמשים" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}