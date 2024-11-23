import React, { useState } from 'react';
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

interface ClientDetailsProps {
  client: any;
  isOpen: boolean;
  onClose: () => void;
}

const ClientDetails = ({ client, isOpen, onClose }: ClientDetailsProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleUploadFiles = async () => {
    setIsLoading(true);
    try {
      for (const file of files) {
        const { error } = await supabase.storage
          .from('client-documents')
          .upload(`${client.id}/${file.name}`, file);
        
        if (error) throw error;
      }
      toast.success('הקבצים הועלו בהצלחה');
      setFiles([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('שגיאה בהעלאת הקבצים');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-4xl max-h-[85vh] overflow-y-auto p-0 rtl">
        <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-white border-b p-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
              {client.first_name[0]}{client.last_name[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {client.first_name} {client.last_name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                עודכן: {new Date(client.last_contact).toLocaleDateString('he-IL')}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <nav className="flex justify-end -mb-px space-x-4 space-x-reverse" aria-label="Tabs">
              {[
                { id: 'overview', label: 'סקירה', icon: User },
                { id: 'sales', label: 'מכירות', icon: DollarSign },
                { id: 'activities', label: 'פעילויות', icon: Activity },
                { id: 'documents', label: 'מסמכים', icon: FileText }
              ].reverse().map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center gap-1.5 py-2 px-2 border-b-2 font-medium text-sm
                    transition-all duration-200 hover:text-blue-600
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className={`
                    h-3.5 w-3.5 transition-colors
                    ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}
                  `} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="col-span-1 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4 text-blue-500" />
                      פרטי קשר
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-500">טלפון</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-medium text-sm">{client.phone}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-500">דוא"ל</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-medium text-sm">{client.email}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-500">סטטוס</label>
                      <div className="mt-1">
                        <Badge variant={
                          client.status === 'active' ? 'success' :
                          client.status === 'inactive' ? 'destructive' : 'default'
                        } className="text-xs px-2 py-0.5">
                          {client.status === 'active' ? 'פעיל' :
                           client.status === 'inactive' ? 'לא פעיל' : 'ליד'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-2 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      נתונים פיננסיים
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <p className="text-xs font-medium text-blue-600 mb-1">סה"כ מכירות</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {client.total_policies}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <p className="text-xs font-medium text-green-600 mb-1">סה"כ הכנסות</p>
                        <p className="text-2xl font-bold text-green-700">
                          ₪{client.total_revenue?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'sales' && (
              <Card>
                <CardHeader>
                  <CardTitle>מכירות</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {client.pension_sales?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-4">פנסיה</h3>
                        <div className="space-y-2">
                          {client.pension_sales.map((sale: any) => (
                            <div key={sale.id} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between">
                                <span>{sale.company}</span>
                                <span className="font-medium">₪{sale.total_commission.toLocaleString()}</span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {new Date(sale.date).toLocaleDateString('he-IL')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* ... Similar sections for other sale types ... */}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'activities' && (
              <Card>
                <CardHeader>
                  <CardTitle>פעילויות</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* ... existing activities content ... */}
                </CardContent>
              </Card>
            )}

            {activeTab === 'documents' && (
              <Card>
                <CardHeader>
                  <CardTitle>מסמכים</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                        בחר קבצים
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {files.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">קבצים שנבחרו:</h4>
                        <div className="space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span>{file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                              >
                                הסר
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          className="mt-4"
                          onClick={handleUploadFiles}
                          disabled={isLoading}
                        >
                          {isLoading ? 'מעלה...' : 'העלה קבצים'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetails; 