import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResultsTable from './ResultsTable';
import { CombinedClient } from '../../types/calculators';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

type ProductType = 'pension' | 'insurance' | 'investment' | 'policy';
type SelectedProducts = Record<ProductType, boolean>;

const CombinedCalculator: React.FC = () => {
  const [clients, setClients] = React.useState<CombinedClient[]>([]);
  const [selectedProducts, setSelectedProducts] = React.useState<SelectedProducts>({
    pension: false,
    insurance: false,
    investment: false,
    policy: false
  });
  const { register, setValue } = useForm();

  const products = [
    { id: 'pension' as const, label: 'פנסיה', description: 'חישוב עמלות פנסיה' },
    { id: 'insurance' as const, label: 'ביטוח', description: 'חישוב עמלות ביטוח' },
    { id: 'investment' as const, label: 'גמל והשתלמות', description: 'חישוב עמלות גמל והשתלמות' },
    { id: 'policy' as const, label: 'פוליסת חיסכון', description: 'חישוב עמלות פוליסת חיסכון' }
  ];

  const onSubmit = async (data: any) => {
    try {
      // חישוב העמלות
      const calculations = {
        pensionScopeCommission: selectedProducts.pension ? data.salary * 0.03 : 0,
        pensionAccumulationCommission: selectedProducts.pension ? 
          (data.salary * (Number(data.accumulation) + Number(data.provision)) / 100) * 0.02 : 0,
        insuranceOneTimeCommission: selectedProducts.insurance ? Number(data.monthlyPremium) * 12 * 0.4 : 0,
        insuranceMonthlyCommission: selectedProducts.insurance ? Number(data.monthlyPremium) * 0.1 : 0,
        investmentCommission: selectedProducts.investment ? Number(data.investmentAmount) * 0.02 : 0,
        policyScopeCommission: selectedProducts.policy ? 
          Number(data.depositAmount) * Number(data.depositPeriod) * 12 * 0.025 : 0
      };

      const totalCommission = Object.values(calculations).reduce((a, b) => a + b, 0);

      // יצירת אובייקט הלקוח
      const newClient: CombinedClient = {
        date: new Date().toLocaleDateString('he-IL'),
        name: data.name,
        company: data.company,
        selectedProducts: Object.entries(selectedProducts)
          .filter(([_, value]) => value)
          .map(([key]) => key)
          .join(', '),
        ...calculations,
        totalCommission,
        created_at: new Date().toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      // שמירה בסופאבייס
      const { error } = await supabase
        .from('combined_calculations')
        .insert([newClient]);

      if (error) throw error;

      // עדכון המצב המקומי
      setClients([...clients, newClient]);
      toast.success('החישוב נשמר בהצלחה!');

    } catch (error: any) {
      console.error('Error saving calculation:', error);
      toast.error(error.message || 'אירעה שגיאה בשמירת החישוב');
    }
  };

  // טעינת חישובים קודמים בעת טעינת הקומפוננטה
  React.useEffect(() => {
    const loadCalculations = async () => {
      try {
        const { data, error } = await supabase
          .from('combined_calculations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setClients(data);

      } catch (error: any) {
        console.error('Error loading calculations:', error);
        toast.error('אירעה שגיאה בטעינת החישובים');
      }
    };

    loadCalculations();
  }, []);

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit}>
        {/* פרטי לקוח */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">פרטי לקוח</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">שם הלקוח</label>
                <Input {...register('name')} placeholder="הכנס שם לקוח" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">חברה</label>
                <Select onValueChange={(value) => setValue('company', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר חברה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="migdal">מגדל</SelectItem>
                    <SelectItem value="menora">מנורה</SelectItem>
                    <SelectItem value="clal">כלל</SelectItem>
                    <SelectItem value="harel">הראל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* בחירת מוצרים */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">בחר מוצרים לחישוב</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center space-x-4 space-x-reverse p-4 rounded-lg border-2 transition-colors ${
                    selectedProducts[product.id]
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Checkbox
                    checked={selectedProducts[product.id]}
                    onChange={(e) => {
                      setSelectedProducts(prev => ({
                        ...prev,
                        [product.id]: e.target.checked
                      }));
                    }}
                    className="h-5 w-5"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{product.label}</h3>
                    <p className="text-sm text-gray-500">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* טפסים דינמיים */}
        {Object.entries(selectedProducts).some(([_, value]) => value) && (
          <div className="space-y-6">
            {selectedProducts.pension && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">פרטי פנסיה</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* פרטי פנסיה */}
                </CardContent>
              </Card>
            )}

            {selectedProducts.insurance && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">פרטי ביטוח</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* פרטי ביטוח */}
                </CardContent>
              </Card>
            )}

            {/* ... וכן הלאה עבור שאר המוצרים ... */}
          </div>
        )}

        {Object.entries(selectedProducts).some(([_, value]) => value) && (
          <Button 
            type="submit" 
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
          >
            חשב עמלות
          </Button>
        )}
      </form>

      <ResultsTable
        data={clients}
        columns={[/* ... columns ... */]}
        onDownload={() => {}}
        onShare={() => {}}
        onClear={() => setClients([])}
      />
    </div>
  );
};

export default CombinedCalculator; 