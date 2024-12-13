import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from '@/contexts/UserContext';
import { cn } from "@/lib/utils";
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  CreditCard, 
  MapPin, 
  Briefcase, 
  Edit, 
  FileText, 
  Trash2 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  created_at: string;
  last_contact: string;
  id_number: string;
  address_street: string;
  address_city: string;
  employment_type: 'employed' | 'self-employed';
  employer_name: string;
  employer_position: string;
  employer_address: string;
  employer_start_date: string;
  business_name: string;
  business_type: string;
  business_address: string;
  business_start_date: string;
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
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    id_number: '',
    email: '',
    phone: '',
    birth_date: '',
    address_street: '',
    address_city: '',
    employment_type: 'employed' as 'employed' | 'self-employed',
    employer_name: '',
    employer_position: '',
    employer_address: '',
    employer_start_date: '',
    business_name: '',
    business_type: '',
    business_address: '',
    business_start_date: ''
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
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const searchLower = searchQuery.toLowerCase();
      return (
        client.first_name?.toLowerCase().includes(searchLower) ||
        client.last_name?.toLowerCase().includes(searchLower) ||
        client.phone?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.id_number?.toLowerCase().includes(searchLower)
      );
    });
  }, [clients, searchQuery]);

  const handleRowClick = async (client: Client) => {
    try {
      setIsLoadingDetails(true);
      await loadClientDetails(client.id);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error in handleRowClick:', error);
      toast.error('שגיאה בטעינת פר��י הלקוח');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCreateClient = async () => {
    try {
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      // Validate required fields
      if (!newClient.first_name || !newClient.last_name || !newClient.phone || !newClient.id_number) {
        toast.error('נא למלא את כל שדות החובה');
        return;
      }

      // Format dates or set to null if empty
      const formatDate = (dateStr: string) => dateStr ? dateStr : null;

      const { data: client, error } = await supabase
        .from('clients')
        .insert([
          {
            user_id: user.id,
            first_name: newClient.first_name.trim(),
            last_name: newClient.last_name.trim(),
            phone: newClient.phone.trim(),
            email: newClient.email.trim(),
            id_number: newClient.id_number.trim(),
            birth_date: formatDate(newClient.birth_date),
            address_street: newClient.address_street.trim(),
            address_city: newClient.address_city.trim(),
            employment_type: newClient.employment_type,
            employer_name: newClient.employment_type === 'employed' ? newClient.employer_name.trim() : null,
            employer_position: newClient.employment_type === 'employed' ? newClient.employer_position.trim() : null,
            employer_address: newClient.employment_type === 'employed' ? newClient.employer_address.trim() : null,
            employer_start_date: newClient.employment_type === 'employed' ? formatDate(newClient.employer_start_date) : null,
            business_name: newClient.employment_type === 'self-employed' ? newClient.business_name.trim() : null,
            business_type: newClient.employment_type === 'self-employed' ? newClient.business_type.trim() : null,
            business_address: newClient.employment_type === 'self-employed' ? newClient.business_address.trim() : null,
            business_start_date: newClient.employment_type === 'self-employed' ? formatDate(newClient.business_start_date) : null,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        if (error.code === '23505') {
          toast.error('תעודת זהות כבר קיימת במערכת');
        } else {
          toast.error('אירעה שגיאה ביצירת הלקוח');
        }
        return;
      }

      setClients(prevClients => [...prevClients, client]);
      setIsCreateDialogOpen(false);
      setNewClient({
        first_name: '',
        last_name: '',
        id_number: '',
        email: '',
        phone: '',
        birth_date: '',
        address_street: '',
        address_city: '',
        employment_type: 'employed',
        employer_name: '',
        employer_position: '',
        employer_address: '',
        employer_start_date: '',
        business_name: '',
        business_type: '',
        business_address: '',
        business_start_date: ''
      });
      toast.success('הלקוח נוצר בהצלחה');
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('אירעה שגיאה ביצירת הלקוח');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header with Add Client Button */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ניהול לקוחות</h1>
          <p className="text-gray-500 dark:text-gray-400">ניהול וצפייה בכל הלקוחות שלך</p>
        </div>
        <div className="flex gap-4 items-center">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            הוספת לקוח חדש
          </Button>
          <div className="relative">
            <Input
              type="text"
              placeholder="חיפוש לקוחות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-4 pr-10 text-right"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200 text-right">שם מלא</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200 text-right">טלפון</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200 text-right">אימייל</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200 text-right">תעודת זהות</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200 text-right">כתובת</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200 text-right">תעסוקה</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200 text-right">סטטוס</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200 text-right">תאריך הצטרפות</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-200 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <tr 
                  key={client.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {client.first_name} {client.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{client.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{client.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{client.id_number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {client.address_city && client.address_street ? 
                          `${client.address_city}, ${client.address_street}` : 
                          'לא צוין'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {client.employment_type === 'employed' ? 
                          `שכיר - ${client.employer_name || ''}` : 
                          client.employment_type === 'self-employed' ? 
                          `עצמאי - ${client.business_name || ''}` : 
                          'לא צוין'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      client.status === 'active' ? "bg-green-100 text-green-800" :
                      client.status === 'inactive' ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    )}>
                      {client.status === 'active' ? 'פעיל' :
                       client.status === 'inactive' ? 'לא פעיל' : 'ליד'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(client.created_at).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(client)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetails(client)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FileText className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(client.id)}
                        className="hover:bg-red-100 dark:hover:bg-red-900"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl bg-white dark:bg-gray-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">הוספת לקוח חדש</DialogTitle>
            <DialogDescription className="text-right">
              מלא את הפרטים הבאים להוספת לקוח חדש למערכת
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="block text-right">שם פרטי</Label>
              <Input
                id="first_name"
                value={newClient.first_name}
                onChange={(e) => setNewClient(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="block text-right">שם משפחה</Label>
              <Input
                id="last_name"
                value={newClient.last_name}
                onChange={(e) => setNewClient(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number" className="block text-right">תעודת זהות</Label>
              <Input
                id="id_number"
                value={newClient.id_number}
                onChange={(e) => setNewClient(prev => ({ ...prev, id_number: e.target.value }))}
                className="w-full text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="block text-right">טלפון</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="block text-right">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                className="w-full text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date" className="block text-right">תארי�� לידה</Label>
              <Input
                id="birth_date"
                type="date"
                value={newClient.birth_date}
                onChange={(e) => setNewClient(prev => ({ ...prev, birth_date: e.target.value }))}
                className="w-full text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_street" className="block text-right">רחוב</Label>
              <Input
                id="address_street"
                value={newClient.address_street}
                onChange={(e) => setNewClient(prev => ({ ...prev, address_street: e.target.value }))}
                className="w-full text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_city" className="block text-right">עיר</Label>
              <Input
                id="address_city"
                value={newClient.address_city}
                onChange={(e) => setNewClient(prev => ({ ...prev, address_city: e.target.value }))}
                className="w-full text-right"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="block text-right">סוג תעסוקה</Label>
              <div className="flex gap-4 justify-end">
                <div className="flex items-center gap-2">
                  <Label htmlFor="employed" className="text-right">שכיר</Label>
                  <input
                    id="employed"
                    type="radio"
                    name="employment_type"
                    value="employed"
                    checked={newClient.employment_type === 'employed'}
                    onChange={(e) => setNewClient(prev => ({
                      ...prev,
                      employment_type: e.target.value as 'employed' | 'self-employed'
                    }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="self-employed" className="text-right">עצמאי</Label>
                  <input
                    id="self-employed"
                    type="radio"
                    name="employment_type"
                    value="self-employed"
                    checked={newClient.employment_type === 'self-employed'}
                    onChange={(e) => setNewClient(prev => ({
                      ...prev,
                      employment_type: e.target.value as 'employed' | 'self-employed'
                    }))}
                  />
                </div>
              </div>
            </div>

            {newClient.employment_type === 'employed' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="employer_name" className="block text-right">שם המעסיק</Label>
                  <Input
                    id="employer_name"
                    value={newClient.employer_name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, employer_name: e.target.value }))}
                    className="w-full text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer_position" className="block text-right">תפקיד</Label>
                  <Input
                    id="employer_position"
                    value={newClient.employer_position}
                    onChange={(e) => setNewClient(prev => ({ ...prev, employer_position: e.target.value }))}
                    className="w-full text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer_address" className="block text-right">כתובת מקום העבודה</Label>
                  <Input
                    id="employer_address"
                    value={newClient.employer_address}
                    onChange={(e) => setNewClient(prev => ({ ...prev, employer_address: e.target.value }))}
                    className="w-full text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer_start_date" className="block text-right">תאריך תחילת עבודה</Label>
                  <Input
                    id="employer_start_date"
                    type="date"
                    value={newClient.employer_start_date}
                    onChange={(e) => setNewClient(prev => ({ ...prev, employer_start_date: e.target.value }))}
                    className="w-full text-right"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="business_name" className="block text-right">שם העסק</Label>
                  <Input
                    id="business_name"
                    value={newClient.business_name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, business_name: e.target.value }))}
                    className="w-full text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_type" className="block text-right">סוג העסק</Label>
                  <Input
                    id="business_type"
                    value={newClient.business_type}
                    onChange={(e) => setNewClient(prev => ({ ...prev, business_type: e.target.value }))}
                    className="w-full text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_address" className="block text-right">כתובת העסק</Label>
                  <Input
                    id="business_address"
                    value={newClient.business_address}
                    onChange={(e) => setNewClient(prev => ({ ...prev, business_address: e.target.value }))}
                    className="w-full text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_start_date" className="block text-right">תאריך תחילת פעילות</Label>
                  <Input
                    id="business_start_date"
                    type="date"
                    value={newClient.business_start_date}
                    onChange={(e) => setNewClient(prev => ({ ...prev, business_start_date: e.target.value }))}
                    className="w-full text-right"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex justify-start gap-2 mt-6">
            <Button onClick={handleCreateClient} className="bg-blue-600 hover:bg-blue-700 text-white">
              הוסף לקוח
            </Button>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              ביטול
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsTable;