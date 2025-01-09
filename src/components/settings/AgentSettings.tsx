import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AgentNumberEntry {
  number: string;
  name: string;
}

interface AgentNumber {
  company: string;
  numbers: AgentNumberEntry[];
}

interface AgentSettings {
  id: string;
  user_id: string;
  logo_url: string | null;
  company: string;
  agent_numbers: AgentNumber[];
  created_at: string;
  updated_at: string;
}

export default function AgentSettings() {
  const { user } = useUser();
  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [agentNumbers, setAgentNumbers] = useState<AgentNumber[]>([
    { company: 'כלל', numbers: [{ number: '', name: '' }] },
    { company: 'הראל', numbers: [{ number: '', name: '' }] },
    { company: 'מגדל', numbers: [{ number: '', name: '' }] },
    { company: 'הכשרה', numbers: [{ number: '', name: '' }] },
    { company: 'הפניקס', numbers: [{ number: '', name: '' }] },
    { company: 'מנורה', numbers: [{ number: '', name: '' }] },
    { company: 'אנליסט', numbers: [{ number: '', name: '' }] },
    { company: 'אלטשולר שחם', numbers: [{ number: '', name: '' }] },
    { company: 'מיטב דש', numbers: [{ number: '', name: '' }] },
    { company: 'מור', numbers: [{ number: '', name: '' }] },
    { company: 'ילין לפידות', numbers: [{ number: '', name: '' }] }
  ]);

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agent_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
        setCompanyName(data.company);
        if (data.agent_numbers) {
          setAgentNumbers(data.agent_numbers);
        }
        if (data.logo_url) {
          setPreviewUrl(data.logo_url);
        }
      } else {
        const { data: newSettings, error: insertError } = await supabase
          .from('agent_settings')
          .insert({
            user_id: user.id,
            company: 'חברת ברירת מחדל',
            agent_numbers: agentNumbers,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        setSettings(newSettings);
        setCompanyName(newSettings.company);
        if (newSettings.agent_numbers) {
          setAgentNumbers(newSettings.agent_numbers);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('שגיאה בטעינת ההגדרות');
    }
  };

  const handleCompanyUpdate = async () => {
    if (!user || !companyName.trim()) return;

    try {
      const { error } = await supabase
        .from('agent_settings')
        .update({ 
          company: companyName,
          agent_numbers: agentNumbers,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('הגדרות החברה עודכנו בהצלחה');
    } catch (error) {
      console.error('Error updating company settings:', error);
      toast.error('שגיאה בעדכון הגדרות החברה');
    }
  };

  const handleAddNumber = (companyIndex: number) => {
    const newAgentNumbers = [...agentNumbers];
    newAgentNumbers[companyIndex].numbers.push({ number: '', name: '' });
    setAgentNumbers(newAgentNumbers);
  };

  const handleRemoveNumber = (companyIndex: number, numberIndex: number) => {
    const newAgentNumbers = [...agentNumbers];
    newAgentNumbers[companyIndex].numbers.splice(numberIndex, 1);
    setAgentNumbers(newAgentNumbers);
  };

  const handleNumberChange = (companyIndex: number, numberIndex: number, field: 'number' | 'name', value: string) => {
    const newAgentNumbers = [...agentNumbers];
    newAgentNumbers[companyIndex].numbers[numberIndex][field] = value;
    setAgentNumbers(newAgentNumbers);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // וידוא שהקובץ הוא תמונה
    if (!file.type.startsWith('image/')) {
      toast.error('נא להעלות קובץ תמונה בלבד');
      return;
    }

    // בדיקת גודל קובץ (מקסימום 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('גודל הקובץ חייב להיות קטן מ-2MB');
      return;
    }

    try {
      setIsUploading(true);

      // מחיקת לוגו קודם אם קיים
      if (settings?.logo_url) {
        const oldPath = settings.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('logos').remove([oldPath]);
        }
      }

      // העלאת הקובץ החדש
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // קבלת URL ציבורי
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      // עדכון הרשומה בטבלת ההגדרות
      const { error: updateError } = await supabase
        .from('agent_settings')
        .update({ 
          logo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      await fetchSettings();
      toast.success('הלוגו הועלה בהצלחה');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('שגיאה בהעלאת הלוגו');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!settings?.logo_url || !user) return;

    try {
      const fileName = settings.logo_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('logos').remove([fileName]);
      }

      const { error } = await supabase
        .from('agent_settings')
        .update({ 
          logo_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreviewUrl(null);
      await fetchSettings();
      toast.success('הלוגו הוסר בהצלחה');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('שגיאה בהסרת הלוגו');
    }
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">הגדרות סוכן</h2>
        
        <Tabs defaultValue="general" className="space-y-6" dir="rtl">
          <TabsList className="w-full justify-start bg-muted/40 p-1">
            <TabsTrigger value="general">הגדרות כלליות</TabsTrigger>
            <TabsTrigger value="agent-numbers">מספרי סוכן</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-6">
              {/* הגדרות כלליות */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">פרטי סוכן</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שם הסוכן/סוכנות</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="הזן את שם הסוכן/סוכנות"
                    />
                  </div>

                  <Button
                    onClick={handleCompanyUpdate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    עדכן הגדרות
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">לוגו</h3>
                <div className="flex items-start gap-6">
                  {/* תצוגה מקדימה של הלוגו */}
                  <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="לוגו סוכן"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={isUploading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Upload className="w-4 h-4 ml-2" />
                        {isUploading ? 'מעלה...' : 'העלה לוגו'}
                      </Button>
                    </div>

                    {previewUrl && (
                      <Button
                        onClick={handleRemoveLogo}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        הסר לוגו
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agent-numbers">
            <div className="space-y-6">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">הגדרת מספרי סוכן</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                    {agentNumbers.map((company, companyIndex) => (
                      <div key={company.company} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2 text-right">{company.company}</h4>
                        <div className="space-y-2">
                          {company.numbers.map((entry, numberIndex) => (
                            <div key={numberIndex} className="space-y-2">
                              <div className="flex gap-2">
                                {company.numbers.length > 1 && (
                                  <Button
                                    onClick={() => handleRemoveNumber(companyIndex, numberIndex)}
                                    variant="destructive"
                                    size="sm"
                                    className="px-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={entry.number}
                                    onChange={(e) => handleNumberChange(companyIndex, numberIndex, 'number', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                                    placeholder="הזן מספר סוכן"
                                  />
                                  <input
                                    type="text"
                                    value={entry.name}
                                    onChange={(e) => handleNumberChange(companyIndex, numberIndex, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                                    placeholder="הזן שם סוכן"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button
                            onClick={() => handleAddNumber(companyIndex)}
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full text-right"
                          >
                            הוסף מספר סוכן נוסף
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleCompanyUpdate}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    שמור מספרי סוכן
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 