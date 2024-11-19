import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Eye, FileText, Mail, Phone, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  client_name: string;
  client_phone: string;
  selected_products: string[];
  total_commission: number;
  journey_date: string;
  commission_details: any;
}

const ClientsTable: React.FC = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      const { data, error } = await supabase
        .from('customer_journeys')
        .select('*')
        .eq('user_id', user.id)
        .order('journey_date', { ascending: false });

      if (error) throw error;

      // מיזוג לקוחות כפולים ואיחוד הפעולות שלהם
      const mergedClients = data.reduce((acc: { [key: string]: Client }, curr) => {
        const key = `${curr.client_name}_${curr.client_phone}`; // מפתח ייחודי המבוסס על שם וטלפון

        if (!acc[key]) {
          // יצירת רשומה חדשה
          acc[key] = {
            ...curr,
            total_commission: Number(curr.total_commission) || 0,
            selected_products: Array.isArray(curr.selected_products) ? curr.selected_products : []
          };
        } else {
          // עדכון רשומה קיימת
          const existingProducts = new Set(acc[key].selected_products);
          const newProducts = Array.isArray(curr.selected_products) ? curr.selected_products : [];
          newProducts.forEach(product => existingProducts.add(product));
          
          acc[key].selected_products = Array.from(existingProducts);
          acc[key].total_commission = (
            Number(acc[key].total_commission) + 
            Number(curr.total_commission)
          ) || 0;
          
          // שמירת התאריך האחרון
          if (new Date(curr.journey_date) > new Date(acc[key].journey_date)) {
            acc[key].journey_date = curr.journey_date;
          }
        }
        return acc;
      }, {});

      // המרת התאריכים לפורמט מתאים ועיגול המספרים
      const formattedClients = Object.values(mergedClients).map(client => ({
        ...client,
        journey_date: new Date(client.journey_date).toLocaleDateString('he-IL'),
        total_commission: Math.round(Number(client.total_commission) * 100) / 100
      }));

      setClients(formattedClients);
    } catch (error: any) {
      console.error('Error loading clients:', error);
      toast.error('אירעה שגיאה בטעינת הלקוחות');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    try {
      // מחיקת הלקוח מסופאבייס
      const { error } = await supabase
        .from('customer_journeys')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      // עדכון המצב המקומי
      setClients(clients.filter(client => client.id !== clientId));
      toast.success('הלקוח נמחק בהצלחה');

    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast.error('אירעה שגיאה במחיקת הלקוח');
    }
  };

  React.useEffect(() => {
    loadClients();
  }, []);

  const formatProducts = (products: string[]) => {
    const productNames: { [key: string]: string } = {
      pension: 'פנסיה',
      insurance: 'ביטוח',
      investment: 'השקעות',
      policy: 'פוליסת חיסכון'
    };
    return products.map(p => productNames[p] || p).join(', ');
  };

  if (loading) {
    return <div className="text-center p-8">טוען נתונים...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>לקוחות</CardTitle>
            <CardDescription>רשימת כל הלקוחות והמכירות שלהם</CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => loadClients()}
            className="flex items-center gap-2"
          >
            רענן נתונים
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3">שם הלקוח</th>
                  <th className="text-right p-3">טלפון</th>
                  <th className="text-right p-3">מוצרים</th>
                  <th className="text-right p-3">סה"כ עמלות</th>
                  <th className="text-right p-3">תאריך אחרון</th>
                  <th className="text-right p-3">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">{client.client_name}</td>
                    <td className="p-3">{client.client_phone || 'לא הוזן'}</td>
                    <td className="p-3">{client.selected_products.join(', ')}</td>
                    <td className="p-3">₪{client.total_commission.toLocaleString()}</td>
                    <td className="p-3">{client.journey_date}</td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (window.confirm('האם אתה בטוח שברצונך למחוק לקוח זה?')) {
                            handleDelete(client.id!);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientsTable; 