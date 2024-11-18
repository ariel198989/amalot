import React from 'react';
import { Download, Send, Trash2 } from 'lucide-react';

interface ResultsTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    format?: (value: any) => string;
  }[];
  onDownload: () => void;
  onShare: () => void;
  onClear: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  columns,
  onDownload,
  onShare,
  onClear,
}) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">תוצאות החישוב</h2>
        <div className="flex gap-2">
          <button
            onClick={onDownload}
            className="btn btn-primary flex items-center"
          >
            <Download className="w-4 h-4 ml-2" />
            ייצוא לאקסל
          </button>
          <button
            onClick={onShare}
            className="btn btn-primary flex items-center"
          >
            <Send className="w-4 h-4 ml-2" />
            שיתוף בוואטסאפ
          </button>
          <button
            onClick={onClear}
            className="btn btn-secondary flex items-center"
          >
            <Trash2 className="w-4 h-4 ml-2" />
            נקה
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-2 text-right">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-t">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2">
                    {column.format ? column.format(row[column.key]) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;