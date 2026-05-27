import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { unwrapDataResponse } from './apiResponse';

export type MealType = 'SANG' | 'PHU_SANG' | 'TRUA' | 'PHU_CHIEU' | 'TOI';
export type PlanType = '3_BUA' | '5_BUA';

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
  status: string;
  dishes: unknown[];
}

export const getMealLogHistory = async (days = 7): Promise<MealLogHistoryItem[]> => {
  const response = await apiClient.get<
    DataResponse<MealLogHistoryItem[]> | MealLogHistoryItem[]
  >('/api/meal-log/history', {
    params: { days },
  });

  return unwrapDataResponse(response.data);
};
