import React, { useState, useEffect } from 'react';
import { Upload, Phone, Mail, Calendar, FileText, Activity, DollarSign, User } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  useEffect(() => {
    if (isOpen && client) {
      loadClientData();
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
        .single();

      if (financialError) throw financialError;
      setFinancialDetails(financialData);

    } catch (error) {
      console.error('Error loading client data:', error);
      toast.error('שגיאה בטעינת נתוני הלקוח');
    } finally {
      setIsLoadingDetails(false);
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>פרטי לקוח: {client.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
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
            {renderActivitiesTab()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetails;
