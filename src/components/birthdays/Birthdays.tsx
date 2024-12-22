"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Phone, Mail, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birthday: string;
}

interface ClientWithBirthday extends Client {
  daysUntilBirthday: number;
}

const BirthdaysPage: React.FC = () => {
  const [clients, setClients] = React.useState<ClientWithBirthday[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadBirthdays();
  }, []);

  const calculateDaysUntilBirthday = (birthday: string) => {
    const today = new Date();
    const birth = new Date(birthday);
    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const loadBirthdays = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .not('birthday', 'is', null);

      if (error) throw error;

      const clientsWithBirthdays = clientsData
        .map(client => ({
          ...client,
          daysUntilBirthday: calculateDaysUntilBirthday(client.birthday)
        }))
        .filter(client => client.daysUntilBirthday <= 30)
        .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

      setClients(clientsWithBirthdays);
    } catch (error) {
      console.error('Error loading birthdays:', error);
      toast.error('שגיאה בטעינת ימי ההולדת');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ימי הולדת</h1>
          <p className="text-gray-500">ימי ההולדת הקרובים של הלקוחות שלך</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">אין ימי הולדת בחודש הקרוב</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Card key={client.id} className={cn(
              "border-2",
              client.daysUntilBirthday === 0 ? "border-primary-500" : "border-gray-200"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{client.first_name} {client.last_name}</span>
                  <Gift className={cn(
                    "h-5 w-5",
                    client.daysUntilBirthday === 0 ? "text-primary-500" : "text-gray-400"
                  )} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary-600">
                      {client.daysUntilBirthday === 0 
                        ? 'יום הולדת היום!' 
                        : `עוד ${client.daysUntilBirthday} ימים`}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `tel:${client.phone}`}
                      >
                        <Phone className="h-4 w-4 ml-2" />
                        התקשר
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `mailto:${client.email}`}
                      >
                        <Mail className="h-4 w-4 ml-2" />
                        שלח מייל
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 ml-2" />
                      {new Date(client.birthday).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BirthdaysPage;