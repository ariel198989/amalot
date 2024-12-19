import React, { useState, useEffect } from 'react';
import { Upload, Phone, Mail, FileText, Activity, User } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

import { 
  ClientDetailsProps, 
  ClientFile, 
  ClientActivity,
  ClientFinancialDetails
} from './ClientDetailsTypes';

import { 
  uploadClientFiles, 
  fetchClientActivities
} from './ClientDetailsHelpers';

const ClientDetails = ({ client, isOpen, onClose }: ClientDetailsProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [existingFiles, setExistingFiles] = useState<ClientFile[]>([]);
  const [financialDetails, setFinancialDetails] = useState<ClientFinancialDetails | null>(null);

  useEffect(() => {
    if (isOpen && client) {
      loadClientData();
      loadJourneyData();
    }
  }, [isOpen, client]);

  const loadClientData = async () => {
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
    }
  };

  const loadJourneyData = async () => {
    try {
      const { error } = await supabase
        .from('customer_journeys')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
    } catch (error) {
      console.error('Error loading journey data:', error);
      toast.error('שגיאה בטעינת נתוני מסע לקוח');
    }
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>פרטי לקוח</DialogTitle>
          <DialogDescription>
            צפייה ועריכת פרטי הלקוח
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
            <TabsTrigger value="documents">מסמכים</TabsTrigger>
            <TabsTrigger value="activities">פעילויות</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="documents">
            {renderDocumentsTab()}
          </TabsContent>

          <TabsContent value="activities">
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-gray-500" />
                      <span>{activity.description}</span>
                      <Badge>{activity.activity_type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetails;
