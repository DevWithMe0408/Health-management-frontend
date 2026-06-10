import type { MealLogStatus, MealType } from './nutritionHistory.types';

/**
 * Cấu hình hiển thị theo trạng thái — màu, nhãn, class chip.
 * Màu: đúng = brand green, ăn khác = amber, bỏ bữa = xám, chưa báo cáo = viền đứt.
 */
export interface StatusMeta {
  key: MealLogStatus;
  label: string;
  short: string;
  color: string; // dùng cho inline style (ring, dot, ô tô màu)
  chipClass: string;
}

export const STATUS_META: Record<MealLogStatus, StatusMeta> = {
  FOLLOWED: {
    key: 'FOLLOWED',
    label: 'Đã ăn đúng',
    short: 'Đúng',
    color: '#059669',
    chipClass: 'bg-brand-green-light text-brand-green-darker',
  },
  CUSTOM: {
    key: 'CUSTOM',
    label: 'Ăn khác',
    short: 'Ăn khác',
    color: '#f59e0b',
    chipClass: 'bg-amber-100 text-amber-700',
  },
  SKIPPED: {
    key: 'SKIPPED',
    label: 'Bỏ bữa',
    short: 'Bỏ bữa',
    color: '#9ca3af',
    chipClass: 'bg-gray-100 text-gray-600',
  },
  SUGGESTED: {
    key: 'SUGGESTED',
    label: 'Chưa báo cáo',
    short: 'Chưa báo cáo',
    color: '#cbd5e1',
    chipClass: 'bg-white text-gray-400 border border-dashed border-gray-300',
  },
};

export const MEAL_LABEL: Record<MealType, string> = {
  SANG: 'Sáng',
  PHU_SANG: 'Phụ sáng',
  TRUA: 'Trưa',
  PHU_CHIEU: 'Phụ chiều',
  TOI: 'Tối',
};

export const MEAL_ORDER: MealType[] = ['SANG', 'PHU_SANG', 'TRUA', 'PHU_CHIEU', 'TOI'];
export const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
export const STATUS_FILTER_ORDER: MealLogStatus[] = ['FOLLOWED', 'CUSTOM', 'SKIPPED', 'SUGGESTED'];
