import React from 'react';
import type { MealLogRecord, MealLogStatus } from '../nutritionHistory.types';
import { logsForDate, parseKey } from '../nutritionHistory.utils';
import { getSuggestedDishes } from '../nutritionHistory.mock';
import { RangeCard } from '../components/RangeCard';
import { MealLogRow } from '../components/MealLogRow';

const formatVNDate = (d: Date) =>
  d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export interface DayViewProps {
  dateKey: string;
  logs: MealLogRecord[];
  onNav: (deltaDays: number) => void;
  onSetStatus: (log: MealLogRecord, status: MealLogStatus) => void;
  onSaveCustom: (log: MealLogRecord, note: string) => void;
}

/** Chế độ Ngày — danh sách dọc các bữa. */
export const DayView: React.FC<DayViewProps> = ({
  dateKey,
  logs,
  onNav,
  onSetStatus,
  onSaveCustom,
}) => {
  const date = parseKey(dateKey);
  const dayLogs = logsForDate(logs, dateKey);

  return (
    <RangeCard
      title="Chi tiết theo ngày"
      label={formatVNDate(date)}
      labelMinWidth={200}
      onPrev={() => onNav(-1)}
      onNext={() => onNav(1)}
    >
      {dayLogs.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          Không có bữa ăn nào cho ngày này.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {dayLogs.map((log) => (
            <MealLogRow
              key={log.id}
              log={log}
              suggestedDishes={getSuggestedDishes(log.mealType)}
              onSetStatus={onSetStatus}
              onSaveCustom={onSaveCustom}
            />
          ))}
        </div>
      )}
    </RangeCard>
  );
};
