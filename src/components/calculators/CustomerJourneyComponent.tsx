import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateCommissions } from '../../services/AgentAgreementService';
import { toast } from 'react-hot-toast';
import { 
  Wallet, 
  PiggyBank, 
  Building2, 
  Shield,
  User,
  Phone,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react';

interface CommissionDetails {
  scope: number;
  monthly: number;
  details?: {
    salary?: number;
    accumulation?: number;
    contribution?: number;
    annualSalary?: number;
    annualContribution?: number;
  };
}

interface ProductSelection {
  id: string;
  type: 'pension' | 'insurance' | 'savings_and_study' | 'policy';
  company: string;
  details: {
    amount?: number;
    salary?: number;
    accumulation?: number;
    premium?: number;
    insuranceType?: string;
    contribution?: number;
  };
  commissions?: CommissionDetails;
}

const getProductHebrewName = (type: string): string => {
  switch (type) {
    case 'pension': return 'פנסיה';
    case 'insurance': return 'ביטוח';
    case 'savings_and_study': return 'גמל והשתלמות';
    case 'policy': return 'פוליסת חיסכון';
    default: return type;
  }
};

const CustomerJourneyComponent: React.FC = () => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>([]);
  const [calculatedCommissions, setCalculatedCommissions] = useState(false);

  const companies = ['מגדל', 'מנורה', 'כלל', 'הראל', 'הפניקס'];
  const insuranceTypes = [
    { key: 'risk', label: 'ביטוח סיכונים' },
    { key: 'mortgage_risk', label: 'ביטוח משכנתא' },
    { key: 'health', label: 'ביטוח בריאות' },
    { key: 'critical_illness', label: 'ביטוח מחלות קשות' },
    { key: 'service_letter', label: 'כתב שירות' },
    { key: 'disability', label: 'ביטוח נכות' }
  ];

  const getProductIcon = (type: ProductSelection['type']) => {
    switch (type) {
      case 'pension':
        return <Wallet className="w-6 h-6" />;
      case 'insurance':
        return <Shield className="w-6 h-6" />;
      case 'savings_and_study':
        return <PiggyBank className="w-6 h-6" />;
      case 'policy':
        return <Building2 className="w-6 h-6" />;
    }
  };

  const productTypes = [
    { type: 'pension' as const, label: 'פנסיה' },
    { type: 'insurance' as const, label: 'ביטוח' },
    { type: 'savings_and_study' as const, label: 'גמל והשתלמות' },
    { type: 'policy' as const, label: 'פוליסת חיסכון' }
  ];

  const addProduct = (type: ProductSelection['type']) => {
    setSelectedProducts([...selectedProducts, { 
      id: Math.random().toString(36).substr(2, 9),
      type, 
      company: '', 
      details: {} 
    }]);
    setCalculatedCommissions(false);
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    setCalculatedCommissions(false);
  };

  const updateProduct = (id: string, updates: Partial<ProductSelection>) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
    setCalculatedCommissions(false);
  };

  const calculateTotalCommissions = async () => {
    if (!clientName) {
      toast.error('נא להזין שם לקוח');
      return;
    }

    const updatedProducts = await Promise.all(selectedProducts.map(async (product) => {
      if (!product.company) {
        toast.error('נא לבחור חברה לכל המוצרים');
        return product;
      }

      switch (product.type) {
        case 'pension':
          if (!product.details.salary) {
            toast.error('נא להזין שכר עבור פנסיה');
            return product;
          }
          const contribution = product.details.contribution === undefined ? 20.83 : product.details.contribution;
          const commissions = await calculateCommissions('pension', product.company, 
            product.details.salary * 12 * (contribution / 100), 
            product.details.accumulation || 0
          );
          if (!commissions) {
            toast.error(`אין הסכם פעיל עבור חברת ${product.company}`);
            return product;
          }
          return {
            ...product,
            details: {
              ...product.details,
              contribution
            },
            commissions: {
              scope: commissions.scope_commission,
              monthly: commissions.monthly_commission,
              details: {
                salary: product.details.salary,
                accumulation: product.details.accumulation || 0,
                contribution: contribution,
                annualSalary: product.details.salary * 12,
                annualContribution: product.details.salary * 12 * (contribution / 100)
              }
            }
          };

        case 'insurance':
          if (!product.details.premium) {
            toast.error('נא להזין פרמיה עבור ביטוח');
            return product;
          }
          const insuranceCommissions = await calculateCommissions('insurance', product.company, product.details.premium);
          if (!insuranceCommissions) {
            toast.error(`אין הסכם פעיל עבור חברת ${product.company}`);
            return product;
          }
          return {
            ...product,
            commissions: {
              scope: insuranceCommissions.scope_commission,
              monthly: insuranceCommissions.monthly_commission,
              details: {
                premium: product.details.premium,
                annualPremium: product.details.premium * 12
              }
            }
          };

        case 'savings_and_study':
        case 'policy':
          if (!product.details.amount) {
            toast.error('נא להזין סכום');
            return product;
          }
          const otherCommissions = await calculateCommissions(product.type, product.company, product.details.amount);
          if (!otherCommissions) {
            toast.error(`אין הסכם פעיל עבור חברת ${product.company}`);
            return product;
          }
          return {
            ...product,
            commissions: {
              scope: otherCommissions.scope_commission,
              monthly: otherCommissions.monthly_commission,
              details: {
                amount: product.details.amount
              }
            }
          };

        default:
          return product;
      }
    }));

    // Filter out products with no commissions (inactive agreements)
    const validProducts = updatedProducts.filter(product => product.commissions);
    
    if (validProducts.length !== updatedProducts.length) {
      toast.error('חלק מהמוצרים לא חושבו בגלל הסכמים לא פעילים');
    }

    setSelectedProducts(validProducts);
    setCalculatedCommissions(true);
  };

  const getTotalCommissions = () => {
    return selectedProducts.reduce((total, product) => {
      if (!product.commissions) return total;
      return total + product.commissions.scope + product.commissions.monthly;
    }, 0);
  };

  const renderCommissionSummary = () => {
    if (!calculatedCommissions) return null;

    let totalOneTimeCommission = 0;
    let totalMonthlyCommission = 0;
    let totalAnnualCommission = 0;

    const summaryContent = selectedProducts.map(product => {
      if (!product.commissions) return null;

      let oneTime = 0;
      let monthly = 0;
      let annual = 0;

      switch (product.type) {
        case 'pension':
          oneTime = product.commissions.scope;
          monthly = product.commissions.monthly;
          annual = monthly * 12;
          break;
        case 'insurance':
          oneTime = product.commissions.scope;
          monthly = product.commissions.monthly;
          annual = monthly * 12;
          break;
        case 'savings_and_study':
        case 'policy':
          oneTime = product.commissions.scope;
          monthly = product.commissions.monthly;
          annual = monthly * 12;
          break;
      }

      totalOneTimeCommission += oneTime;
      totalMonthlyCommission += monthly;
      totalAnnualCommission += annual;

      return (
        <Card key={product.id} className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">
              {getProductHebrewName(product.type)} - {product.company}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {product.type === 'pension' && product.commissions.details && (
                <>
                  <div>שכר חודשי: ₪{product.commissions.details.salary?.toLocaleString()}</div>
                  <div>שכר שנתי: ₪{product.commissions.details.annualSalary?.toLocaleString()}</div>
                  <div>אחוז הפרשה: {product.commissions.details.contribution}%</div>
                  <div>הפרשה שנתית: ₪{product.commissions.details.annualContribution?.toLocaleString()}</div>
                  {product.commissions.details.accumulation && product.commissions.details.accumulation > 0 && (
                    <div>צבירה: ₪{product.commissions.details.accumulation.toLocaleString()}</div>
                  )}
                </>
              )}
              {product.type === 'insurance' && (
                <div>פרמיה חודשית: ₪{product.details.premium?.toLocaleString()}</div>
              )}
              {(product.type === 'savings_and_study' || product.type === 'policy') && (
                <div>סכום: ₪{product.details.amount?.toLocaleString()}</div>
              )}
              <div className="pt-4 border-t">
                <div>עמלת היקף: ₪{oneTime.toLocaleString()}</div>
                <div>עמלה חודשית: ₪{monthly.toLocaleString()}</div>
                <div>עמלה שנתית: ₪{annual.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    });

    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">סיכום עמלות</h2>
        {summaryContent}
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle>סה"כ עמלות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-lg">
              <div>סה"כ עמלות היקף: ₪{totalOneTimeCommission.toLocaleString()}</div>
              <div>סה"כ עמלות חודשיות: ₪{totalMonthlyCommission.toLocaleString()}</div>
              <div>סה"כ עמלות שנתיות: ₪{totalAnnualCommission.toLocaleString()}</div>
              <div className="pt-2 border-t font-bold">
                סה"כ שנה ראשונה: ₪{(totalOneTimeCommission + totalAnnualCommission).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" dir="rtl">
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6" />
            פרטי לקוח
          </CardTitle>
          <CardDescription>הזן את פרטי הלקוח עבור המסע</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">שם הלקוח</label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="שם הלקוח"
              className="border-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">טלפון</label>
            <Input
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="טלפון"
              className="border-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="text-2xl">בחירת מוצרים</CardTitle>
          <CardDescription>בחר את המוצרים שברצונך להוסיף למסע הלקוח</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {productTypes.map(({ type, label }) => (
              <Button
                key={type}
                onClick={() => addProduct(type)}
                className="h-auto py-4 px-6 flex flex-col items-center gap-2"
                variant="outline"
              >
                {getProductIcon(type)}
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {selectedProducts.map((product) => (
          <Card key={product.id} className="border-2 border-green-100">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getProductIcon(product.type)}
                {productTypes.find(p => p.type === product.type)?.label}
                {product.company && ` - ${product.company}`}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeProduct(product.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">חברה</label>
                <Select
                  value={product.company}
                  onValueChange={(value) => updateProduct(product.id, { company: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר חברה" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {product.type === 'pension' && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">שכר חודשי</label>
                    <Input
                      type="number"
                      value={product.details.salary || ''}
                      onChange={(e) => updateProduct(product.id, { 
                        details: { ...product.details, salary: Number(e.target.value) }
                      })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">צבירה</label>
                    <Input
                      type="number"
                      value={product.details.accumulation || ''}
                      onChange={(e) => updateProduct(product.id, { 
                        details: { ...product.details, accumulation: Number(e.target.value) }
                      })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">אחוז הפרשה</label>
                    <Input
                      type="number"
                      value={product.details.contribution || 20.83}
                      onChange={(e) => updateProduct(product.id, { 
                        details: { ...product.details, contribution: Number(e.target.value) }
                      })}
                      className="border-2"
                      placeholder="20.83"
                    />
                  </div>
                </div>
              )}

              {product.type === 'insurance' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">פרמיה חודשית</label>
                  <Input
                    type="number"
                    value={product.details.premium || ''}
                    onChange={(e) => updateProduct(product.id, { 
                      details: { ...product.details, premium: Number(e.target.value) }
                    })}
                    className="border-2"
                  />
                </div>
              )}

              {(product.type === 'savings_and_study' || product.type === 'policy') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">סכום</label>
                  <Input
                    type="number"
                    value={product.details.amount || ''}
                    onChange={(e) => updateProduct(product.id, { 
                      details: { ...product.details, amount: Number(e.target.value) }
                    })}
                    className="border-2"
                  />
                </div>
              )}

              {product.commissions && (
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium">עמלת היקף</label>
                    <div className="text-lg font-bold text-green-600">
                      ₪{product.commissions.scope.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">עמלת נפרעים</label>
                    <div className="text-lg font-bold text-blue-600">
                      ₪{product.commissions.monthly.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedProducts.length > 0 && (
        <div className="flex flex-col gap-4">
          <Button 
            onClick={calculateTotalCommissions}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Calculator className="w-5 h-5 mr-2" />
            חשב עמלות
          </Button>

          {calculatedCommissions && (
            <Card className="border-2 border-yellow-100">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center">
                  סה"כ עמלות: ₪{getTotalCommissions().toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {renderCommissionSummary()}
    </div>
  );
};

export default CustomerJourneyComponent;
