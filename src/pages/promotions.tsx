"use client";

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

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

  return (
    <div className="container mx-auto py-10">
      <Card>
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">מבצעים</h1>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : promotions.length > 0 ? (
            <div className="grid gap-4">
              {promotions.map(promotion => (
                <div key={promotion.id} className="border rounded-lg p-4">
                  <h2 className="text-xl font-medium">{promotion.title}</h2>
                  <p className="text-gray-600">{promotion.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>חברה: {promotion.company}</span>
                    <span className="mx-2">|</span>
                    <span>תאריך סיום: {new Date(promotion.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>אין מבצעים פעילים כרגע</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PromotionsPage; 