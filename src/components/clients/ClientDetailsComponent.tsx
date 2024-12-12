import React, { useState, useEffect } from 'react';
import { Upload, Phone, Mail, Calendar, FileText, Activity, DollarSign, User, Building2, ArrowRight } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

import { 
  ClientDetailsProps, 
  ClientFile, 
  ClientActivity,
  ClientFinancialDetails,
  CustomerJourney
} from './ClientDetailsTypes';

import { 
  uploadClientFiles, 
  fetchClientActivities, 
  createClientActivity 
} from './ClientDetailsHelpers';

const ClientDetails = ({ client, isOpen, onClose }: ClientDetailsProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [existingFiles, setExistingFiles] = useState<ClientFile[]>([]);
  const [financialDetails, setFinancialDetails] = useState<ClientFinancialDetails | null>(null);
  const [journeys, setJourneys] = useState<CustomerJourney[]>([]);

  useEffect(() => {
    if (isOpen && client) {
      loadClientData();
      loadJourneyData();
    }
  }, [isOpen, client]);

  const loadClientData = async () => {
    setIsLoadingDetails(true);
    try {
      // טעינת קבצים קיימים
      const { data: filesData, error: filesError } = await supabase
        .from('client_files')
        .select('*')
        .eq('client_id', client.id);

      if (filesError) throw filesError;
      setExistingFiles(filesData);

      // טעינת פעילויות
      const loadedActivities = await fetchClientActivities(client.id);
      setActivities(loadedActivities);

      // טעינת פרטים פיננסיים
      const { data: financialData, error: financialError } = await supabase
        .from('client_financial_details')
        .select('*')
        .eq('client_id', client.id)
        .maybeSingle();

      if (financialError && financialError.code !== 'PGRST116') {
        throw financialError;
      }
      setFinancialDetails(financialData || null);

    } catch (error) {
      console.error('Error loading client data:', error);
      toast.error('שגיאה בטעינת נתוני הלקוח');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const loadJourneyData = async () => {
    try {
      const { data: journeyData, error } = await supabase
        .from('customer_journeys')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJourneys(journeyData || []);
    } catch (error) {
      console.error('Error loading journey data:', error);
      toast.error('שגיאה בטעינת נתוני מסע לקוח');
    }
  };

  const getProductTypeDisplay = (type: string) => {
    const types = {
      pension: 'פנסיה',
      insurance: 'ביטוח',
      investment: 'השקעות',
      policy: 'פוליסה',
      service: 'שירות',
      finance: 'פיננסים'
    };
    return types[type] || type;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => 
        file.type === 'application/pdf' || 
        file.type.startsWith('image/')
      );
      
      if (validFiles.length !== newFiles.length) {
        toast.error('ניתן להעלות רק קבצי PDF ותמונות');
      }
      
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleUploadFiles = async () => {
    setIsLoading(true);
    try {
      const uploadedFiles = await uploadClientFiles(files, client.id);
      setExistingFiles(prev => [...prev, ...uploadedFiles]);
      setFiles([]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderOverviewTab = () => (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>פרטים אישיים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-2">
            <User className="h-5 w-5 text-gray-500" />
            <span>{client.name}</span>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <Phone className="h-5 w-5 text-gray-500" />
            <span>{client.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-gray-500" />
            <span>{client.email}</span>
          </div>
        </CardContent>
      </Card>

      {financialDetails && (
        <Card>
          <CardHeader>
            <CardTitle>מצב פיננסי</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span>סך נכסים:</span>
              <span>₪{financialDetails.total_assets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>סך התחייבויות:</span>
              <span>₪{financialDetails.total_liabilities.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>שווי נקי:</span>
              <span>₪{financialDetails.net_worth.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDocumentsTab = () => (
    <div>
      <div className="flex items-center mb-4">
        <input 
          type="file" 
          multiple 
          onChange={handleFileChange} 
          className="hidden" 
          id="file-upload" 
          accept=".pdf,image/*"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button variant="outline">
            <Upload className="h-4 w-4 ml-2" />
            העלאת מסמכים
          </Button>
        </label>
        {files.length > 0 && (
          <Button 
            onClick={handleUploadFiles} 
            disabled={isLoading}
            className="ml-2"
          >
            {isLoading ? 'מעלה...' : 'אישור העלאה'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {existingFiles.map((file) => (
          <Card key={file.id}>
            <CardContent className="pt-4 flex flex-col items-center">
              <FileText className="h-12 w-12 text-gray-500 mb-2" />
              <p className="text-sm truncate max-w-full">{file.file_name}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => window.open(file.file_url, '_blank')}
              >
                הצג מסמך
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderActivitiesTab = () => (
    <div>
      {activities.map((activity) => (
        <Card key={activity.id} className="mb-2">
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Activity className="h-6 w-6 text-gray-500" />
              <div>
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge variant="secondary">{activity.activity_type}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800 w-[600px] max-h-[600px] overflow-hidden flex flex-col p-4 rounded-lg shadow-lg">
        <DialogHeader className="pb-3 border-b dark:border-gray-700">
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
            {client?.first_name} {client?.last_name}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            צפייה ועריכה של פרטי הלקוח, מסמכים ופעילויות
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-3">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-3 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <TabsTrigger 
                value="overview"
                className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
              >
                מידע כללי
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
              >
                מסמכים
              </TabsTrigger>
              <TabsTrigger 
                value="activities"
                className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
              >
                פעילויות
              </TabsTrigger>
              <TabsTrigger 
                value="financial"
                className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
              >
                פרטים פיננסיים
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-3">
              <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-900 dark:text-white">פרטים אישיים</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 pt-0">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">שם מלא</p>
                    <p className="text-sm text-gray-900 dark:text-white">{client?.first_name} {client?.last_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">תעודת זהות</p>
                    <p className="text-sm text-gray-900 dark:text-white">{client?.id_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">טלפון</p>
                    <p className="text-sm text-gray-900 dark:text-white">{client?.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">אימייל</p>
                    <p className="text-sm text-gray-900 dark:text-white">{client?.email}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-3">
              {/* תוכן הקבצים */}
            </TabsContent>

            <TabsContent value="activities" className="space-y-3">
              <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-900 dark:text-white">מסעות לקוח</CardTitle>
                  <CardDescription>היסטוריית מסעות הלקוח ופעילויות</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {journeys.length > 0 ? (
                    journeys.map((journey) => (
                      <div 
                        key={journey.id} 
                        className="border dark:border-gray-700 rounded-lg p-3 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {format(new Date(journey.created_at), 'dd/MM/yyyy', { locale: he })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              סה"כ: ₪{journey.amount?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-900 dark:text-white">
                              {getProductTypeDisplay(journey.product_type)}
                            </span>
                            {journey.notes && (
                              <>
                                <span className="text-gray-500">|</span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {journey.notes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        לא נמצאו מסעות לקוח
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-3">
              {/* תוכן פיננסי */}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetails;
