import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { XmlFileUploader } from '@/components/clients/XmlFileUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { XmlImportService } from '@/services/XmlImportService';
import { toast } from 'react-hot-toast';
import ClientsTable from '@/components/clients/ClientsTable';
import { supabase } from '@/lib/supabase';
import { Client } from '@/types/clearing-house';

interface XmlFile {
  name: string;
  content: string;
}

interface ClientsTableProps {
  data: Client[];
}

const xmlImportService = new XmlImportService();

export default function ClientsPage() {
  const [xmlFiles, setXmlFiles] = useState<XmlFile[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeTab, setActiveTab] = useState('list');

  const fetchClients = async () => {
    console.log('Fetching clients...');
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) {
      console.error('Error fetching clients:', error);
      toast.error('שגיאה בטעינת הלקוחות');
      return;
    }

    console.log('Fetched clients:', data);
    if (data) {
      // וודא שיש לכל לקוח את כל השדות הנדרשים
      const validClients = data.map(client => ({
        ...client,
        id: client.id || '',
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        id_number: client.id_number || '',
        email: client.email || '',
        phone: client.phone || '',
        products: client.products || []
      }));
      setClients(validClients);
      console.log('Processed clients:', validClients);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleXmlFilesExtracted = async (files: XmlFile[]) => {
    console.log('Processing XML files:', files);
    setXmlFiles(files);
    try {
      const processedFiles = xmlImportService.processXmlFiles(files);
      console.log('Processed files:', processedFiles);
      setParsedData(processedFiles);
      await fetchClients();
    } catch (error) {
      console.error('Error processing XML files:', error);
      toast.error('שגיאה בעיבוד קבצי ה-XML');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">לקוחות</h1>
        <p className="text-gray-500 mt-1">ניהול וייבוא נתוני לקוחות</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">רשימת לקוחות</TabsTrigger>
          <TabsTrigger value="import">ייבוא נתונים</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">רשימת לקוחות</h2>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <ClientsTable data={clients} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  לא נמצאו לקוחות. אנא ייבא קבצי XML כדי להוסיף לקוחות.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">ייבוא קבצי XML</h2>
              <p className="text-sm text-gray-500">
                העלה קובץ ZIP המכיל קבצי XML לייבוא נתוני לקוחות
              </p>
            </CardHeader>
            <CardContent>
              <XmlFileUploader onXmlFilesExtracted={handleXmlFilesExtracted} />

              {xmlFiles.length > 0 && (
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">קבצים שנמצאו:</h3>
                    <div className="space-y-2">
                      {xmlFiles.map((file, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                        >
                          <span className="font-medium">{file.name}</span>
                          <span className="text-sm text-gray-500">
                            {(file.content.length / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {parsedData.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">נתונים שחולצו:</h3>
                      <div className="space-y-2">
                        {parsedData.map((item, index) => (
                          <div
                            key={index}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <pre className="text-sm overflow-auto">
                              {JSON.stringify(item.data, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 