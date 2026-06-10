import React from 'react';
import type { MealLogRecord, MealLogStatus } from '../nutritionHistory.types';
import { DAY_LABELS, STATUS_META } from '../nutritionHistory.constants';
import { MOCK_TODAY } from '../nutritionHistory.mock';
import { computeCompliance, fmtKey, isSameDay, logsForDate, parseKey } from '../nutritionHistory.utils';
import { RangeCard } from '../components/RangeCard';
import { StatusLegend } from '../components/StatusBadge';

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

export interface MonthViewProps {
  anchorKey: string;
  logs: MealLogRecord[];
  today?: Date;
  /** deltaMonths: -1 / +1 */
  onNav: (deltaMonths: number) => void;
  onPickDay: (dateKey: string) => void;
}

/** Chế độ Tháng — lịch; mỗi ô ngày hiển thị chấm/màu tóm tắt mức tuân thủ. */
export const MonthView: React.FC<MonthViewProps> = ({
  anchorKey,
  logs,
  today = MOCK_TODAY,
  onNav,
  onPickDay,
}) => {
  const anchor = parseKey(anchorKey);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // tuần bắt đầu T2
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const daySummary = (key: string) => {
    const dl = logsForDate(logs, key);
    const { counts, reported, percent } = computeCompliance(dl);
    let dominant: MealLogStatus = 'SUGGESTED';
    if (reported > 0) {
      dominant = (['FOLLOWED', 'CUSTOM', 'SKIPPED'] as const).reduce(
        (a, b) => (counts[b] > counts[a] ? b : a),
        'FOLLOWED' as MealLogStatus
      );
    }
    return { reported, percent, dominant };
  };

  return (
    <RangeCard
      title="Theo tháng"
      label={`${MONTH_NAMES[month]} ${year}`}
      labelMinWidth={130}
      onPrev={() => onNav(-1)}
      onNext={() => onNav(1)}
    >
      <div className="mb-2 grid grid-cols-7 gap-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wide text-gray-400">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const key = fmtKey(d);
          const isToday = isSameDay(d, today);
          const { reported, percent, dominant } = daySummary(key);
          const s = STATUS_META[dominant];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPickDay(key)}
              className={`flex aspect-square flex-col items-center justify-between rounded-xl border p-1.5 transition hover:border-brand-green hover:shadow-sm ${
                isToday ? 'border-brand-green ring-1 ring-brand-green/30' : 'border-gray-100'
              }`}
            >
              <span
                className={`self-end text-xs font-semibold ${isToday ? 'text-brand-green-darker' : 'text-gray-500'}`}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {d.getDate()}
              </span>
              <div className="flex flex-col items-center gap-1 pb-0.5">
                {reported > 0 ? (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[10px] font-bold text-gray-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {percent}%
                    </span>
                  </>
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full border border-dashed border-gray-300 bg-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      <StatusLegend className="mt-5" />
    </RangeCard>
  );
};
