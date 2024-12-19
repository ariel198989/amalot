import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from '@/contexts/UserContext';
import { cn } from "@/lib/utils";
import { 
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
  Trash2, 
  Copy
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
import { XmlFileUploader } from './XmlFileUploader';

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
  raw_data?: any;
}

export default function ClientsTable() {
  const { user } = useUser();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching clients for user:', user.id);
      
      // First, fetch all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Then, fetch all XML data for these clients
      const clientIds = clientsData?.map(client => client.id) || [];
      console.log('Fetching XML data for client IDs:', clientIds);
      
      const { data: xmlData, error: xmlError } = await supabase
        .from('client_xml_data')
        .select('client_id, raw_data')
        .in('client_id', clientIds);

      if (xmlError) {
        console.error('Error fetching XML data:', xmlError);
        throw xmlError;
      }

      console.log('Fetched XML data:', xmlData);

      // Combine the data
      const transformedData = clientsData?.map(client => {
        const clientXmlData = xmlData?.find(xml => xml.client_id === client.id);
        console.log(`XML data for client ${client.id}:`, clientXmlData);
        return {
          ...client,
          raw_data: clientXmlData?.raw_data
        };
      });
      
      console.log('Fetched clients:', clientsData);
      console.log('Combined data:', transformedData);
      
      setClients(transformedData || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('שגיאה בטעינת הלקוחות');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    // בדיקה שהלקוח מופיע ברשימה
    const checkClientExists = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('clients')
        .select('id')
        .eq('id_number', '205600224') // מספר הזהות של הלקוח שאנחנו מחפשים
        .single();
        
      console.log('Client exists check:', data);
    };
    
    checkClientExists();
  }, [user]);

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

  const handleEdit = async (client: Client) => {
    try {
      setSelectedClient(client);
      // TODO: Implement edit functionality
      toast.success('מצב עריכה');
    } catch (error) {
      console.error('Error editing client:', error);
      toast.error('שגיאה בעריכת הלקוח');
    }
  };

  const handleViewDetails = async (client: Client) => {
    try {
      console.log('Viewing details for client:', client.id);
      setIsLoading(true);
      setSelectedClient(client); // Set initial client data immediately
      
      // קבלת נתוני XML עבור הלקוח
      const { data: xmlData, error } = await supabase
        .from('client_xml_data')
        .select('raw_data, created_at')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('שגיאה בטעינת נתוני מסלקה:', error);
        toast.error('שגיאה בטעינת נתוני המסלקה');
        return;
      }

      // עדכון הלקוח הנבחר עם הנתונים האחרונים
      const updatedClient = {
        ...client,
        raw_data: xmlData?.raw_data || null,
        xml_updated_at: xmlData?.created_at || null
      };
      
      console.log('Client XML data:', xmlData?.raw_data);
      setSelectedClient(updatedClient);
      setIsViewDetailsDialogOpen(true);
      
      if (xmlData?.raw_data) {
        console.log('נטענו נתוני מסלקה:', xmlData.raw_data);
        toast.success('נתוני המסלקה נטענו בהצלחה');
      } else {
        console.log('אין נתוני מסלקה זמינים');
      }
    } catch (error) {
      console.error('Error viewing client details:', error);
      toast.error('שגיאה בטעינת נתוני המסלקה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (client: Client) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק לקוח זה?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      setClients(prevClients => prevClients.filter(c => c.id !== client.id));
      toast.success('הלקוח נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('שגיאה במחיקת הלקוח');
    }
  };

  const handleCreateClient = async () => {
    try {
      if (!user) {
        toast.error('משתמש לא מחובר');
        return;
      }

      const clientData = {
        ...Object.fromEntries(
          Object.entries(newClient).map(([key, value]) => [
            key,
            typeof value === 'string' ? value.trim() || null : value
          ])
        ),
        user_id: user.id,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: client, error } = await supabase
        .from('clients')
        .insert([clientData])
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

      setClients(prevClients => [client, ...prevClients]);
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

  const handleXmlFilesExtracted = async (xmlFiles: { name: string; content: string }[], updatedClient?: Client) => {
    console.log('Extracted XML files:', xmlFiles);
    console.log('Updated/Created client:', updatedClient);
    
    if (updatedClient) {
      // עדכון מיידי של מערך הלקוחות
      setClients(prevClients => {
        const index = prevClients.findIndex(c => c.id === updatedClient.id);
        if (index !== -1) {
          // עדכון לקוח קיים
          const newClients = [...prevClients];
          newClients[index] = updatedClient;
          return newClients;
        } else {
          // הוספת לקוח חדש בתחילת הרשימה
          return [updatedClient, ...prevClients];
        }
      });
    } else {
      // אם אין לקוח מעודכן, נטען מחדש את כל הרשימה
      await fetchClients();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 space-y-6">
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
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">טוען נתונים...</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'לא נמצאו לקוחות התואמים את החיפוש' : 'אין לקוחות להצגה'}
                  </p>
                </div>
              ) : (
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
                              {client.employment_type === 'employed' ? 'שכיר' : 'עצמאי'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            {
                              'bg-green-100 text-green-800': client.status === 'active',
                              'bg-yellow-100 text-yellow-800': client.status === 'lead',
                              'bg-gray-100 text-gray-800': client.status === 'inactive'
                            }
                          )}>
                            {client.status === 'active' ? 'פעיל' :
                             client.status === 'lead' ? 'ליד' : 'לא פעיל'}
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
                            <button
                              onClick={() => handleViewDetails(client)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                              title="צפה בנתוני מסלקה"
                            >
                              <FileText className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(client.id_number)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                              title="העתק תעודת זהות"
                            >
                              <Copy className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleEdit(client)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                              title="ערוך לקוח"
                            >
                              <Edit className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(client)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                              title="מחק לקוח"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-96 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">העלאת קבצי XML</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                העלה קובץ ZIP המכיל קבצי XML לייבוא לקוחות
              </p>
            </div>
            <XmlFileUploader onXmlFilesExtracted={handleXmlFilesExtracted} />
          </div>
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
              <Label htmlFor="id_number" className="block text-right">תעוד זהות</Label>
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
              <Label htmlFor="birth_date" className="block text-right">תאריך לידה</Label>
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
                  <Label htmlFor="employer_name" className="block text-right">שם המעסי</Label>
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

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
        <DialogContent className="max-w-4xl bg-white dark:bg-gray-800" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              נתוני מסלקה - {selectedClient?.first_name} {selectedClient?.last_name}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : selectedClient?.raw_data ? (
              <div className="space-y-6">
                {/* פרטי לקוח */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">פרטי לקוח</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">שם: </span>
                      <span>{selectedClient.raw_data.lakoach['SHEM-PRATI']} {selectedClient.raw_data.lakoach['SHEM-MISHPACHA']}</span>
                    </div>
                    <div>
                      <span className="font-medium">ת.ז: </span>
                      <span>{selectedClient.raw_data.lakoach['MISPAR-ZIHUY']}</span>
                    </div>
                    <div>
                      <span className="font-medium">תאריך לידה: </span>
                      <span>{selectedClient.raw_data.lakoach['TAARICH-LEIDA']}</span>
                    </div>
                  </div>
                </div>

                {/* פרטי מעסיק */}
                {selectedClient.raw_data.maasik && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">פרטי מעסיק</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium">שם מעסיק: </span>
                        <span>{selectedClient.raw_data.maasik['SHEM-MAASIK']}</span>
                      </div>
                      <div>
                        <span className="font-medium">ח.פ/ע.מ: </span>
                        <span>{selectedClient.raw_data.maasik['MISPAR-ZIHUY-MAASIK']}</span>
                      </div>
                      <div>
                        <span className="font-medium">כתובת: </span>
                        <span>{selectedClient.raw_data.maasik['KTOVET']}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* טבלת מוצרים */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700 text-right">
                        <th className="px-4 py-2 text-sm font-semibold">סוג מוצר</th>
                        <th className="px-4 py-2 text-sm font-semibold">מספר פוליסה</th>
                        <th className="px-4 py-2 text-sm font-semibold">יצרן</th>
                        <th className="px-4 py-2 text-sm font-semibold">סטטוס</th>
                        <th className="px-4 py-2 text-sm font-semibold">צבירה</th>
                        <th className="px-4 py-2 text-sm font-semibold">דמי ניהול מצבירה</th>
                        <th className="px-4 py-2 text-sm font-semibold">דמי ניהול מהפקדה</th>
                        <th className="px-4 py-2 text-sm font-semibold">הפקדות חודשיות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedClient.raw_data.mutzarim?.map((product: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">
                            {(() => {
                              const productType = product['SUG-MUTZAR'];
                              const productTypeMap: { [key: string]: string } = {
                                '1': 'ביטוח מנהלים',
                                '2': 'פנסיה מקיפה',
                                '3': 'קופת גמל',
                                '4': 'קרן השתלמות',
                                '5': 'קופת גמל להשקעה',
                                '6': 'ביטוח חיים',
                                '7': 'קרן פנסיה כללית',
                                '8': 'קופת גמל מרכזית',
                                '9': 'קופת גמל בניהול אישי',
                                '10': 'קרן השתלמות בניהול אישי'
                              };
                              return productTypeMap[productType] || `סוג מוצר לא ידוע (${productType})`;
                            })()}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {product['MISPAR-POLISA-O-HESHBON']}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {product['SHEM-YATZRAN']}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {product['STATUS-POLISA'] === '1' ? 'פעיל' : 
                             product['STATUS-POLISA'] === '2' ? 'מוקפא' : 
                             product['STATUS-POLISA'] === '3' ? 'מבוטל' : product['STATUS-POLISA']}
                          </td>
                          <td className="px-4 py-2 text-sm text-green-600 font-medium">
                            {product['TOTAL-CHISACHON-MTZBR'] ? 
                              `₪${Number(product['TOTAL-CHISACHON-MTZBR']).toLocaleString()}` : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {product['SHEUR-DMEI-NIHUL'] ? 
                              `${product['SHEUR-DMEI-NIHUL']}%` : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {product['SHEUR-DMEI-NIHUL-HAFKADA'] ? 
                              `${product['SHEUR-DMEI-NIHUL-HAFKADA']}%` : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <div className="flex flex-col gap-1">
                              <div>
                                <span className="text-gray-500">עובד: </span>
                                <span>₪{Number(product['HAFRASHAT-OVED'] || 0).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">מעסיק: </span>
                                <span>₪{Number(product['HAFRASHAT-MAASIK'] || 0).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">פיצויים: </span>
                                <span>₪{Number(product['HAFRASHAT-PITZUIM'] || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* סיכום */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">סה"כ צבירה: </span>
                      <span className="text-green-600">
                        ₪{selectedClient.raw_data.mutzarim?.reduce((sum: number, product: any) => 
                          sum + (Number(product['TOTAL-CHISACHON-MTZBR']) || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">סה"כ הפקדה חודשית: </span>
                      <span>
                        ₪{selectedClient.raw_data.mutzarim?.reduce((sum: number, product: any) => 
                          sum + (Number(product['HAFRASHAT-OVED']) || 0) + 
                          (Number(product['HAFRASHAT-MAASIK']) || 0) + 
                          (Number(product['HAFRASHAT-PITZUIM']) || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">אין נתוני מסלקה זמינים עבור לקוח זה</p>
                <p className="text-sm text-gray-400 mt-2">נא להעלות קובץ XML כדי לצפות בנתונים</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-start gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsViewDetailsDialogOpen(false)}>
              סגור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}