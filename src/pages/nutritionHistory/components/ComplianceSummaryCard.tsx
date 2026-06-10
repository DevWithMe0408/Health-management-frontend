import React from 'react';
import type { ComplianceCounts, MealLogRecord } from '../nutritionHistory.types';
import { STATUS_FILTER_ORDER, STATUS_META } from '../nutritionHistory.constants';
import { computeCompliance } from '../nutritionHistory.utils';
import { ComplianceRing } from './ComplianceRing';

/** "X đúng · Y ăn khác · Z bỏ bữa · W chưa báo cáo". */
const ComplianceBreakdown: React.FC<{ counts: ComplianceCounts }> = ({ counts }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
    {STATUS_FILTER_ORDER.map((k) => {
      const s = STATUS_META[k];
      return (
        <div key={k} className="rounded-xl border border-gray-100 bg-gray-50/60 px-3.5 py-3">
          <div className="flex items-center gap-1.5">
            {k === 'SUGGESTED' ? (
              <span className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-gray-300 bg-white" />
            ) : (
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            )}
            <span className="text-2xl font-bold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {counts[k]}
            </span>
          </div>
          <div className="mt-0.5 text-xs font-medium text-gray-500">{s.label}</div>
        </div>
      );
    })}
  </div>
);

/** Card "Mức độ tuân thủ" — luôn hiển thị, theo khoảng đang chọn. */
export const ComplianceSummaryCard: React.FC<{
  rangeLabel: string;
  logs: MealLogRecord[];
}> = ({ rangeLabel, logs }) => {
  const { counts, percent, reported } = computeCompliance(logs);

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-6"
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)' }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {`Mức độ tuân thủ · ${rangeLabel}`}
        </h3>
        <span className="rounded-full bg-brand-green-light px-2.5 py-1 text-xs font-semibold text-brand-green-darker">
          {reported} bữa đã báo cáo
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="shrink-0">
          <ComplianceRing counts={counts} percent={percent} />
        </div>
        <div className="w-full flex-1">
          <p className="mb-3 text-sm text-gray-500">
            Trong số <span className="font-semibold text-gray-700">{reported}</span> bữa đã báo cáo,
            bạn ăn đúng đề xuất <span className="font-semibold text-brand-green">{counts.FOLLOWED}</span> bữa.
          </p>
          <ComplianceBreakdown counts={counts} />
        </div>
      </div>
    </section>
  );
};
