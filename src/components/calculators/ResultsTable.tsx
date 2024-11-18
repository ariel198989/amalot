import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share2, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

interface Column {
  key: string;
  label: string;
  format?: (value: any) => string;
}

interface ResultsTableProps {
  data: any[];
  columns: Column[];
  onDownload: () => void;
  onShare: () => void;
  onClear: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  columns,
  onDownload,
  onShare,
  onClear
}) => {
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(row => {
        const formattedRow: any = {};
        columns.forEach(column => {
          formattedRow[column.label] = column.format 
            ? column.format(row[column.key])
            : row[column.key];
        });
        return formattedRow;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "תוצאות");
    
    // הגדרת כיוון RTL
    worksheet['!cols'] = columns.map(() => ({ wch: 15 }));
    worksheet['!dir'] = 'rtl';

    XLSX.writeFile(workbook, "דוח_עמלות.xlsx");
  };

  const downloadPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #1a365d; text-align: center; margin-bottom: 30px;">דוח עמלות</h1>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8fafc;">
              ${columns.map(column => `
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">
                  ${column.label}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                ${columns.map(column => `
                  <td style="padding: 12px; text-align: right;">
                    ${column.format ? column.format(row[column.key]) : row[column.key]}
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: 'דוח_עמלות.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape'
      }
    };

    html2pdf().from(element).set(opt).save();
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <Card dir="rtl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">תוצאות החישוב</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={downloadExcel} 
            title="ייצא לאקסל"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={downloadPDF} 
            title="ייצא ל-PDF"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onShare} 
            title="שתף"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onClear} 
            title="נקה טבלה"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                {columns.map((column) => (
                  <th key={column.key} className="p-3 text-right font-medium text-gray-600">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="p-3 text-right">
                      {column.format ? column.format(row[column.key]) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;