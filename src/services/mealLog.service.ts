import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { unwrapDataResponse } from './apiResponse';

export type MealType = 'SANG' | 'PHU_SANG' | 'TRUA' | 'PHU_CHIEU' | 'TOI';
export type PlanType = '3_BUA' | '5_BUA';
export type MealLogStatus = 'SUGGESTED' | 'FOLLOWED' | 'MODIFIED' | 'CUSTOM' | 'SKIPPED';

export interface MealLogHistoryDish {
  dishId: string;
  dishName: string | null;
  dishKcal: number;
  servingMultiplier?: number;
  actualGrams?: number;
  slotCode?: string;
  foodGroupCode?: string;
  favorite?: boolean;
}

export interface MealLogHistoryItem {
  id: string;
  mealDate: string;
  mealType: MealType;
  planType: PlanType | string;
  goalCode: string;
  mealKcalTarget: number;
  totalKcalActual: number;
  totalProtein: number;
  totalFat: number;
  totalCarb: number;
  finalScore: number;
  status: MealLogStatus | string;
  customNote: string | null;
  dishes: MealLogHistoryDish[];
}

export const getMealLogHistory = async (days = 7): Promise<MealLogHistoryItem[]> => {
  const response = await apiClient.get<
    DataResponse<MealLogHistoryItem[]> | MealLogHistoryItem[]
  >('/api/meal-log/history', {
    params: { days },
  });

  return unwrapDataResponse(response.data);
};

/** Lich su bua an trong khoang [from, to] (YYYY-MM-DD). */
export const getMealLogHistoryRange = async (
  from: string,
  to: string
): Promise<MealLogHistoryItem[]> => {
  const response = await apiClient.get<
    DataResponse<MealLogHistoryItem[]> | MealLogHistoryItem[]
  >('/api/meal-log/history-range', {
    params: { from, to },
  });

  return unwrapDataResponse(response.data);
};

/** Cap nhat trang thai mot bua da ton tai theo meal log id. */
export const updateMealStatus = async (
  id: string,
  status: 'SUGGESTED' | 'FOLLOWED' | 'CUSTOM' | 'SKIPPED',
  customNote?: string | null
): Promise<MealLogHistoryItem> => {
  const response = await apiClient.patch<
    DataResponse<MealLogHistoryItem> | MealLogHistoryItem
  >(`/api/meal-log/${id}/status`, {
    status,
    customNote: customNote ?? null,
  });

  return unwrapDataResponse(response.data);
};
