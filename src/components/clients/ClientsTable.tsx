import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { Eye, FileText, Mail, Phone } from 'lucide-react';
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
        if (!acc[curr.client_name]) {
          acc[curr.client_name] = curr;
        } else {
          // עדכון המוצרים הנבחרים אם יש חדשים
          const existingProducts = new Set(acc[curr.client_name].selected_products);
          curr.selected_products.forEach(product => existingProducts.add(product));
          acc[curr.client_name].selected_products = Array.from(existingProducts);
          
          // עדכון העמלות הכוללות
          acc[curr.client_name].total_commission += curr.total_commission;
          
          // שמירת התאריך האחרון
          if (new Date(curr.journey_date) > new Date(acc[curr.client_name].journey_date)) {
            acc[curr.client_name].journey_date = curr.journey_date;
          }
        }
        return acc;
      }, {});

      setClients(Object.values(mergedClients));
    } catch (error: any) {
      console.error('Error loading clients:', error);
      toast.error('אירעה שגיאה בטעינת הלקוחות');
    } finally {
      setLoading(false);
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
          <CardTitle className="text-2xl">לקוחות</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadClients()}>
              רענן נתונים
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-right font-medium text-gray-600">שם הלקוח</th>
                  <th className="p-3 text-right font-medium text-gray-600">טלפון</th>
                  <th className="p-3 text-right font-medium text-gray-600">מוצרים</th>
                  <th className="p-3 text-right font-medium text-gray-600">סה"כ עמלות</th>
                  <th className="p-3 text-right font-medium text-gray-600">תאריך אחרון</th>
                  <th className="p-3 text-right font-medium text-gray-600">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{client.client_name}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {client.client_phone || 'לא הוזן'}
                      </div>
                    </td>
                    <td className="p-3">{formatProducts(client.selected_products)}</td>
                    <td className="p-3">₪{client.total_commission.toLocaleString()}</td>
                    <td className="p-3">{client.journey_date}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" title="צפה בפרטים">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="שלח דוח">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="שלח מייל">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
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