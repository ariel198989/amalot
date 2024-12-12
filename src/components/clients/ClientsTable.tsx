import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Search, Phone, Mail, Calendar } from 'lucide-react';
import ClientDetails from "./ClientDetailsComponent";
import { Label } from "@/components/ui/label";
import { useUser } from '@/contexts/UserContext';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  created_at: string;
  last_contact: string;
}

interface ClientDetails extends Client {
  total_revenue: number;
  total_policies: number;
  pension_sales: any[];
  insurance_sales: any[];
  investment_sales: any[];
  policy_sales: any[];
}

interface Sale {
  id: string;
  sale_type: 'pension' | 'insurance' | 'investment' | 'policy';
  total_commission: number;
  created_at: string;
  company: string;
}

interface NewClientData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  id_number: string;
  status: 'active' | 'inactive' | 'lead';
}

const ClientsTable = () => {
  const { user } = useUser();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [isAddingClient, setIsAddingClient] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [newClient, setNewClient] = useState<NewClientData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: '',
    status: 'active'
  });

  // טונקציה לבדיקת המשתמש הנוכחי
  const checkCurrentUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking session:', error);
      return null;
    }
    return session?.user;
  };

  // טעינת נתוני לקוחות
  const loadClients = async () => {
    try {
      setIsLoading(true);
      const currentUser = await checkCurrentUser();
      
      if (!currentUser) {
        console.error('No user found');
        return;
      }

      console.log('Loading clients for user:', currentUser.id);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading clients:', error);
        toast.error('שגיאה בטעינת רשימת הלקוחות');
        return;
      }

      console.log('Loaded clients:', data);
      setClients(data || []);
    } catch (error) {
      console.error('Error in loadClients:', error);
      toast.error('שגיאה בטעינת רשימת הלקוחות');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadClients();
  }, []);

  // טעינת פרטי לקוח מלאים
  const loadClientDetails = async (clientId: string) => {
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          sales:sales!client_id(
            id, created_at, company, total_commission,
            sale_type
          )
        `)
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      const sales = (clientData?.sales || []) as Sale[];
      const pension_sales = sales.filter(sale => sale.sale_type === 'pension');
      const insurance_sales = sales.filter(sale => sale.sale_type === 'insurance');
      const investment_sales = sales.filter(sale => sale.sale_type === 'investment');
      const policy_sales = sales.filter(sale => sale.sale_type === 'policy');

      const totalRevenue = sales.reduce((sum: number, sale) => sum + (sale.total_commission || 0), 0);
      const totalPolicies = sales.length;

      setSelectedClient({
        ...clientData,
        pension_sales,
        insurance_sales,
        investment_sales,
        policy_sales,
        total_revenue: totalRevenue,
        total_policies: totalPolicies
      });

    } catch (error) {
      console.error('Error loading client details:', error);
      toast.error('שגיאה בטעינת פרטי הלקוח');
    }
  };

  // סינון לקוחות
  const filteredClients = React.useMemo(() => {
    if (!clients) return [];
    
    return clients.filter(client => {
      if (!client) return false;
      
      const nameMatch = `${client.first_name || ''} ${client.last_name || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const statusMatch = statusFilter === 'all' || client.status === statusFilter;
      
      return nameMatch && statusMatch;
    });
  }, [clients, searchTerm, statusFilter]);

  const handleRowClick = async (client: Client) => {
    try {
      setIsLoadingDetails(true);
      await loadClientDetails(client.id);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error in handleRowClick:', error);
      toast.error('שגיאה בטעינת פרטי הלקוח');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleAddClient = async () => {
    try {
      const currentUser = await checkCurrentUser();
      console.log('Current user:', currentUser);
      
      if (!currentUser) {
        toast.error('משתמש לא מחובר');
        return;
      }

      // בדיקת תקינות בסיסית
      if (!newClient.first_name.trim() || !newClient.last_name.trim() || 
          !newClient.phone.trim() || !newClient.id_number.trim()) {
        toast.error('נא למלא את כל שדות החובה');
        return;
      }

      // בדיקה אם תעודת זהות כבר קיימת
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('id_number', newClient.id_number.trim())
        .eq('user_id', currentUser.id)
        .single();

      if (existingClient) {
        toast.error('מספר תעודת זהות כבר קיים במערכת');
        return;
      }

      const clientData = {
        user_id: currentUser.id,
        first_name: newClient.first_name.trim(),
        last_name: newClient.last_name.trim(),
        email: newClient.email.trim(),
        phone: newClient.phone.trim(),
        id_number: newClient.id_number.trim(),
        status: newClient.status
      };

      console.log('Attempting to insert client with data:', clientData);

      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) {
        console.error('Error adding client:', error);
        if (error.code === '42501') {
          toast.error('אין הרשאה להוספת לקוח');
        } else if (error.code === '23505') {
          toast.error('מספר תעודת זהות כבר קיים במערכת');
        } else {
          toast.error('שגיאה בהוספת הלקוח');
        }
        return;
      }

      if (!data) {
        toast.error('שגיאה בהוספת הלקוח - לא התקבלו נתונים');
        return;
      }

      console.log('Successfully added client:', data);
      setClients(prev => [data, ...prev]);
      setIsAddingClient(false);
      setNewClient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        id_number: '',
        status: 'active'
      });
      
      toast.success('הלקוח נוסף בהצלחה');
      
      // רענון הרשימה
      loadClients();
    } catch (error) {
      console.error('Error in handleAddClient:', error);
      toast.error('שגיאה בהוספת הלקוח');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול לקוחות</h1>
          <p className="text-gray-500">ניהול וצפייה בכל הלקוחות שלך</p>
        </div>
        <Button onClick={() => setIsAddingClient(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          הוסף לקוח
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="חיפוש קוחות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm text-right"
            dir="rtl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] text-right">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-right">הכל</SelectItem>
            <SelectItem value="active" className="text-right">פעיל</SelectItem>
            <SelectItem value="inactive" className="text-right">לא פעיל</SelectItem>
            <SelectItem value="lead" className="text-right">ליד</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-right">
                  <th className="p-4 text-right">שם</th>
                  <th className="p-4 text-right">טלפון</th>
                  <th className="p-4 text-right">אימייל</th>
                  <th className="p-4 text-right">סטטוס</th>
                  <th className="p-4 text-right">עדכון אחרון</th>
                  <th className="p-4 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id}
                    className="border-b hover:bg-gray-50 cursor-pointer text-right"
                    onClick={() => handleRowClick(client)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {client.first_name[0]}{client.last_name[0]}
                        </div>
                        <div>
                          <div className="font-medium">{client.first_name} {client.last_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{client.phone}</td>
                    <td className="p-4">{client.email}</td>
                    <td className="p-4">
                      <Badge variant={
                        client.status === 'active' ? 'success' :
                        client.status === 'inactive' ? 'destructive' : 'default'
                      }>
                        {client.status === 'active' ? 'פעיל' :
                         client.status === 'inactive' ? 'לא פעיל' : 'ליד'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {new Date(client.last_contact).toLocaleDateString('he-IL')}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${client.phone}`;
                          }}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${client.email}`;
                          }}
                        >
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

      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedClient(null);
          }}
        />
      )}

      {/* Add Client Dialog */}
      <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
        <DialogContent className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <DialogHeader className="space-y-2 mb-4">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              הוספת לקוח חדש
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              הזן את פרטי הלקוח החדש. כל השדות המסומנים ב-* הם חובה.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id_number" className="text-gray-700 dark:text-gray-300">
                תעודת זהות *
              </Label>
              <Input
                id="id_number"
                value={newClient.id_number}
                onChange={(e) => setNewClient(prev => ({ ...prev, id_number: e.target.value }))}
                className="w-full text-right bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                placeholder="הכנס מספר תעודת זהות"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-300">
                שם פרטי *
              </Label>
              <Input
                id="first_name"
                value={newClient.first_name}
                onChange={(e) => setNewClient(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full text-right bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                placeholder="הכנס שם פרטי"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-300">
                שם משפחה *
              </Label>
              <Input
                id="last_name"
                value={newClient.last_name}
                onChange={(e) => setNewClient(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full text-right bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                placeholder="הכנס שם משפחה"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                טלפון *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={newClient.phone}
                onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full text-right bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                placeholder="הכנס מספר טלפון"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                אימייל
              </Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                className="w-full text-right bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                placeholder="הכנס כתובת אימייל"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">
                סטטוס *
              </Label>
              <Select 
                value={newClient.status}
                onValueChange={(value: 'active' | 'inactive' | 'lead') => 
                  setNewClient(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-full text-right bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  <SelectItem value="active" className="text-right">פעיל</SelectItem>
                  <SelectItem value="inactive" className="text-right">לא פעיל</SelectItem>
                  <SelectItem value="lead" className="text-right">ליד</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddingClient(false)}
              className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ביטול
            </Button>
            <Button
              onClick={handleAddClient}
              disabled={!newClient.first_name || !newClient.last_name || !newClient.phone || !newClient.id_number}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              הוסף לקוח
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsTable;