import type {
  ComplianceResult,
  MealLogRecord,
  MealType,
} from './nutritionHistory.types';
import { MEAL_ORDER } from './nutritionHistory.constants';

/* ---- date helpers (tuần bắt đầu Thứ 2) --------------------------- */
export const fmtKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const parseKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number): Date => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const startOfWeek = (d: Date): Date => {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
};

export const isSameDay = (a: Date, b: Date): boolean => fmtKey(a) === fmtKey(b);

/* ---- compliance --------------------------------------------------
 * % = FOLLOWED / (FOLLOWED + CUSTOM + SKIPPED). SUGGESTED đếm riêng. */
export function computeCompliance(logs: MealLogRecord[]): ComplianceResult {
  const counts = { FOLLOWED: 0, CUSTOM: 0, SKIPPED: 0, SUGGESTED: 0 };
  logs.forEach((l) => {
    counts[l.status] += 1;
  });
  const reported = counts.FOLLOWED + counts.CUSTOM + counts.SKIPPED;
  const percent = reported === 0 ? 0 : Math.round((counts.FOLLOWED / reported) * 100);
  return { counts, reported, percent, total: logs.length };
}

/** Lấy các bữa của một ngày, sắp theo thứ tự bữa. */
export function logsForDate(logs: MealLogRecord[], key: string): MealLogRecord[] {
  const byType = new Map<MealType, MealLogRecord>();
  logs.filter((l) => l.mealDate === key).forEach((l) => byType.set(l.mealType, l));
  return MEAL_ORDER.map((mt) => byType.get(mt)).filter(
    (x): x is MealLogRecord => Boolean(x)
  );
}

/** Lọc theo khoảng đang chọn — dùng cho thẻ tóm tắt tuân thủ. */
export function logsForWeek(logs: MealLogRecord[], anchorKey: string): MealLogRecord[] {
  const monday = startOfWeek(parseKey(anchorKey));
  const keys = new Set(Array.from({ length: 7 }, (_, i) => fmtKey(addDays(monday, i))));
  return logs.filter((l) => keys.has(l.mealDate));
}

export function logsForMonth(logs: MealLogRecord[], anchorKey: string): MealLogRecord[] {
  const a = parseKey(anchorKey);
  return logs.filter((l) => {
    const d = parseKey(l.mealDate);
    return d.getMonth() === a.getMonth() && d.getFullYear() === a.getFullYear();
  });
}
