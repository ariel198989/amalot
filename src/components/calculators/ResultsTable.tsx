import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Building2, ArrowUpRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { productTypes } from '@/config/products';
import html2pdf from 'html2pdf.js';

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
  customerName: string;
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
  columns,
  onDownload,
  onShare,
  onClear,
  customerName,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  React.useEffect(() => {
    return () => {
      if (onClear) {
        void onClear;
      }
    };
  }, [onClear]);

  const exportToPDF = () => {
    try {
      setIsPrinting(true);
      const element = document.querySelector('.results-content');
      if (!element) {
        console.error('Element not found');
        return;
      }

      const opt = {
        margin: [15, 15, 15, 15],
        filename: `סיכום_מכירות_${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      html2pdf().from(element).set(opt).save().then(() => {
        setIsPrinting(false);
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setIsPrinting(false);
    }
  };

  if (data.length === 0) {
    return null;
  }

  const currentDate = new Date().toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
              <div className="relative">
                <Button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="bg-white/10 hover:bg-white/20 text-white
                           flex items-center gap-2 px-4 py-2 rounded-xl"
                >
                  <Download className="h-4 w-4" />
                  <span>ייצא דוח</span>
                </Button>

                {showExportMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu">
                        <button
                          onClick={() => {
                            onDownload();
                            setShowExportMenu(false);
                          }}
                          className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          ייצא לאקסל
                        </button>
                        <button
                          onClick={() => {
                            exportToPDF();
                            setShowExportMenu(false);
                          }}
                          className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          ייצא לPDF
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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

        <CardContent className={`p-6 results-content text-right ${isPrinting ? 'printing-pdf' : ''}`} dir="rtl">
          <style>
            {`
              @media print, .printing-pdf {
                .results-content {
                  font-size: 12px !important;
                }
                .results-content .text-lg {
                  font-size: 14px !important;
                }
                .results-content .text-base {
                  font-size: 12px !important;
                }
                .results-content .text-sm {
                  font-size: 11px !important;
                }
                .results-content .p-6 {
                  padding: 1rem !important;
                }
                .results-content .gap-6 {
                  gap: 0.75rem !important;
                }
                .results-content .mb-8 {
                  margin-bottom: 1rem !important;
                }
                .results-content .mb-6 {
                  margin-bottom: 0.75rem !important;
                }
                .results-content .mb-4 {
                  margin-bottom: 0.5rem !important;
                }
                .results-content .space-y-4 > * + * {
                  margin-top: 0.5rem !important;
                }
                .no-print-pdf {
                  display: none !important;
                }
              }
            `}
          </style>

          <div className="mb-8 text-right">
            <div className="mb-6">
              <div className="text-lg font-medium mb-2">{currentDate}</div>
              <div className="text-lg mb-1">לכבוד</div>
              <div className="text-lg font-medium">{customerName}</div>
              <div className="text-lg mb-4">א.ג.נ,</div>
              <div className="text-lg mb-6">הנדון: דוח סיכום מכירות</div>
              <div className="text-base mb-8">
                מצ"ב דוח המפרט את סיכום המכירות שלך. הדוח כולל את כל הפרטים והנתונים הרלוונטיים לעסקאות שבוצעו.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <table className="w-full">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="p-2 text-right font-medium text-gray-600">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    {columns.map((column) => (
                      <td key={column.key} className="p-2 text-right">
                        {column.format ? column.format(item[column.key]) : item[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

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

            {!isPrinting && (
              <div className="bg-[#4318FF]/5 rounded-2xl p-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#4318FF] font-medium">את נתוני המכירה ניתן לראות ב"דוחות"</span>
                  <ArrowUpRight className="h-5 w-5 text-[#4318FF]" />
                </div>
              </div>
            )}

            <div className="mt-8 text-right">
              <div className="text-base mb-2">בברכה,</div>
              <div className="text-base font-medium">צוות המכירות</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResultsTable;