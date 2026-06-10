import React, { useMemo, useState } from 'react';
import type { MealLogRecord, MealLogStatus, RangeMode } from './nutritionHistory.types';
import { MOCK_LOGS, MOCK_TODAY } from './nutritionHistory.mock';
import {
  addDays,
  fmtKey,
  logsForMonth,
  logsForWeek,
  parseKey,
} from './nutritionHistory.utils';
import { RangeSegmentedControl } from './components/RangeSegmentedControl';
import { ComplianceSummaryCard } from './components/ComplianceSummaryCard';
import { NutritionHistoryEmptyState } from './components/NutritionHistoryEmptyState';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';

export interface NutritionHistoryPageProps {
  /**
   * Truyền dữ liệu thật khi tích hợp (vd: từ useQuery /api/meal-log/history).
   * Bỏ trống → dùng MOCK_LOGS để render design.
   */
  initialLogs?: MealLogRecord[];
  today?: Date;
}

/**
 * Trang "Nhật ký bữa ăn & Tuân thủ" — /nutrition-history.
 * Đặt trong MainLayout (sidebar). State quản lý cục bộ; thay các handler
 * setStatus/saveCustom bằng mutation gọi API khi tích hợp.
 */
const NutritionHistoryPage: React.FC<NutritionHistoryPageProps> = ({
  initialLogs = MOCK_LOGS,
  today = MOCK_TODAY,
}) => {
  const todayKey = fmtKey(today);
  const [range, setRange] = useState<RangeMode>('day');
  const [dayKey, setDayKey] = useState(todayKey);
  const [weekAnchor, setWeekAnchor] = useState(todayKey);
  const [monthAnchor, setMonthAnchor] = useState(todayKey);
  const [logs, setLogs] = useState<MealLogRecord[]>(initialLogs);

  // Logs trong khoảng đang chọn → thẻ tóm tắt tuân thủ.
  const rangeLogs = useMemo(() => {
    if (range === 'day') return logs.filter((l) => l.mealDate === dayKey);
    if (range === 'week') return logsForWeek(logs, weekAnchor);
    return logsForMonth(logs, monthAnchor);
  }, [range, dayKey, weekAnchor, monthAnchor, logs]);

  const rangeLabel = range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : 'Tháng';

  // --- handlers (mock). TODO: thay bằng API mutation. ---
  const handleSetStatus = (log: MealLogRecord, status: MealLogStatus) =>
    setLogs((prev) =>
      prev.map((l) => (l.id === log.id ? { ...l, status, customNote: null } : l))
    );

  const handleSaveCustom = (log: MealLogRecord, note: string) =>
    setLogs((prev) =>
      prev.map((l) =>
        l.id === log.id
          ? { ...l, status: 'CUSTOM', customNote: note || 'Đã ăn món khác' }
          : l
      )
    );

  const handlePickDay = (key: string) => {
    setDayKey(key);
    setRange('day');
  };

  const hasAnyData = logs.length > 0;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký bữa ăn</h1>
          <p className="mt-1 text-sm text-gray-500">
            Xem bạn đã ăn gì và mức độ bám sát thực đơn.
          </p>
        </div>
        <RangeSegmentedControl value={range} onChange={setRange} />
      </div>

      {!hasAnyData ? (
        <NutritionHistoryEmptyState />
      ) : (
        <div className="flex flex-col gap-5">
          <ComplianceSummaryCard rangeLabel={rangeLabel} logs={rangeLogs} />

          {range === 'day' && (
            <DayView
              dateKey={dayKey}
              logs={logs}
              onNav={(n) => setDayKey(fmtKey(addDays(parseKey(dayKey), n)))}
              onSetStatus={handleSetStatus}
              onSaveCustom={handleSaveCustom}
            />
          )}
          {range === 'week' && (
            <WeekView
              anchorKey={weekAnchor}
              logs={logs}
              today={today}
              onNav={(n) => setWeekAnchor(fmtKey(addDays(parseKey(weekAnchor), n)))}
              onPickDay={handlePickDay}
            />
          )}
          {range === 'month' && (
            <MonthView
              anchorKey={monthAnchor}
              logs={logs}
              today={today}
              onNav={(n) => {
                const a = parseKey(monthAnchor);
                setMonthAnchor(fmtKey(new Date(a.getFullYear(), a.getMonth() + n, 1)));
              }}
              onPickDay={handlePickDay}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NutritionHistoryPage;
