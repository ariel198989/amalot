"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Percent, Calendar, Building2, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { cn } from "@/lib/utils";

interface Promotion {
  id: string;
  title: string;
  description: string;
  company: string;
  start_date: string;
  end_date: string;
  link?: string;
  is_active: boolean;
}

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString();
      
      const { data: promotionsData, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', today)
        .order('end_date', { ascending: true });

      if (error) throw error;

      setPromotions(promotionsData || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
      toast.error('שגיאה בטעינת המבצעים');
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysLeft = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">מבצעים</h1>
          <p>תוכן המבצעים יופיע כאן בקרוב...</p>
        </div>
      </Card>
    </div>
  );
};

export default PromotionsPage; 