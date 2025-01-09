import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Search, Building2, PiggyBank, Shield } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Policy {
  id: string;
  client_name: string;
  date: string;
  policy_type?: string;
  insurance_type?: string;
  investment_type?: string;
  company: string;
  total_commission: number;
  premium?: number;
  investment_amount?: number;
  pensionsalary?: number;
  pensioncontribution?: number;
  pensionaccumulation?: number;
  scope_commission?: number;
  monthly_commission?: number;
}

const calculateDuration = (startDate: string) => {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;

  let result = '';
  if (years > 0) result += `${years} שנים `;
  if (months > 0) result += `${months} חודשים `;
  if (days > 0) result += `${days} ימים`;
  
  return result.trim() || 'פחות מיום';
};

const formatCurrency = (amount: number | undefined | null) => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd/MM/yyyy', { locale: he });
  } catch {
    return date;
  }
};

export default function PolicyDurationPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllPolicies = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No user found');
          return;
        }

        const [
          { data: pensionData, error: pensionError },
          { data: insuranceData, error: insuranceError },
          { data: investmentData, error: investmentError }
        ] = await Promise.all([
          supabase
            .from('pension_sales')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false }),
          supabase
            .from('insurance_sales')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false }),
          supabase
            .from('investment_sales')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
        ]);

        if (pensionError) console.error('Error loading pension sales:', pensionError);
        if (insuranceError) console.error('Error loading insurance sales:', insuranceError);
        if (investmentError) console.error('Error loading investment sales:', investmentError);

        const allPolicies = [
          ...(pensionData || []).map((policy: any) => ({
            ...policy,
            policy_type: 'פנסיה'
          })),
          ...(insuranceData || []).map((policy: any) => ({
            ...policy,
            policy_type: 'ביטוח'
          })),
          ...(investmentData || []).map((policy: any) => ({
            ...policy,
            policy_type: 'פיננסים'
          }))
        ];

        setPolicies(allPolicies);
      } catch (error) {
        console.error('Error fetching policies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPolicies();
  }, []);

  const filteredPolicies = policies.filter(policy =>
    policy.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.insurance_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.investment_type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPolicyTable = (policies: Policy[], type: 'pension' | 'insurance' | 'investment') => (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            {type === 'pension' ? (
              <>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">זמן מתחילת הפוליסה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">תאריך התחלה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">חברה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלה שנתית צפויה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלה חודשית צפויה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלת היקף</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">סכום ניוד</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[100px]">הפרשה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">שכר</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">שם לקוח</th>
              </>
            ) : type === 'insurance' ? (
              <>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">זמן מתחילת הפוליסה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">תאריך התחלה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">חברה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלה שנתית צפויה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלה חודשית</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלת היקף</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">אופן תשלום</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">פרמיה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">סוג פוליסה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">שם לקוח</th>
              </>
            ) : (
              <>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">זמן מתחילת הפוליסה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">תאריך התחלה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">חברה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלה שנתית צפויה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלה חודשית</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">עמלת היקף</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[120px]">סוג השקעה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">סכום השקעה</th>
                <th className="p-3 text-right font-medium whitespace-nowrap w-[150px]">שם לקוח</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {policies.length === 0 ? (
            <tr>
              <td colSpan={type === 'pension' ? 10 : 9} className="text-center p-8 text-muted-foreground">
                לא נמצאו תוצאות
              </td>
            </tr>
          ) : (
            policies.map((policy) => (
              <tr key={policy.id} className="border-b hover:bg-muted/30 transition-colors">
                {type === 'pension' ? (
                  <>
                    <td className="p-3 text-right font-medium text-primary">{calculateDuration(policy.date)}</td>
                    <td className="p-3 text-right">{formatDate(policy.date)}</td>
                    <td className="p-3 text-right">{policy.company}</td>
                    <td className="p-3 text-right">{formatCurrency((policy.monthly_commission || 0) * 12)}</td>
                    <td className="p-3 text-right">{formatCurrency(policy.monthly_commission || 0)}</td>
                    <td className="p-3 text-right">{formatCurrency(policy.scope_commission || 0)}</td>
                    <td className="p-3 text-right">{formatCurrency(policy.pensionaccumulation || 0)}</td>
                    <td className="p-3 text-right">{policy.pensioncontribution}%</td>
                    <td className="p-3 text-right">{formatCurrency(policy.pensionsalary || 0)}</td>
                    <td className="p-3 text-right">{policy.client_name}</td>
                  </>
                ) : type === 'insurance' ? (
                  <>
                    <td className="p-3 text-right font-medium text-primary">{calculateDuration(policy.date)}</td>
                    <td className="p-3 text-right">{formatDate(policy.date)}</td>
                    <td className="p-3 text-right">{policy.company}</td>
                    <td className="p-3 text-right">{formatCurrency((policy.monthly_commission || 0) * 12)}</td>
                    <td className="p-3 text-right">{formatCurrency(policy.monthly_commission || 0)}</td>
                    <td className="p-3 text-right">{formatCurrency(policy.scope_commission || 0)}</td>
                    <td className="p-3 text-right">{policy.payment_method}</td>
                    <td className="p-3 text-right">{formatCurrency(policy.premium || 0)}</td>
                    <td className="p-3 text-right">{policy.insurance_type}</td>
                    <td className="p-3 text-right">{policy.client_name}</td>
                  </>
                ) : (
                  <>
                    <td className="p-3 text-right font-medium text-primary">{calculateDuration(policy.date)}</td>
                    <td className="p-3 text-right">{formatDate(policy.date)}</td>
                    <td className="p-3 text-right">{policy.company}</td>
                    <td className="p-3 text-right">{formatCurrency((policy.monthly_commission || 0) * 12)}</td>
                    <td className="p-3 text-right">{formatCurrency(policy.monthly_commission || 0)}</td>
                    <td className="p-3 text-right">{formatCurrency(policy.scope_commission || 0)}</td>
                    <td className="p-3 text-right">{policy.investment_type}</td>
                    <td className="p-3 text-right">{formatCurrency(policy.investment_amount || 0)}</td>
                    <td className="p-3 text-right">{policy.client_name}</td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">זמן פוליסה</h1>
          <p className="text-muted-foreground">מעקב אחר זמני הפוליסות</p>
        </div>
        <Clock className="w-8 h-8 text-primary" />
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש לפי שם לקוח, חברה או סוג פוליסה"
            className="pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="pension" className="space-y-4">
          <TabsList className="w-full justify-end bg-muted/40 p-1">
            <TabsTrigger value="insurance" className="flex items-center gap-2 data-[state=active]:bg-background">
              סיכונים
              <Shield className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="investment" className="flex items-center gap-2 data-[state=active]:bg-background">
              פיננסים
              <PiggyBank className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="pension" className="flex items-center gap-2 data-[state=active]:bg-background">
              פנסיה
              <Building2 className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pension">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-end gap-2">
                  <CardTitle className="text-xl">פוליסות פנסיה</CardTitle>
                  <Building2 className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {renderPolicyTable(filteredPolicies.filter(p => p.policy_type === 'פנסיה'), 'pension')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investment">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-end gap-2">
                  <CardTitle className="text-xl">פוליסות פיננסים</CardTitle>
                  <PiggyBank className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {renderPolicyTable(filteredPolicies.filter(p => p.policy_type === 'פיננסים'), 'investment')}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurance">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-end gap-2">
                  <CardTitle className="text-xl">פוליסות סיכונים</CardTitle>
                  <Shield className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {renderPolicyTable(filteredPolicies.filter(p => p.policy_type === 'ביטוח'), 'insurance')}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 