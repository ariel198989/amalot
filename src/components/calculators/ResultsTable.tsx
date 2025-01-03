import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Trash2, Building2, ArrowUpRight, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { productTypes } from '@/config/products';

interface Column {
  key: string;
  label: string;
  format?: (value: any) => string;
  width?: string;
}

interface ResultsTableProps {
  data: any[];
  columns: Column[];
  onDownload: () => void;
  onShare: () => void;
  onClear: () => void;
}

const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('he-IL');
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const getInsuranceTypeLabel = (type: string) => {
  const insuranceProducts = productTypes.find(p => p.id === 'insurance')?.products;
  const product = insuranceProducts?.find(p => p.value === type);
  return product?.label || type;
};

const getInvestmentTypeLabel = (type: string) => {
  const investmentProducts = productTypes.find(p => p.id === 'investment')?.products;
  const product = investmentProducts?.find(p => p.value === type);
  return product?.label || type;
};

const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  onDownload,
  onShare,
  onClear,
}) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={tableVariants}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="overflow-hidden border-0 rounded-3xl shadow-lg bg-white">
        <CardHeader className="bg-gradient-to-r from-[#4318FF] to-[#868CFF] px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white mb-1">סיכום מכירות</CardTitle>
                <p className="text-white/80 text-sm">פירוט המכירות לפי סוגי מוצרים</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={onDownload}
                className="bg-white/10 hover:bg-white/20 text-white
                         flex items-center gap-2 px-4 py-2 rounded-xl"
              >
                <Download className="h-4 w-4" />
                <span>ייצא דוח</span>
              </Button>
              <Button 
                onClick={onShare}
                className="bg-white/10 hover:bg-white/20 text-white
                         flex items-center gap-2 px-4 py-2 rounded-xl"
              >
                <Share2 className="h-4 w-4" />
                <span>שתף</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {data.map((item, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#4318FF] rounded-full p-2">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.client_name}</div>
                        <div className="text-sm text-gray-500">{formatDate(item.date)}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-[#4318FF]">{item.company}</div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-6">
                      {(item.pensionType || item.transactionType || item.insurance_type || item.investment_type) && (
                        <div>
                          <div className="text-sm text-gray-500 mb-1">סוג מוצר</div>
                          <div className="font-medium text-gray-900">
                            {item.pensionType === 'comprehensive' ? 'פנסיה מקיפה' : 
                             item.pensionType === 'supplementary' ? 'פנסיה משלימה' :
                             item.transactionType === 'personal_accident' ? 'תאונות אישיות' :
                             item.transactionType === 'mortgage' ? 'משכנתא' :
                             item.transactionType === 'health' ? 'בריאות' :
                             item.transactionType === 'critical_illness' ? 'מחלות קשות' :
                             item.transactionType === 'insurance_umbrella' ? 'מטריה ביטוחית' :
                             item.transactionType === 'risk' ? 'ריסק' :
                             item.transactionType === 'service' ? 'כתבי שירות' :
                             item.transactionType === 'disability' ? 'אכ"ע' :
                             item.insurance_type || item.investment_type || ''}
                          </div>
                        </div>
                      )}

                      {item.pensionType ? (
                        <div className="col-span-2">
                          <div className="flex items-center justify-center gap-3 bg-[#4318FF]/5 p-4 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <div className="text-lg font-medium text-[#4318FF]">
                              {formatCurrency(item.salary || 0)} שכר ב{item.pensionType === 'comprehensive' ? 'פנסיה מקיפה' : 'פנסיה משלימה'}
                              {item.totalAccumulated > 0 && (
                                <span className="text-sm mr-2">
                                  (צבירה: {formatCurrency(item.totalAccumulated)})
                                </span>
                              )}
                              {item.pensionContribution && (
                                <span className="text-sm mr-2">
                                  {item.pensionContribution}% הפרשה
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : item.insuranceType ? (
                        <div className="col-span-2">
                          <div className="flex items-center justify-center gap-3 bg-[#4318FF]/5 p-4 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <div className="text-lg font-medium text-[#4318FF]">
                              {formatCurrency(item.insurancePremium || 0)} פרמיה בביטוח {getInsuranceTypeLabel(item.insuranceType)}
                            </div>
                          </div>
                        </div>
                      ) : item.investmentAmount ? (
                        <div className="col-span-2">
                          <div className="flex items-center justify-center gap-3 bg-[#4318FF]/5 p-4 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <div className="text-lg font-medium text-[#4318FF]">
                              {formatCurrency(item.investmentAmount || 0)} {getInvestmentTypeLabel(item.productType)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-500 mb-1">סכום השקעה</div>
                          <div className="font-medium text-[#4318FF]">
                            {formatCurrency(item.investmentAmount || 0)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-[#4318FF]/5 rounded-2xl p-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-[#4318FF] font-medium">את נתוני המכירה ניתן לראות ב"דוחות"</span>
                <ArrowUpRight className="h-5 w-5 text-[#4318FF]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResultsTable;