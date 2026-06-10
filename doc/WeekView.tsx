import React from 'react';
import type { MealLogRecord } from '../nutritionHistory.types';
import { DAY_LABELS, MEAL_LABEL, MEAL_ORDER, STATUS_META } from '../nutritionHistory.constants';
import { MOCK_TODAY } from '../nutritionHistory.mock';
import {
  addDays,
  fmtKey,
  isSameDay,
  logsForDate,
  parseKey,
  startOfWeek,
} from '../nutritionHistory.utils';
import { RangeCard } from '../components/RangeCard';
import { StatusLegend } from '../components/StatusBadge';

export interface WeekViewProps {
  anchorKey: string;
  logs: MealLogRecord[];
  today?: Date;
  onNav: (deltaDays: number) => void;
  onPickDay: (dateKey: string) => void;
}

/** Chế độ Tuần — lưới 7 cột (T2–CN); mỗi ô là một bữa tô màu theo trạng thái. */
export const WeekView: React.FC<WeekViewProps> = ({
  anchorKey,
  logs,
  today = MOCK_TODAY,
  onNav,
  onPickDay,
}) => {
  const monday = startOfWeek(parseKey(anchorKey));
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const end = addDays(monday, 6);
  const rangeLabel = `${monday.getDate()}/${monday.getMonth() + 1} – ${end.getDate()}/${end.getMonth() + 1}`;

  return (
    <RangeCard
      title="Theo tuần"
      label={rangeLabel}
      labelMinWidth={110}
      onPrev={() => onNav(-7)}
      onNext={() => onNav(7)}
    >
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const key = fmtKey(d);
          const dayLogs = logsForDate(logs, key);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPickDay(key)}
              className={`group flex flex-col items-center gap-2 rounded-xl border p-2 pt-2.5 text-center transition hover:border-brand-green hover:shadow-sm ${
                isToday ? 'border-brand-green bg-brand-green-light/40' : 'border-gray-200 bg-white'
              }`}
            >
              <div className={`text-[11px] font-bold tracking-wide ${isToday ? 'text-brand-green-darker' : 'text-gray-400'}`}>
                {DAY_LABELS[i]}
              </div>
              <div
                className={`text-sm font-bold ${isToday ? 'text-brand-green-darker' : 'text-gray-700'}`}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {d.getDate()}
              </div>
              <div className="flex w-full flex-col items-center gap-1">
                {MEAL_ORDER.map((mt) => {
                  const log = dayLogs.find((l) => l.mealType === mt);
                  const st = log ? log.status : 'SUGGESTED';
                  const s = STATUS_META[st];
                  return (
                    <div
                      key={mt}
                      title={`${MEAL_LABEL[mt]}: ${s.label}`}
                      className={`h-3.5 w-full max-w-9 rounded-[5px] ${
                        st === 'SUGGESTED' ? 'border border-dashed border-gray-300 bg-gray-50' : ''
                      }`}
                      style={st === 'SUGGESTED' ? undefined : { backgroundColor: s.color }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
      <StatusLegend className="mt-5" />
    </RangeCard>
  );
};
