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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">מבצעים מיוחדים</h1>
          <p className="text-gray-500">מבצעים פעילים מחברות הביטוח</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : promotions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Percent className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">אין מבצעים פעילים כרגע</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => {
            const daysLeft = getDaysLeft(promotion.end_date);
            return (
              <Card key={promotion.id} className={cn(
                "border-2",
                daysLeft <= 3 ? "border-red-500" : "border-gray-200"
              )}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span>{promotion.title}</span>
                    <Percent className={cn(
                      "h-5 w-5",
                      daysLeft <= 3 ? "text-red-500" : "text-gray-400"
                    )} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Building2 className="h-4 w-4 ml-2" />
                        {promotion.company}
                      </div>
                      <p className="text-sm">{promotion.description}</p>
                      <p className="text-sm font-medium text-red-600">
                        {daysLeft === 0 
                          ? 'מסתיים היום!' 
                          : `נותרו ${daysLeft} ימים`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {promotion.link && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(promotion.link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 ml-2" />
                          פרטים נוספים
                        </Button>
                      )}
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 ml-2" />
                        בתוקף עד: {new Date(promotion.end_date).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromotionsPage; 