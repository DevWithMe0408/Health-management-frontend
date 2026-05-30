import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { unwrapDataResponse } from './apiResponse';
import type { DishOptionResponse, SlotCode } from '../types/meal.types';

export interface SearchDishesParams {
  slotCode: SlotCode;
  q: string;
  slotKcalTarget: number;
}

/**
 * Search active dishes by name within the same slotCode.
 * BE caps results at 20 items. expectedScore is always null because BE does not score search results.
 * expectedServing is snapped to the system serving steps.
 */
export const searchDishes = async (
  params: SearchDishesParams
): Promise<DishOptionResponse[]> => {
  const response = await apiClient.get<
    DataResponse<DishOptionResponse[]> | DishOptionResponse[]
  >('/api/nutrition/dishes/search', {
    params: {
      slotCode: params.slotCode,
      q: params.q.trim(),
      slotKcalTarget: params.slotKcalTarget,
    },
  });

  return unwrapDataResponse(response.data);
};
