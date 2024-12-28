import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Shield, 
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';

const productTypes = [
  {
    id: 'pension',
    label: 'פנסיה',
    icon: Wallet,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'בדיקת כדאיות מכירת מוצרי פנסיה',
    companies: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה', 'מיטב', 'אלטשולר שחם', 'מור']
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
    companies: ['מגדל', 'הראל', 'כלל', 'מנורה', 'הפניקס', 'הכשרה', 'מיטב', 'אלטשולר שחם', 'אנליסט', 'מור', 'ילין לפידות', 'פסגות'],
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
    <div className="p-6 space-y-8 bg-gradient-to-br from-secondary-50 to-white" dir="rtl">
      <div className="flex items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-secondary-900">בדיקת כדאיות מכירה</h1>
          <p className="text-secondary-500">
            בדוק את כדאיות המכירה של מוצרים שונים על בסיס הסכמי הסוכן שלך
          </p>
        </div>
      </div>

      <Tabs defaultValue="pension" className="w-full">
        <TabsList className="inline-flex h-auto w-full justify-end gap-4 rounded-none border-b bg-transparent p-0">
          {productTypes.map((product) => (
            <TabsTrigger
              key={product.id}
              value={product.id}
              className="inline-flex items-center justify-center rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-secondary-500 shadow-none transition-all duration-200 hover:text-secondary-900 data-[state=active]:border-primary data-[state=active]:text-primary-600 data-[state=active]:shadow-none"
            >
              <product.icon className={cn("w-4 h-4 ml-2", product.color)} />
              {product.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 space-y-8">
          {productTypes.map((product) => (
            <TabsContent key={product.id} value={product.id}>
              <div className="grid gap-8">
                {/* טופס */}
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 border-t-4" style={{ borderTopColor: product.color.replace('text-', 'rgb(var(--') }}>
                  <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-primary-100/50">
                    <CardTitle className="text-lg font-semibold text-primary-600 text-right">הזן פרטי {product.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6">
                      {product.products ? (
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-right text-secondary-700">סוג מוצר</label>
                          <select className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-right" dir="rtl">
                            <option value="">בחר סוג מוצר</option>
                            {product.products.map((p) => (
                              <option key={p.value} value={p.value} className="text-right">{p.label}</option>
                            ))}
                          </select>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-6">
                        {product.id === 'pension' && (
                          <>
                            <div className="grid gap-2 col-span-2">
                              <label className="text-sm font-medium text-right text-secondary-700">שכר ברוטו</label>
                              <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-right" dir="rtl" />
                            </div>
                            <div className="grid gap-2 col-span-2">
                              <label className="text-sm font-medium text-right text-secondary-700">צבירה קיימת</label>
                              <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-right" dir="rtl" />
                            </div>
                          </>
                        )}
                        {product.id === 'insurance' && (
                          <div className="grid gap-2 col-span-2">
                            <label className="text-sm font-medium text-right text-secondary-700">פרמיה חודשית</label>
                            <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-right" dir="rtl" />
                          </div>
                        )}
                        {product.id === 'investment' && (
                          <div className="grid gap-2 col-span-2">
                            <label className="text-sm font-medium text-right text-secondary-700">סכום השקעה</label>
                            <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-right" dir="rtl" />
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

                {/* תבלת פירוט */}
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 border-none">
                  <CardHeader className="border-b bg-gradient-to-r from-primary-50 to-primary-100/50">
                    <CardTitle className="text-lg font-semibold text-primary-600 text-right">תוצאות בדיקת כדאיות</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/60">
                          <tr>
                            {product.id === 'pension' ? (
                              <>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">סה"כ חד פעמי</th>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">עמלת היקף על הצבירה</th>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">עמלת היקף על הפקדה</th>
                              </>
                            ) : (
                              <>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">סה"כ שנתי</th>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">עמלת נפרעים שנתית</th>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">עמלת נפרעים חודשית</th>
                                <th className="h-12 px-4 text-right font-medium text-secondary-700">עמלת היקף</th>
                              </>
                            )}
                            <th className="h-12 px-4 text-right font-medium text-secondary-700">חברה</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.companies.map((company, index) => (
                            <tr key={company} className={cn("border-b transition-colors hover:bg-muted/50", index % 2 === 0 ? "bg-muted/20" : "bg-background")}>
                              {product.id === 'pension' ? (
                                <>
                                  <td className="p-4 font-medium text-primary-600 text-right">₪0</td>
                                  <td className="p-4 text-secondary-700 text-right">₪0</td>
                                  <td className="p-4 text-secondary-700 text-right">₪0</td>
                                </>
                              ) : (
                                <>
                                  <td className="p-4 font-medium text-primary-600 text-right">₪0</td>
                                  <td className="p-4 text-secondary-700 text-right">₪0</td>
                                  <td className="p-4 text-secondary-700 text-right">₪0</td>
                                  <td className="p-4 text-secondary-700 text-right">₪0</td>
                                </>
                              )}
                              <td className="p-4 font-medium text-secondary-900 text-right">{company}</td>
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