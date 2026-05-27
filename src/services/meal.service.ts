import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { unwrapDataResponse } from './apiResponse';
import type {
  ConfirmMealRequest,
  DailyPlanResponse,
  FavoriteDishResponse,
  MealLogHistoryResponse,
  RecommendFullDayRequest,
  SwapDishRequest,
  SwapResultResponse,
} from '../types/meal.types';

export const recommendFullDay = async (
  payload: RecommendFullDayRequest
): Promise<DailyPlanResponse> => {
  const response = await apiClient.post<DataResponse<DailyPlanResponse> | DailyPlanResponse>(
    '/api/recommendation/full-day',
    payload
  );

  return unwrapDataResponse(response.data);
};

export const swapDish = async (
  payload: SwapDishRequest
): Promise<SwapResultResponse> => {
  const response = await apiClient.post<DataResponse<SwapResultResponse> | SwapResultResponse>(
    '/api/recommendation/swap-dish',
    payload
  );

  return unwrapDataResponse(response.data);
};

export const confirmMeal = async (
  payload: ConfirmMealRequest
): Promise<MealLogHistoryResponse> => {
  const response = await apiClient.post<
    DataResponse<MealLogHistoryResponse> | MealLogHistoryResponse
  >('/api/meal-log/confirm', payload);

  return unwrapDataResponse(response.data);
};

export const getNutritionMealLogHistory = async (
  days = 7
): Promise<MealLogHistoryResponse[]> => {
  const response = await apiClient.get<
    DataResponse<MealLogHistoryResponse[]> | MealLogHistoryResponse[]
  >('/api/meal-log/history', {
    params: { days },
  });

  return unwrapDataResponse(response.data);
};

export const getFavoriteDishes = async (): Promise<FavoriteDishResponse[]> => {
  const response = await apiClient.get<
    DataResponse<FavoriteDishResponse[]> | FavoriteDishResponse[]
  >('/api/favorite-dishes');

  return unwrapDataResponse(response.data);
};

export const addFavoriteDish = async (
  dishId: string
): Promise<FavoriteDishResponse> => {
  const response = await apiClient.post<
    DataResponse<FavoriteDishResponse> | FavoriteDishResponse
  >(`/api/favorite-dishes/${dishId}`);

  return unwrapDataResponse(response.data);
};

export const removeFavoriteDish = async (dishId: string): Promise<void> => {
  await apiClient.delete<DataResponse<null>>(`/api/favorite-dishes/${dishId}`);
};

