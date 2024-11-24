import React from 'react';
import { clientService } from '@/services/clientService';
import { Client } from '@/types/client';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'react-hot-toast';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  Search,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface EditClientDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Partial<Client>) => Promise<void>;
}

const EditClientDialog: React.FC<EditClientDialogProps> = ({ client, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    first_name: '',
    last_name: '',
    id_number: '',
    email: '',
    phone: ''
  });

  React.useEffect(() => {
    if (client) {
      setFormData({
        first_name: client.first_name,
        last_name: client.last_name,
        id_number: client.id_number || '',
        email: client.email || '',
        phone: client.phone || ''
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onClose();
      toast.success('פרטי הלקוח עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('אירעה שגיאה בעדכון פרטי הלקוח');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>עריכת פרטי לקוח</DialogTitle>
          <DialogDescription>עדכן את פרטי הלקוח</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">שם פרטי</label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">שם משפחה</label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">תעודת זהות</label>
            <Input
              value={formData.id_number}
              onChange={(e) => setFormData(prev => ({ ...prev, id_number: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">אימייל</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">טלפון</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="submit">שמור שינויים</Button>
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ClientsPage = () => {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // טעינת רשימת הלקוחות
  const loadClients = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        return;
      }
      
      console.log('Loading clients for user:', user.id);
      const clients = await clientService.getClientsByAgent(user.id);
      console.log('Loaded clients:', clients);
      setClients(clients);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('אירעה שגיאה בטעינת הלקוחות');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadClients();
  }, [loadClients]);

  // פילטור לקוחות לפי חיפוש
  const filteredClients = React.useMemo(() => {
    return clients.filter(client => 
      `${client.first_name} ${client.last_name}`.includes(searchTerm) ||
      client.id_number?.includes(searchTerm) ||
      client.phone?.includes(searchTerm) ||
      client.email?.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const handleEditClient = async (updatedData: Partial<Client>) => {
    if (!selectedClient) return;
    
    try {
      await clientService.updateClient(selectedClient.id, updatedData);
      await loadClients(); // טעינה מחדש של הרשימה
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const loadClientData = async (clientId: string) => {
    const [
      { data: pensionData },
      { data: insuranceData },
      { data: investmentData },
      { data: policyData }
    ] = await Promise.all([
      supabase.from('pension_sales').select('*').eq('client_id', clientId),
      supabase.from('insurance_sales').select('*').eq('client_id', clientId),
      supabase.from('investment_sales').select('*').eq('client_id', clientId),
      supabase.from('policy_sales').select('*').eq('client_id', clientId)
    ]);

    return {
      pensionSales: pensionData || [],
      insuranceSales: insuranceData || [],
      investmentSales: investmentData || [],
      policySales: policyData || []
    };
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const confirmed = window.confirm(
        'האם אתה בטוח שברצונך למחוק את הלקוח? פעולה זו תמחק גם את כל המכירות המשויכות ללקוח זה.'
      );
      
      if (!confirmed) return;

      await clientService.deleteClient(clientId);
      await loadClients(); // טעינה מחדש של הרשימה
      toast.success('הלקוח נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('אירעה שגיאה במחיקת הלקוח');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* כותרת ראשית */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white mb-8">
        <h1 className="text-3xl font-bold">ניהול לקוחות</h1>
        <p className="mt-2 text-blue-100">ניהול וצפייה בפרטי הלקוחות שלך</p>
      </div>

      {/* חיפוש */}
      <Card className="border-2 border-blue-100">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="חפש לפי שם, ת.ז, טלפון או אימייל..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* רשימת לקוחות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="border-2 border-gray-100 hover:border-blue-200 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">
                  {client.first_name} {client.last_name}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  {client.id_number}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {client.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  עדכון אחרון: {new Date(client.last_contact).toLocaleDateString('he-IL')}
                </div>
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <DollarSign className="h-4 w-4" />
                  סה"כ עמלות: ₪{client.total_commission?.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* מצב טעינה */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען נתונים...</p>
        </div>
      )}

      {/* אין תוצאות */}
      {!loading && filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">לא נמצאו לקוחות</p>
        </div>
      )}

      <EditClientDialog
        client={selectedClient}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedClient(null);
        }}
        onSave={handleEditClient}
      />
    </div>
  );
};

export default ClientsPage; 