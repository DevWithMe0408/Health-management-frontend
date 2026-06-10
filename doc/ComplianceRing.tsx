import React from 'react';
import type { ComplianceCounts } from '../nutritionHistory.types';
import { STATUS_META } from '../nutritionHistory.constants';

interface ComplianceRingProps {
  counts: ComplianceCounts;
  percent: number;
  size?: number;
  stroke?: number;
}

/**
 * Vòng tròn tiến độ nhiều phân đoạn (đúng / ăn khác / bỏ bữa).
 * Hand-rolled SVG donut — có thể thay bằng Recharts <PieChart> nếu muốn.
 */
export const ComplianceRing: React.FC<ComplianceRingProps> = ({
  counts,
  percent,
  size = 132,
  stroke = 13,
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const reported = counts.FOLLOWED + counts.CUSTOM + counts.SKIPPED;

  const segs = reported === 0
    ? []
    : (
        [
          { v: counts.FOLLOWED, color: STATUS_META.FOLLOWED.color },
          { v: counts.CUSTOM, color: STATUS_META.CUSTOM.color },
          { v: counts.SKIPPED, color: STATUS_META.SKIPPED.color },
        ] as const
      ).filter((s) => s.v > 0);

  let offset = 0;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        {segs.map((s, i) => {
          const len = (s.v / reported) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinecap="butt"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div
            className="text-3xl font-bold leading-none text-gray-900"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {percent}
            <span className="text-lg">%</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Tuân thủ
          </div>
        </div>
      </div>
    </div>
  );
};
