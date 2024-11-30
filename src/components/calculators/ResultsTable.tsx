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
  width?: string;
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
    <Card className="mt-6 overflow-hidden border rounded-lg shadow-sm max-w-7xl mx-auto">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
          <CardTitle className="text-xl font-bold text-gray-900">תוצאות החישוב</CardTitle>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-lg font-medium text-gray-700">
              סה"כ עמלות: ₪{data.reduce((sum, row) => sum + (row.totalCommission || 0), 0).toLocaleString()}
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
              className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload} 
            className="flex-1 md:flex-none items-center gap-2 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            <span>ייצא לאקסל</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShare}
            className="flex-1 md:flex-none items-center gap-2 bg-white hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4" />
            <span>שתף</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th 
                        key={column.key} 
                        className="px-4 py-3 text-right text-sm font-medium text-gray-600"
                        style={{ minWidth: column.width || '150px' }}
                      >
                        {column.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 w-20">פעולות</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors">
                      {columns.map((column) => (
                        <td 
                          key={column.key} 
                          className="px-4 py-3 text-right text-sm text-gray-700 whitespace-nowrap"
                          style={{ minWidth: column.width || '150px' }}
                        >
                          {column.format ? column.format(row[column.key]) : row[column.key]}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right w-20">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;