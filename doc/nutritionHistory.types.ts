/**
 * Nhật ký bữa ăn — domain types.
 * Khớp với meal.types.ts hiện có; mở rộng riêng cho trang lịch sử.
 */

export type MealType = 'SANG' | 'PHU_SANG' | 'TRUA' | 'PHU_CHIEU' | 'TOI';

/** Trạng thái bữa ăn trong nhật ký. */
export type MealLogStatus =
  | 'SUGGESTED' // đã có kế hoạch, chưa báo cáo
  | 'FOLLOWED'  // ăn đúng đề xuất
  | 'CUSTOM'    // ăn khác (có ghi chú tự do)
  | 'SKIPPED';  // bỏ bữa

export interface DishLite {
  dishName: string;
  dishKcal: number;
}

/** Một bản ghi bữa ăn (mock dùng đúng shape này; cắm API trả về mảng các record). */
export interface MealLogRecord {
  id: string;
  mealDate: string; // 'YYYY-MM-DD'
  mealType: MealType;
  status: MealLogStatus;
  customNote: string | null;
  totalKcalActual: number;
  dishes: DishLite[];
}

export type RangeMode = 'day' | 'week' | 'month';

export interface ComplianceCounts {
  FOLLOWED: number;
  CUSTOM: number;
  SKIPPED: number;
  SUGGESTED: number;
}

export interface ComplianceResult {
  counts: ComplianceCounts;
  reported: number; // FOLLOWED + CUSTOM + SKIPPED
  percent: number;  // FOLLOWED / reported * 100
  total: number;
}
