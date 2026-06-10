import React from 'react';
import type { MealLogStatus } from '../nutritionHistory.types';
import { STATUS_FILTER_ORDER, STATUS_META } from '../nutritionHistory.constants';

/** Pill nhỏ thể hiện trạng thái bữa ăn. */
export const StatusBadge: React.FC<{ status: MealLogStatus }> = ({ status }) => {
  const s = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.chipClass}`}
    >
      {status === 'SUGGESTED' ? (
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      )}
      {s.label}
    </span>
  );
};

/** Chú thích màu trạng thái. */
export const StatusLegend: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
    {STATUS_FILTER_ORDER.map((k) => {
      const s = STATUS_META[k];
      return (
        <span key={k} className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
          {k === 'SUGGESTED' ? (
            <span className="inline-block h-3 w-3 rounded-[4px] border border-dashed border-gray-300 bg-white" />
          ) : (
            <span className="inline-block h-3 w-3 rounded-[4px]" style={{ backgroundColor: s.color }} />
          )}
          {s.label}
        </span>
      );
    })}
  </div>
);
