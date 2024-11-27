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
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);

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
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${client.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('client-documents')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('client_documents')
          .insert({
            client_id: client.id,
            file_name: file.name,
            file_type: file.type,
            file_path: fileName,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (dbError) throw dbError;
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

  const loadExistingFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', client.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setExistingFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-3xl max-h-[80vh] overflow-y-auto p-0 rtl">
        <DialogHeader>
          <DialogTitle className="sr-only">פרטי לקוח</DialogTitle>
        </DialogHeader>
        <div className="sticky top-0 z-50 bg-gradient-to-l from-blue-50 to-white border-b p-3">
          <div className="flex flex-row-reverse items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
              {client.first_name[0]}{client.last_name[0]}
            </div>
            <div className="flex-1 text-right">
              <h2 className="text-xl font-bold text-gray-900">
                {client.first_name} {client.last_name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 justify-end">
                עודכן: {new Date(client.last_contact).toLocaleDateString('he-IL')}
                <Calendar className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <nav className="flex justify-end -mb-px space-x-4 space-x-reverse" aria-label="Tabs">
              {[/* eslint-disable @typescript-eslint/no-unused-vars */
                { id: 'overview', label: 'סקירה', icon: User },
                { id: 'sales', label: 'מכירות', icon: DollarSign },
                { id: 'activities', label: 'המלצות', icon: Activity },
                { id: 'documents', label: 'מסמכים', icon: FileText }
              ].reverse().map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex flex-row-reverse items-center gap-1.5 py-2 px-2 border-b-2 font-medium text-sm
                    transition-all duration-200 hover:text-blue-600
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  <tab.icon className={`
                    h-3.5 w-3.5 transition-colors
                    ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}
                  `} />
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {isLoadingDetails ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">טוען נתונים...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-3 gap-4 min-h-[400px]">
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
                  </div>
                )}

                {activeTab === 'sales' && (
                  <Card className="min-h-[400px]">
                    <CardHeader className="text-right">
                      <CardTitle className="flex items-center gap-2 justify-end">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        מכירות
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Pension Sales */}
                        {client.pension_sales?.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-4 text-right">פנסיה</h3>
                            <div className="space-y-2">
                              {client.pension_sales.map((sale: any) => (
                                <div key={sale.id} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <div className="text-left">
                                      <div className="font-medium text-green-600">
                                        ₪{sale.total_commission?.toLocaleString()}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {new Date(sale.created_at).toLocaleDateString('he-IL')}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium">{sale.company}</span>
                                      <div className="text-sm text-gray-500">
                                        שכר: ₪{sale.salary?.toLocaleString()}
                                        {sale.accumulation && ` | צבירה: ${sale.accumulation}%`}
                                        {sale.provision && ` | הפרשה: ${sale.provision}%`}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Insurance Sales */}
                        {client.insurance_sales?.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-4 text-right">ביטוח</h3>
                            <div className="space-y-2">
                              {client.insurance_sales.map((sale: any) => (
                                <div key={sale.id} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <div className="text-left">
                                      <div className="font-medium text-green-600">
                                        ₪{sale.total_commission?.toLocaleString()}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {new Date(sale.created_at).toLocaleDateString('he-IL')}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium">{sale.company}</span>
                                      <div className="text-sm text-gray-500">
                                        {sale.insurance_type} | פרמיה: ₪{sale.monthly_premium?.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Investment Sales */}
                        {client.investment_sales?.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-4 text-right">השקעות</h3>
                            <div className="space-y-2">
                              {client.investment_sales.map((sale: any) => (
                                <div key={sale.id} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <div className="text-left">
                                      <div className="font-medium text-green-600">
                                        ₪{sale.total_commission?.toLocaleString()}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {new Date(sale.created_at).toLocaleDateString('he-IL')}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium">{sale.company}</span>
                                      <div className="text-sm text-gray-500">
                                        סכום: ₪{sale.amount?.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Policy Sales */}
                        {client.policy_sales?.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-4 text-right">פוליסות</h3>
                            <div className="space-y-2">
                              {client.policy_sales.map((sale: any) => (
                                <div key={sale.id} className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <div className="text-left">
                                      <div className="font-medium text-green-600">
                                        ₪{sale.total_commission?.toLocaleString()}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {new Date(sale.created_at).toLocaleDateString('he-IL')}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-medium">{sale.company}</span>
                                      <div className="text-sm text-gray-500">
                                        סכום: ₪{sale.amount?.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No Sales Message */}
                        {!client.pension_sales?.length && 
                         !client.insurance_sales?.length && 
                         !client.investment_sales?.length && 
                         !client.policy_sales?.length && (
                          <div className="text-center text-gray-500 py-8">
                            אין מכירות להצגה
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'activities' && (
                  <Card className="min-h-[350px]">
                    <CardHeader className="text-right">
                      <CardTitle className="flex items-center gap-2 justify-end">
                        <Activity className="h-4 w-4 text-blue-500" />
                        המלצות
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {client.insurance_sales?.length > 0 && (
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex flex-row-reverse items-center gap-2 text-blue-700">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium text-right">
                                מומלץ לבצע בדיקת תיק ביטוח בתאריך {
                                  new Date(new Date(client.insurance_sales[0].created_at).setFullYear(
                                    new Date(client.insurance_sales[0].created_at).getFullYear() + 1
                                  )).toLocaleDateString('he-IL')
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'documents' && (
                  <Card className="min-h-[350px]">
                    <CardHeader className="text-right">
                      <CardTitle className="flex items-center gap-2 justify-end">
                        <FileText className="h-4 w-4 text-blue-500" />
                        מסמכים
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            accept="application/pdf,image/*"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Upload className="h-4 w-4" />
                            העלאת קבצים
                          </label>
                          {files.length > 0 && (
                            <Button
                              onClick={handleUploadFiles}
                              disabled={isLoading}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {isLoading ? 'מעלה...' : 'שמור קבצים'}
                            </Button>
                          )}
                        </div>

                        {files.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="font-medium text-gray-700">קבצים להעלאה:</h3>
                            {files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {existingFiles.length > 0 ? (
                          <div className="space-y-2">
                            <h3 className="font-medium text-gray-700">קבצים קיימים:</h3>
                            {existingFiles.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{file.file_name}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(file.uploaded_at).toLocaleDateString('he-IL')}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">
                            אין מסמכים להצגה
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetails;