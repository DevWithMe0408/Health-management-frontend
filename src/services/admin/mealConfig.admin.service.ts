import { apiClient } from '../axios';

export interface MealRatio {
  mealCode: string;
  ratio: number;
  sortOrder: number;
}

export interface MealConfigResponse {
  plan3Meals: MealRatio[];
  plan5Meals: MealRatio[];
  updatedAt: string;
  updatedBy: string;
}

export interface MealConfigUpdateRequest {
  meals: { mealCode: string; ratio: number }[];
}

interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export const getMealConfigs = async (): Promise<MealConfigResponse> => {
  const res = await apiClient.get<DataResponse<MealConfigResponse>>('/api/admin/configs/meals');
  return res.data.data;
};

export const updateMealConfig = async (
  planType: '3_BUA' | '5_BUA',
  data: MealConfigUpdateRequest
): Promise<MealRatio[]> => {
  const res = await apiClient.put<DataResponse<MealRatio[]>>(
    `/api/admin/configs/meals/${planType}`,
    data
  );
  return res.data.data;
};
