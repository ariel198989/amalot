import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Trash2 } from 'lucide-react';

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
  if (data.length === 0) {
    return null;
  }

  return (
    <Card dir="rtl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">תוצאות החישוב</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onDownload} title="ייצא לאקסל">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onShare} title="שתף בוואטסאפ">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onClear} title="נקה טבלה">
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