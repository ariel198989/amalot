import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share2, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import { toast } from 'react-hot-toast';

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
  onDeleteRow?: (index: number, rowData: any) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  columns,
  onDownload,
  onShare,
  onClear,
  onDeleteRow
}) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 overflow-hidden border rounded-lg shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between bg-gray-50/80 px-6 py-4">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xl font-semibold text-gray-900">תוצאות החישוב</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-gray-700">
              סה"כ: ₪{data.reduce((sum, row) => sum + row.totalCommission, 0).toLocaleString()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (window.confirm('האם אתה בטוח שברצונך למחוק את כל התוצאות?')) {
                  onClear();
                  toast.success('כל התוצאות נמחקו בהצלחה');
                }
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload} 
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>ייצא לאקסל</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span>שתף</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50/50">
                {columns.reverse().map((column) => (
                  <th key={column.key} className="p-4 text-right font-medium text-gray-600 whitespace-nowrap">
                    {column.label}
                  </th>
                ))}
                <th className="p-4 text-right font-medium text-gray-600">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50/50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="p-4 text-right text-gray-700 whitespace-nowrap">
                      {column.format ? column.format(row[column.key]) : row[column.key]}
                    </td>
                  ))}
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm('האם אתה בטוח שברצונך למחוק רשומה זו?')) {
                          onDeleteRow?.(rowIndex, row);
                          toast.success('הרשומה נמחקה בהצלחה');
                        }
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
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