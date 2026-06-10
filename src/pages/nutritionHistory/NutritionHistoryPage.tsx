import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MealLogRecord, MealLogStatus, RangeMode } from './nutritionHistory.types';
import {
  addDays,
  fmtKey,
  logsForMonth,
  logsForWeek,
  parseKey,
  startOfWeek,
} from './nutritionHistory.utils';
import {
  getMealLogHistoryRange,
  updateMealStatus,
  type MealLogHistoryItem,
} from '../../services/mealLog.service';
import { getApiErrorMessage } from '../../services/apiResponse';
import { RangeSegmentedControl } from './components/RangeSegmentedControl';
import { ComplianceSummaryCard } from './components/ComplianceSummaryCard';
import { NutritionHistoryEmptyState } from './components/NutritionHistoryEmptyState';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';

const STATUS_MAP: Record<string, MealLogStatus> = {
  SUGGESTED: 'SUGGESTED',
  FOLLOWED: 'FOLLOWED',
  MODIFIED: 'CUSTOM',
  CUSTOM: 'CUSTOM',
  SKIPPED: 'SKIPPED',
};

const toRecord = (item: MealLogHistoryItem): MealLogRecord => {
  const status = STATUS_MAP[item.status] ?? 'SUGGESTED';

  return {
    id: item.id,
    mealDate: item.mealDate,
    mealType: item.mealType,
    status,
    customNote: item.customNote ?? null,
    totalKcalActual: status === 'CUSTOM' ? 0 : Math.round(Number(item.totalKcalActual) || 0),
    dishes: (item.dishes ?? []).map((dish) => ({
      dishName: dish.dishName ?? 'Món ăn',
      dishKcal: Math.round(Number(dish.dishKcal) || 0),
    })),
  };
};

const NutritionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const todayKey = fmtKey(today);

  const [range, setRange] = useState<RangeMode>('day');
  const [dayKey, setDayKey] = useState(todayKey);
  const [weekAnchor, setWeekAnchor] = useState(todayKey);
  const [monthAnchor, setMonthAnchor] = useState(todayKey);
  const [logs, setLogs] = useState<MealLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRange = useMemo(() => {
    if (range === 'day') return { from: dayKey, to: dayKey };

    if (range === 'week') {
      const monday = startOfWeek(parseKey(weekAnchor));
      return { from: fmtKey(monday), to: fmtKey(addDays(monday, 6)) };
    }

    const anchor = parseKey(monthAnchor);
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    return { from: fmtKey(first), to: fmtKey(last) };
  }, [range, dayKey, weekAnchor, monthAnchor]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const items = await getMealLogHistoryRange(fetchRange.from, fetchRange.to);
        if (!cancelled) setLogs(items.map(toRecord));
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, 'Không tải được nhật ký bữa ăn.'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchRange.from, fetchRange.to]);

  const rangeLogs = useMemo(() => {
    if (range === 'day') return logs.filter((log) => log.mealDate === dayKey);
    if (range === 'week') return logsForWeek(logs, weekAnchor);
    return logsForMonth(logs, monthAnchor);
  }, [range, dayKey, weekAnchor, monthAnchor, logs]);

  const rangeLabel = range === 'day' ? 'Ngày' : range === 'week' ? 'Tuần' : 'Tháng';

  const replaceLog = (updated: MealLogHistoryItem) => {
    const nextRecord = toRecord(updated);
    setLogs((current) => current.map((log) => (log.id === nextRecord.id ? nextRecord : log)));
  };

  const handleSetStatus = async (log: MealLogRecord, status: MealLogStatus) => {
    const previousLogs = logs;
    setError(null);
    setLogs((current) =>
      current.map((item) =>
        item.id === log.id
          ? {
              ...item,
              status,
              customNote: null,
              totalKcalActual: status === 'FOLLOWED' ? item.totalKcalActual : 0,
            }
          : item
      )
    );

    try {
      const updated = await updateMealStatus(log.id, status, null);
      replaceLog(updated);
    } catch (updateError) {
      setLogs(previousLogs);
      setError(getApiErrorMessage(updateError, 'Không cập nhật được trạng thái bữa ăn.'));
    }
  };

  const handleSaveCustom = async (log: MealLogRecord, note: string) => {
    const finalNote = note.trim() || 'Đã ăn món khác';
    const previousLogs = logs;
    setError(null);
    setLogs((current) =>
      current.map((item) =>
        item.id === log.id
          ? {
              ...item,
              status: 'CUSTOM',
              customNote: finalNote,
              totalKcalActual: 0,
            }
          : item
      )
    );

    try {
      const updated = await updateMealStatus(log.id, 'CUSTOM', finalNote);
      replaceLog(updated);
    } catch (updateError) {
      setLogs(previousLogs);
      setError(getApiErrorMessage(updateError, 'Không lưu được ghi chú bữa ăn.'));
    }
  };

  const handlePickDay = (key: string) => {
    setDayKey(key);
    setRange('day');
  };

  const showInitialEmpty =
    !isLoading && logs.length === 0 && range === 'day' && dayKey === todayKey;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký bữa ăn</h1>
          <p className="mt-1 text-sm text-gray-500">
            Xem bạn đã ăn gì và mức độ bám sát thực đơn.
          </p>
        </div>
        <RangeSegmentedControl value={range} onChange={setRange} />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-brand-green" />
          <p className="ml-3 text-sm text-gray-500">Đang tải nhật ký...</p>
        </div>
      ) : showInitialEmpty ? (
        <NutritionHistoryEmptyState onCreatePlan={() => navigate('/nutrition-plan')} />
      ) : (
        <div className="flex flex-col gap-5">
          <ComplianceSummaryCard rangeLabel={rangeLabel} logs={rangeLogs} />

          {range === 'day' && (
            <DayView
              dateKey={dayKey}
              logs={logs}
              onNav={(deltaDays) => setDayKey(fmtKey(addDays(parseKey(dayKey), deltaDays)))}
              onSetStatus={handleSetStatus}
              onSaveCustom={handleSaveCustom}
            />
          )}
          {range === 'week' && (
            <WeekView
              anchorKey={weekAnchor}
              logs={logs}
              today={today}
              onNav={(deltaDays) =>
                setWeekAnchor(fmtKey(addDays(parseKey(weekAnchor), deltaDays)))
              }
              onPickDay={handlePickDay}
            />
          )}
          {range === 'month' && (
            <MonthView
              anchorKey={monthAnchor}
              logs={logs}
              today={today}
              onNav={(deltaMonths) => {
                const anchor = parseKey(monthAnchor);
                setMonthAnchor(
                  fmtKey(new Date(anchor.getFullYear(), anchor.getMonth() + deltaMonths, 1))
                );
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
