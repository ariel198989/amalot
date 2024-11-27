import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Search, Phone, Mail, Calendar } from 'lucide-react';
import ClientDetails from './ClientDetails';

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

const ClientsTable = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [isAddingClient, setIsAddingClient] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // טעינת נתוני לקוחות
  const loadClients = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);

    } catch (error) {
      console.error('Error loading clients:', error);
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
      console.log('Loading details for client:', clientId);
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          sales!client_id(
            id, created_at, company, total_commission,
            sale_type,
            salary, accumulation, provision, scope_commission,
            insurance_type, monthly_premium, one_time_commission, monthly_commission,
            amount
          )
        `)
        .eq('id', clientId)
        .single();
      
      console.log('Raw client data:', clientData);

      if (clientError) throw clientError;

      // מיון המכירות לפי סוג
      const sales = clientData?.sales || [];
      const pension_sales = sales.filter(sale => sale.sale_type === 'pension');
      const insurance_sales = sales.filter(sale => sale.sale_type === 'insurance');
      const investment_sales = sales.filter(sale => sale.sale_type === 'investment');
      const policy_sales = sales.filter(sale => sale.sale_type === 'policy');

      // חישוב סיכומים
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_commission || 0), 0);
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
    return clients.filter(client => {
      const nameMatch = `${client.first_name} ${client.last_name}`
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
    </div>
  );
};

export default ClientsTable;