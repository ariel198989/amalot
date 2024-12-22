"use client";

import * as React from 'react';
import { Card } from "@/components/ui/card";
import { Gift, Calendar, Tag, TrendingUp } from "lucide-react";

const promotions = [
  {
    id: "birthday",
    title: "מבצע יום הולדת",
    description: "הטבות מיוחדות ללקוחות ביום הולדתם",
    icon: Gift,
    period: "1-31 בכל חודש"
  },
  {
    id: "seasonal",
    title: "מבצע עונתי",
    description: "הטבות מיוחדות לעונת הקיץ",
    icon: Calendar,
    period: "יוני-אוגוסט"
  },
  {
    id: "referral",
    title: "חבר מביא חבר",
    description: "הטבות על הפניית לקוחות חדשים",
    icon: TrendingUp,
    period: "מתמשך"
  },
  {
    id: "special",
    title: "מבצע מיוחד",
    description: "הנחות מיוחדות על מוצרים נבחרים",
    icon: Tag,
    period: "לזמן מוגבל"
  }
];

const PromotionsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">מבצעים והטבות</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {promotions.map((promo) => {
          const Icon = promo.icon;
          return (
            <Card key={promo.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-1">{promo.title}</h2>
                  <p className="text-sm text-gray-600 mb-2">{promo.description}</p>
                  <p className="text-xs text-primary-600">{promo.period}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PromotionsPage; 