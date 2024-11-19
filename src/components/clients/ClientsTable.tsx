import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users, Plus, Search, Filter, MoreVertical, Phone, Mail, Calendar,
  MapPin, Tag, AlertCircle, Clock, FileText, Activity, Bell
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  total_revenue: number;
  total_policies: number;
  last_contact: string;
  tags: string[];
}

interface ClientActivity {
  id: string;
  activity_type: string;
  description: string;
  date: string;
  next_follow_up: string;
  status: string;
}

interface NewClientData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  notes?: string;
}

const ClientsTable: React.FC = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [activities, setActivities] = React.useState<ClientActivity[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [isAddingClient, setIsAddingClient] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [newClientData, setNewClientData] = React.useState<NewClientData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'active',
    notes: ''
  });

  // טעינת נתוני לקוחות
  React.useEffect(() => {
    loadClients();
  }, [searchTerm, filterStatus]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // טעינת לקוחות בסיסית
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // העשרת הנתונים עם מידע על מכירות
      const enrichedClients = await Promise.all(clientsData.map(async (client) => {
        const fullName = `${client.first_name} ${client.last_name}`;
        
        // טעינת כל סוגי המכירות במקביל
        const [pensionData, insuranceData, investmentData, policyData] = await Promise.all([
          supabase
            .from('pension_sales')
            .select('total_commission')
            .eq('user_id', user.id)
            .eq('client_name', fullName),
          supabase
            .from('insurance_sales')
            .select('total_commission')
            .eq('user_id', user.id)
            .eq('client_name', fullName),
          supabase
            .from('investment_sales')
            .select('total_commission')
            .eq('user_id', user.id)
            .eq('client_name', fullName),
          supabase
            .from('policy_sales')
            .select('total_commission')
            .eq('user_id', user.id)
            .eq('client_name', fullName)
        ]);

        const totalRevenue = [
          ...(pensionData.data || []),
          ...(insuranceData.data || []),
          ...(investmentData.data || []),
          ...(policyData.data || [])
        ].reduce((sum, sale) => sum + (sale?.total_commission || 0), 0);

        const totalPolicies = [
          pensionData.data?.length || 0,
          insuranceData.data?.length || 0,
          investmentData.data?.length || 0,
          policyData.data?.length || 0
        ].reduce((sum, count) => sum + count, 0);

        return {
          ...client,
          total_revenue: totalRevenue,
          total_policies: totalPolicies
        };
      }));

      setClients(enrichedClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('שגיאה בטעינת נתוני לקוחות');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClientActivities = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_activities')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('שגיאה בטעינת פעילויות');
    }
  };

  const handleAddClient = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      const { error } = await supabase
        .from('clients')
        .insert([
          {
            ...newClientData,
            user_id: user.id,
            created_at: new Date().toISOString(),
            last_contact: new Date().toISOString().split('T')[0]
          }
        ]);

      if (error) throw error;

      toast.success('הלקוח נוסף בהצלחה');
      setIsAddingClient(false);
      setNewClientData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        status: 'active',
        notes: ''
      });
      loadClients(); // טעינה מחדש של רשימת הלקוחות

    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('אירעה שגיאה בהוספת הלקוח');
    }
  };

  const handleUpdateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setClients(prev => prev.map(client => 
        client.id === id ? { ...client, ...updates } : client
      ));
      toast.success('פרטי הלקוח עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('שגיאה בעדכון פרטי הלקוח');
    }
  };

  const handleAddActivity = async (clientId: string, activityData: Partial<ClientActivity>) => {
    try {
      const { data, error } = await supabase
        .from('client_activities')
        .insert([{ ...activityData, client_id: clientId }])
        .select()
        .single();

      if (error) throw error;
      
      setActivities(prev => [data, ...prev]);
      toast.success('פעילות נוספה בהצלחה');
    } catch (error) {
      console.error('Error adding activity:', error);
      toast.error('שגיאה בהוספת פעילות');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">ניהול לקוחות</h1>
            <p className="mt-2 text-blue-100">ניהול וצפייה בכל הלקוחות שלך</p>
          </div>
          <Button 
            onClick={() => setIsAddingClient(true)}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            הוסף לקוח חדש
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100">סה"כ לקוחות</p>
                <h3 className="text-2xl font-bold mt-1">{clients.length}</h3>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-100" />
              </div>
            </div>
          </div>
          {/* Add more stat cards here */}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="חיפוש לקוחות..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            prefix={<Search className="h-4 w-4 text-gray-400" />}
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 p-2"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="active">פעיל</option>
            <option value="inactive">לא פעיל</option>
            <option value="lead">ליד</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">שם</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">טלפון</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">אימייל</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">סטטוס</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">תיקים</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">הכנסות</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="border-b hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setSelectedClient(client);
                      loadClientActivities(client.id);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {client.first_name[0]}{client.last_name[0]}
                        </div>
                        <div className="mr-4">
                          <div className="font-medium">{`${client.first_name} ${client.last_name}`}</div>
                          <div className="text-sm text-gray-500">
                            עודכן לאחרונה: {format(new Date(client.last_contact), 'dd/MM/yyyy', { locale: he })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{client.phone}</td>
                    <td className="px-6 py-4">{client.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        client.status === 'active' ? 'success' :
                        client.status === 'inactive' ? 'destructive' : 'default'
                      }>
                        {client.status === 'active' ? 'פעיל' :
                         client.status === 'inactive' ? 'לא פעיל' : 'ליד'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{client.total_policies}</td>
                    <td className="px-6 py-4">₪{client.total_revenue.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            התקשר
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            שלח מייל
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            קבע פגישה
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>פרטי לקוח</DialogTitle>
          </DialogHeader>
          
          {selectedClient && (
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">פרטים</TabsTrigger>
                <TabsTrigger value="activities">פעילויות</TabsTrigger>
                <TabsTrigger value="policies">תיקים</TabsTrigger>
                <TabsTrigger value="reminders">תזכורות</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                {/* Client Details Form */}
              </TabsContent>

              <TabsContent value="activities">
                <div className="space-y-4">
                  <Button
                    onClick={() => {/* Add activity logic */}}
                    className="mb-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    הוסף פעילות
                  </Button>

                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <Card key={activity.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{activity.activity_type}</h4>
                              <p className="text-sm text-gray-500">{activity.description}</p>
                            </div>
                            <Badge>{activity.status}</Badge>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            {format(new Date(activity.date), 'dd/MM/yyyy HH:mm', { locale: he })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="policies">
                {/* Policies List */}
              </TabsContent>

              <TabsContent value="reminders">
                {/* Reminders List */}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
        <DialogContent className="bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">הוספת לקוח חדש</DialogTitle>
            <DialogDescription>הזן את פרטי הלקוח החדש</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">שם פרטי</label>
                <Input
                  value={newClientData.first_name}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="הכנס שם פרטי"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">שם משפחה</label>
                <Input
                  value={newClientData.last_name}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="הכנס שם משפחה"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">אימייל</label>
              <Input
                type="email"
                value={newClientData.email}
                onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="הכנס כתובת אימייל"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">טלפון</label>
              <Input
                value={newClientData.phone}
                onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="הכנס מספר טלפון"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">סטטוס</label>
              <Select
                value={newClientData.status}
                onValueChange={(value: 'active' | 'inactive' | 'lead') => 
                  setNewClientData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">פעיל</SelectItem>
                  <SelectItem value="inactive">לא פעיל</SelectItem>
                  <SelectItem value="lead">ליד</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">הערות</label>
              <textarea
                value={newClientData.notes}
                onChange={(e) => setNewClientData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="הכנס הערות"
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddingClient(false)}
            >
              ביטול
            </Button>
            <Button
              onClick={handleAddClient}
              className="bg-blue-600 hover:bg-blue-700"
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