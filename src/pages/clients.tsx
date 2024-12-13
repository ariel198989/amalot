import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { XmlFileUploader } from '@/components/clients/XmlFileUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { XmlImportService } from '@/services/XmlImportService';
import { toast } from 'sonner';

interface XmlFile {
  name: string;
  content: string;
}

const xmlImportService = new XmlImportService();

export default function ClientsPage() {
  const [xmlFiles, setXmlFiles] = useState<XmlFile[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const handleXmlFilesExtracted = (files: XmlFile[]) => {
    setXmlFiles(files);
    try {
      const processedFiles = xmlImportService.processXmlFiles(files);
      setParsedData(processedFiles);
      console.log('Processed XML files:', processedFiles);
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

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">ייבוא נתונים</TabsTrigger>
          <TabsTrigger value="list">רשימת לקוחות</TabsTrigger>
        </TabsList>

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

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">רשימת לקוחות</h2>
            </CardHeader>
            <CardContent>
              {/* Your existing clients table or list component can go here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 