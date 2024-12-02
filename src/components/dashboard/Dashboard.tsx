'use client'

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Calendar from 'react-calendar';
import type { Value } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { he } from "date-fns/locale";
import { reportService } from '@/services/reportService';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function ModernAnalyticsDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<{ [key: string]: number }>({});
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const dashboardStats = await reportService.fetchDashboardStats();
        setStats(dashboardStats);

        // Group all sales by date for calendar events
        const allSales = [
          ...(dashboardStats.currentMonth?.pension || []),
          ...(dashboardStats.currentMonth?.insurance || []),
          ...(dashboardStats.currentMonth?.investment || []),
          ...(dashboardStats.currentMonth?.policy || [])
        ];

        const dateEvents = allSales.reduce((acc: { [key: string]: number }, sale: any) => {
          if (sale?.created_at) {
            const date = new Date(sale.created_at).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
          }
          return acc;
        }, {});
        
        setEvents(dateEvents);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const eventCount = events[dateStr];
      
      return eventCount ? (
        <div className="event-dot">
          <span className="text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">
            {eventCount}
          </span>
        </div>
      ) : null;
    }
  };

  if (isLoading || !stats) {
    return <div>טוען...</div>;
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ... existing summary cards ... */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Calendar Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>לוח שנה</CardTitle>
            <CardDescription>מכירות לפי תאריך</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale="he-IL"
              tileContent={tileContent}
              className="react-calendar"
            />
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="col-span-1 lg:col-span-2">
          {/* ... existing revenue chart ... */}
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card>
        {/* ... existing sales table ... */}
      </Card>
    </div>
  );
}