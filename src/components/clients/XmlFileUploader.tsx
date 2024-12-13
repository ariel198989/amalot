import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { Upload, File, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { XMLFieldExtractor } from '@/lib/XMLFieldExtractor';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

interface XmlFileUploaderProps {
  onXmlFilesExtracted: (xmlFiles: { name: string; content: string }[]) => void;
}

interface ClientData {
  first_name: string;
  last_name: string;
  id_number: string;
  email: string;
  phone: string;
  address_street: string;
  address_city: string;
  status: 'active' | 'inactive' | 'lead';
}

export function XmlFileUploader({ onXmlFilesExtracted }: XmlFileUploaderProps) {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const createClientFromXml = async (clientData: ClientData) => {
    try {
      if (!clientData || !user) return null;

      const { data: client, error } = await supabase
        .from('clients')
        .insert([{
          ...clientData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('לקוח עם תעודת זהות זו כבר קיים במערכת');
        } else {
          toast.error('שגיאה ביצירת הלקוח');
        }
        return null;
      }

      toast.success('לקוח חדש נוצר בהצלחה');
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('שגיאה ביצירת הלקוח');
      return null;
    }
  };

  const processZipFile = async (file: File) => {
    try {
      setIsProcessing(true);
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(file);
      
      const xmlFiles: { name: string; content: string }[] = [];
      const extractor = new XMLFieldExtractor();
      
      // Extract only XML files
      const extractionPromises = Object.keys(zipContents.files)
        .filter(fileName => fileName.toLowerCase().endsWith('.xml'))
        .map(async (fileName) => {
          const fileData = zipContents.files[fileName];
          if (!fileData.dir) {
            const content = await fileData.async('text');
            xmlFiles.push({
              name: fileName,
              content
            });
            await extractor.extractFieldsFromXml(content);
          }
        });

      await Promise.all(extractionPromises);
      
      if (xmlFiles.length === 0) {
        toast.error('לא נמצאו קבצי XML בקובץ ה-ZIP');
        return;
      }

      const report = extractor.createMarkdownReport();
      console.log('Generated Report:', report);

      const clientData = extractor.extractClientData();
      if (clientData) {
        const newClient = await createClientFromXml(clientData);
        if (newClient) {
          onXmlFilesExtracted(xmlFiles);
        }
      }

    } catch (error) {
      console.error('Error processing zip file:', error);
      toast.error('שגיאה בעיבוד קובץ ה-ZIP');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
      toast.error('אנא העלה קובץ ZIP בלבד');
      return;
    }

    await processZipFile(file);
  }, [onXmlFilesExtracted, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    },
    multiple: false
  });

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