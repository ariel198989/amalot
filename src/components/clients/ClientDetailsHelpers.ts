import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { ClientFile, ClientActivity } from './ClientDetailsTypes';

export const uploadClientFiles = async (files: File[], clientId: string): Promise<ClientFile[]> => {
  const uploadedFiles: ClientFile[] = [];

  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}_${new Date().getTime()}.${fileExt}`;
    const filePath = `clients/${clientId}/${fileName}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('client_documents')
        .getPublicUrl(filePath);

      if (urlError) throw urlError;

      const fileRecord: ClientFile = {
        client_id: clientId,
        file_name: fileName,
        file_type: file.type,
        file_url: publicUrl,
        uploaded_at: new Date().toISOString()
      };

      const { data: insertData, error: insertError } = await supabase
        .from('client_files')
        .insert(fileRecord)
        .select();

      if (insertError) throw insertError;

      uploadedFiles.push(insertData[0]);
      toast.success(`הקובץ ${file.name} הועלה בהצלחה`);

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`שגיאה בהעלאת הקובץ ${file.name}`);
    }
  }

  return uploadedFiles;
};

export const fetchClientActivities = async (clientId: string): Promise<ClientActivity[]> => {
  try {
    const { data, error } = await supabase
      .from('client_activities')
      .select('*')
      .eq('client_id', clientId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching client activities:', error);
    toast.error('שגיאה בטעינת פעילויות הלקוח');
    return [];
  }
};

export const createClientActivity = async (
  clientId: string, 
  activityType: ClientActivity['activity_type'], 
  description: string
): Promise<ClientActivity | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('משתמש לא מחובר');

    const newActivity: Omit<ClientActivity, 'id'> = {
      client_id: clientId,
      activity_type: activityType,
      description,
      date: new Date().toISOString(),
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('client_activities')
      .insert(newActivity)
      .select();

    if (error) throw error;

    toast.success('פעילות נוספה בהצלחה');
    return data[0];
  } catch (error) {
    console.error('Error creating client activity:', error);
    toast.error('שגיאה ביצירת פעילות');
    return null;
  }
};
