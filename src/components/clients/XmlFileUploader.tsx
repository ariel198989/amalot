import React from 'react';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { Upload, File, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { XMLFieldExtractor } from '@/lib/XMLFieldExtractor';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';
import { Client } from '@/types/client';
import { XmlFile } from '@/types/xml';

interface XmlFileUploaderProps {
  onXmlFilesExtracted: (files: XmlFile[]) => void;
}

interface ClientData {
  first_name: string;
  last_name: string;
  id_number: string;
  email?: string;
  phone?: string;
  address_street?: string;
  address_city?: string;
  status: 'active' | 'inactive' | 'lead';
  products?: Array<{
    type: string;
    name: string;
    policy_number?: string;
    start_date?: string;
    balance?: number;
    monthly_deposit?: number;
    employee_contribution?: number;
    employer_contribution?: number;
    compensation_contribution?: number;
    status?: string;
  }>;
}

export function XmlFileUploader({ onXmlFilesExtracted }: XmlFileUploaderProps) {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const normalizeClientData = (data: any): ClientData & { user_id: string } => {
    // Clean up phone number - remove non-digits and add prefix if needed
    let phone = data.phone ? String(data.phone).replace(/\D/g, '') : undefined;
    if (phone && !phone.startsWith('0')) {
      phone = '0' + phone;
    }

    // Don't save '-' as email
    const email = data.email && data.email !== '-' ? String(data.email).toLowerCase().trim() : undefined;

    // Exclude products from client data since they're stored in a separate table
    const { products, ...clientData } = data;

    return {
      user_id: data.user_id,
      first_name: String(data.first_name || '').trim(),
      last_name: String(data.last_name || '').trim(),
      id_number: String(data.id_number || '').trim(),
      email,
      phone,
      address_street: data.address_street ? String(data.address_street).trim() : undefined,
      address_city: data.address_city ? String(data.address_city).trim() : undefined,
      status: 'active'
    };
  };

  const createClientFromXml = useCallback(async (clientData: ClientData) => {
    try {
      if (!clientData?.id_number || !user?.id) {
        console.error('Missing required data:', { clientData, userId: user?.id });
        return null;
      }

      const normalizedData = normalizeClientData({
        ...clientData,
        user_id: user.id
      });

      console.log('Creating/updating client with data:', normalizedData);

      // Check if client exists
      const { data: existingClient, error: searchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id_number', normalizedData.id_number)
        .eq('user_id', user.id)
        .maybeSingle();

      if (searchError) {
        console.error('Error checking existing client:', searchError);
        toast.error('שגיאה בבדיקת לקוח קיים');
        return null;
      }

      let client;
      if (existingClient) {
        // Update existing client
        const { data: updatedClient, error: updateError } = await supabase
          .from('clients')
          .update({
            ...normalizedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingClient.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating client:', updateError);
          toast.error('שגיאה בעדכון הלקוח');
          return null;
        }

        client = updatedClient;
        toast.success('פרטי הלקוח עודכנו בהצלחה');
      } else {
        // Create new client
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert([{
            ...normalizedData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating client:', createError);
          toast.error('שגיאה ביצירת הלקוח');
          return null;
        }

        client = newClient;
        toast.success('הלקוח נוצר בהצלחה');
      }

      // Handle pension products if they exist
      if (client && normalizedData.products?.length) {
        const { error: productsError } = await supabase
          .from('pension_products')
          .upsert(
            normalizedData.products.map(product => ({
              client_id: client.id,
              user_id: user.id,
              type: product.type,
              name: product.name,
              policy_number: product.policy_number,
              start_date: product.start_date,
              balance: product.balance,
              monthly_deposit: product.monthly_deposit,
              employee_contribution: product.employee_contribution,
              employer_contribution: product.employer_contribution,
              compensation_contribution: product.compensation_contribution,
              status: product.status,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })),
            {
              onConflict: 'policy_number',
              ignoreDuplicates: false
            }
          );

        if (productsError) {
          console.error('Error saving pension products:', productsError);
          toast.error('שגיאה בשמירת המוצרים הפנסיוניים');
        } else {
          toast.success('המוצרים הפנסיוניים נשמרו בהצלחה');
        }
      }

      return client;
    } catch (error) {
      console.error('Error in createClientFromXml:', error);
      toast.error('שגיאה בעיבוד נתוני הלקוח');
      return null;
    }
  }, [user]);

  const processZipFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(file);
      
      const xmlFiles: { name: string; content: string }[] = [];
      const extractor = new XMLFieldExtractor();
      let lastProcessedClient: Client | null = null;
      
      const xmlFileNames = Object.keys(zipContents.files)
        .filter(fileName => fileName.toLowerCase().endsWith('.xml'));

      if (xmlFileNames.length === 0) {
        toast.error('לא נמצאו קבצי XML בקובץ ה-ZIP');
        return;
      }

      for (const fileName of xmlFileNames) {
        const fileData = zipContents.files[fileName];
        if (fileData.dir) continue;

        try {
          const content = await fileData.async('text');
          xmlFiles.push({ name: fileName, content });

          const result = await extractor.extractFieldsFromXml(content);
          console.log('Generated Report:', result.report);

          const clientData = extractor.extractClientData(result.data);
          if (clientData) {
            const mappedClientData: ClientData = {
              first_name: clientData.firstName,
              last_name: clientData.lastName,
              id_number: clientData.id,
              email: clientData.email,
              phone: clientData.phone,
              address_street: clientData.address.split(',')[0] || '',
              address_city: clientData.address.split(',')[1]?.trim() || '',
              status: 'active' as const,
              products: clientData.products?.map(p => ({
                type: p.type,
                name: p.name,
                policy_number: p.policyNumber,
                start_date: p.startDate,
                balance: p.balance,
                monthly_deposit: p.monthlyDeposit,
                employee_contribution: p['HAFRASHAT-OVED'] || 0,
                employer_contribution: p['HAFRASHAT-MAASIK'] || 0,
                compensation_contribution: p['HAFRASHAT-PITZUIM'] || 0,
                status: p.status
              }))
            };

            // First create/update the client
            const client = await createClientFromXml(mappedClientData);
            if (client) {
              lastProcessedClient = client;
              
              // Then save the XML data
              const { error: xmlError } = await supabase
                .from('client_xml_data')
                .insert({
                  client_id: client.id,
                  raw_data: result.data,
                  created_at: new Date().toISOString()
                });

              if (xmlError) {
                console.error('Error saving XML data:', xmlError);
                toast.error('שגיאה בשמירת נתוני המסלקה');
              } else {
                console.log('Successfully saved XML data for client:', client.id);
                toast.success('נתוני המסלקה נשמרו בהצלחה');
              }
            }
          }
        } catch (error) {
          console.error(`Error processing file ${fileName}:`, error);
          toast.error(`שגיאה בעיבוד קובץ ${fileName}`);
        }
      }

      if (xmlFiles.length > 0) {
        onXmlFilesExtracted(xmlFiles);
      }

    } catch (error) {
      console.error('Error processing zip file:', error);
      toast.error('שגיאה בעיבוד קובץ ה-ZIP');
    } finally {
      setIsProcessing(false);
    }
  }, [onXmlFilesExtracted, createClientFromXml]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
      toast.error('אנא העלה קובץ ZIP בלבד');
      return;
    }

    await processZipFile(file);
  }, [processZipFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    },
    multiple: false
  });

  const handleFilesProcessed = async (files: XmlFile[]) => {
    try {
      const extractor = new XMLFieldExtractor();
      
      for (const file of files) {
        const result = extractor.processXmlContent(file.content);
        console.log('Processed XML data:', result);
        
        if (!result || !result.client || !result.client['MISPAR-ZIHUY']) {
          console.error('Invalid XML data structure:', result);
          continue;
        }

        // First, create or update the client
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .upsert({
            id_number: result.client['MISPAR-ZIHUY'],
            first_name: result.client['SHEM-PRATI'],
            last_name: result.client['SHEM-MISHPACHA'],
            email: result.client['E-MAIL'],
            user_id: user?.id
          }, {
            onConflict: 'id_number,user_id'
          })
          .select()
          .single();

        if (clientError) {
          console.error('Error saving client:', clientError);
          toast.error('שגיאה בשמירת נתוני הלקוח');
          continue;
        }

        console.log('Saved/Updated client:', client);

        // Then, save the XML data
        const { error: xmlError } = await supabase
          .from('client_xml_data')
          .insert({
            client_id: client.id,
            raw_data: result,
            created_at: new Date().toISOString()
          });

        if (xmlError) {
          console.error('Error saving XML data:', xmlError);
          toast.error('שגיאה בשמירת נתוני המסלקה');
        } else {
          console.log('Successfully saved XML data for client:', client.id);
        }
      }

      onXmlFilesExtracted(files);
      toast.success('הקבצים עובדו ונשמרו בהצלחה');
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('שגיאה בעיבוד הקבצים');
    }
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 
          transition-colors cursor-pointer
          flex flex-col items-center justify-center
          min-h-[200px]
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 hover:border-blue-400 dark:border-gray-600'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center">
          {isProcessing ? (
            <>
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-gray-600 dark:text-gray-300">מעבד קובץ...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  גרור לכאן קובץ ZIP
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  או לחץ לבחירת קובץ
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  רק קבצי XML יחולצו מתוך קובץ ה-ZIP
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {isProcessing && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <File className="h-4 w-4" />
            <span>מחלץ קבצי XML...</span>
          </div>
        </div>
      )}
    </div>
  );
} 