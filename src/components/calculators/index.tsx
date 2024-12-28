import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PiggyBank, 
  Shield, 
  Target,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';

const productTypes = [
  {
    id: 'pension',
    label: 'פנסיה',
    icon: PiggyBank,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'בדיקת כדאיות מכירת מוצרי פנסיה',
    companies: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה', 'מיטב דש', 'אלטשולר שחם', 'מור']
  },
  {
    id: 'insurance',
    label: 'סיכונים',
    icon: Shield,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'בדיקת כדאיות מכירת מוצרי ביכונים',
    companies: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה'],
    products: [
      { value: 'personal_accident', label: 'תאונות אישיות' },
      { value: 'mortgage', label: 'משכנתה' },
      { value: 'health', label: 'בריאות' },
      { value: 'critical_illness', label: 'מחלות קשות' },
      { value: 'insurance_umbrella', label: 'מטריה ביטוחית' },
      { value: 'risk', label: 'ריסק' },
      { value: 'service', label: 'כתבי שירות' },
      { value: 'disability', label: 'אכע' }
    ]
  },
  {
    id: 'investment',
    label: 'פיננסים',
    icon: Coins,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'בדיקת כדאיות מכירת מוצרי חיננסים',
    companies: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה', 'מיטב דש', 'אלטשולר שחם', 'אנליסט', 'מור', 'ילין לפידות', 'פסגות'],
    products: [
      { value: 'gemel', label: 'גמל' },
      { value: 'investment_gemel', label: 'גמל להשקעה' },
      { value: 'hishtalmut', label: 'השתלמות' },
      { value: 'savings_policy', label: 'חסכון' }
    ]
  }
];

const CalculatorPage: React.FC = () => {
  return (
    <div className="h-full flex-1 flex flex-col gap-4 p-4 md:gap-8 md:p-10 bg-gray-50/50">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">בדיקת כדאיות מכירה</h1>
          <p className="text-muted-foreground">
            בדוק את כדאיות המכירה של מוצרים שונים על בסיס הסכמי הסוכן שלך
          </p>
        </div>
      </div>

      <Tabs defaultValue="pension" className="w-full" dir="rtl">
        <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
          {productTypes.map((product) => (
            <TabsTrigger
              key={product.id}
              value={product.id}
              className="inline-flex items-center justify-center rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground shadow-none transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <product.icon className={cn("w-4 h-4 mr-2", product.color)} />
              {product.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 space-y-8">
          {productTypes.map((product) => (
            <TabsContent key={product.id} value={product.id}>
              <div className="grid gap-8">
                {/* טופס */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="border-b bg-muted/40 pb-8">
                    <CardTitle className="text-xl">הזן פרטי {product.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6">
                      {product.products ? (
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-right">סוג מוצר</label>
                          <select className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" dir="rtl">
                            <option value="">בחר סוג מוצר</option>
                            {product.products.map((p) => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-6">
                        {product.id === 'pension' && (
                          <>
                            <div className="grid gap-2 col-span-2">
                              <label className="text-sm font-medium text-right">שכר ברוטו</label>
                              <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-right" dir="rtl" />
                            </div>
                            <div className="grid gap-2 col-span-2">
                              <label className="text-sm font-medium text-right">צבירה קיימת</label>
                              <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-right" dir="rtl" />
                            </div>
                          </>
                        )}
                        {product.id === 'insurance' && (
                          <div className="grid gap-2 col-span-2">
                            <label className="text-sm font-medium text-right">פרמיה חודשית</label>
                            <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-right" dir="rtl" />
                          </div>
                        )}
                        {product.id === 'investment' && (
                          <div className="grid gap-2 col-span-2">
                            <label className="text-sm font-medium text-right">סכום השקעה</label>
                            <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-right" dir="rtl" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* כפתור חישוב */}
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 w-full">
                  בדוק כדאיות מכירה בכל החברות
                </button>

                {/* תוצאות */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {product.companies.map((company) => (
                    <Card key={company} className="overflow-hidden border-none shadow-sm">
                      <CardHeader className="border-b bg-muted/40 p-4">
                        <div className="flex items-center justify-between">
                          <div className="p-1.5 bg-primary/10 rounded-lg">
                            <Target className="w-4 h-4 text-primary" />
                          </div>
                          <CardTitle className="text-base font-semibold">{company}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        {product.id === 'pension' ? (
                          <>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">עמלת היקף על הפקדה</div>
                              <div className="text-lg font-semibold">₪0</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">עמלת היקף על הצבירה</div>
                              <div className="text-lg font-semibold">₪0</div>
                            </div>
                            <div className="pt-3 border-t text-right">
                              <div className="text-sm text-muted-foreground">סה"כ שד פעמי</div>
                              <div className="text-xl font-semibold text-primary">₪0</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">עמלת היקף</div>
                              <div className="text-lg font-semibold">₪0</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">עמלת נפרעים</div>
                              <div className="text-lg font-semibold">₪0</div>
                            </div>
                            <div className="pt-3 border-t text-right">
                              <div className="text-sm text-muted-foreground">סה"כ שנתי</div>
                              <div className="text-xl font-semibold text-primary">₪0</div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* טבלת פירוט */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="border-b bg-muted/40">
                    <CardTitle>פירוט מלא לפי חברות</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative">
                      <table className="w-full text-sm" dir="rtl">
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="h-12 px-4 text-right font-medium">חברה</th>
                            {product.id === 'pension' ? (
                              <>
                                <th className="h-12 px-4 text-right font-medium">עמלת היקף על הפקדה</th>
                                <th className="h-12 px-4 text-right font-medium">עמלת היקף על הצבירה</th>
                                <th className="h-12 px-4 text-right font-medium">סה"כ שד פעמי</th>
                              </>
                            ) : (
                              <>
                                <th className="h-12 px-4 text-right font-medium">עמלת היקף</th>
                                <th className="h-12 px-4 text-right font-medium">עמלת נפרעים חודשית</th>
                                <th className="h-12 px-4 text-right font-medium">עמלת נפרעים שנתית</th>
                                <th className="h-12 px-4 text-right font-medium">סה"כ שנתי</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {product.companies.map((company, index) => (
                            <tr key={company} className={cn("border-b transition-colors hover:bg-muted/50", index % 2 === 0 ? "bg-muted/20" : "bg-background")}>
                              <td className="p-4 font-medium">{company}</td>
                              {product.id === 'pension' ? (
                                <>
                                  <td className="p-4">₪0</td>
                                  <td className="p-4">₪0</td>
                                  <td className="p-4 font-medium">₪0</td>
                                </>
                              ) : (
                                <>
                                  <td className="p-4">₪0</td>
                                  <td className="p-4">₪0</td>
                                  <td className="p-4">₪0</td>
                                  <td className="p-4 font-medium">₪0</td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default CalculatorPage;