'use client'

import * as React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowUpIcon, BellIcon, CalendarIcon, ChevronDownIcon, MenuIcon, SearchIcon, UserIcon, LayoutDashboard, FileText, Users, Settings } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

const navItems = [
  { name: 'לוח בקרה', icon: LayoutDashboard },
  { name: 'דוחות', icon: FileText },
  { name: 'משתמשים', icon: Users },
  { name: 'הגדרות', icon: Settings },
]

export default function ModernAnalyticsDashboard() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900" dir="rtl">
      {/* סרגל צד */}
      <aside className="w-64 bg-[#1a237e] text-white p-6 hidden md:block">
        <div className="flex items-center mb-8">
          <img src="/placeholder.svg?height=32&width=32" alt="לוגו" className="w-8 h-8 ml-2" />
          <h1 className="text-xl font-bold">אנליטיקס</h1>
        </div>
        <nav>
          {navItems.map((item) => (
            <a key={item.name} href="#" className="flex items-center py-2 px-4 rounded hover:bg-[#283593] mb-1 transition duration-200">
              <item.icon className="h-5 w-5 ml-2" />
              {item.name}
            </a>
          ))}
        </nav>
      </aside>

      {/* תוכן ראשי */}
      <main className="flex-1 overflow-y-auto">
        {/* כותרת */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-6 w-6" />
            </Button>
            <div className="flex-1 flex justify-center px-2 lg:mr-6 lg:justify-end">
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">חיפוש</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="search"
                    name="search"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="חיפוש"
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon">
                <BellIcon className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon">
                <UserIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <h2 className="text-xl font-semibold">סקירת לוח הבקרה</h2>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 ml-2" />
              <Select defaultValue="7d">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="בחר טווח זמן" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 ימים אחרונים</SelectItem>
                  <SelectItem value="30d">30 ימים אחרונים</SelectItem>
                  <SelectItem value="90d">90 ימים אחרונים</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* תוכן לוח הבקרה */}
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
                      <ChartContainer
                        config={{
                          revenue: {
                            label: "הכנסות",
                            color: "hsl(var(--chart-1))",
                          },
                          users: {
                            label: "משתמשים",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" stroke="var(--color-revenue)" />
                            <YAxis yAxisId="right" orientation="right" stroke="var(--color-users)" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" name="הכנסות" />
                            <Bar yAxisId="right" dataKey="users" fill="var(--color-users)" name="משתמשים" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </TabsContent>
                  <TabsContent value="line" className="space-y-4">
                    <div className="h-[400px]">
                      <ChartContainer
                        config={{
                          revenue: {
                            label: "הכנסות",
                            color: "hsl(var(--chart-1))",
                          },
                          users: {
                            label: "משתמשים",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis yAxisId="left" orientation="left" stroke="var(--color-revenue)" />
                            <YAxis yAxisId="right" orientation="right" stroke="var(--color-users)" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" name="הכנסות" />
                            <Line yAxisId="right" type="monotone" dataKey="users" stroke="var(--color-users)" name="משתמשים" />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* ניתן להוסיף כאן סעיפים נוספים */}
        </div>
      </main>
    </div>
  )
}