import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';

interface WorkPlanTableProps {
  agent_id: string;
  year: number;
}

const WorkPlanTable: React.FC<WorkPlanTableProps> = () => {
  const tableRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden relative">
        <div className="p-4">
          <div
            ref={tableRef}
            className="overflow-x-auto"
            style={{ maxWidth: '100%', scrollbarWidth: 'thin' }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <tbody>
                {/* Table content */}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkPlanTable;
