import axios from 'axios';
import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { unwrapDataResponse } from './apiResponse';
import type { GoalCode } from '../types/refactorUi.types';

export interface UserGoalResponse {
  id: string;
  goalCode: GoalCode;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  targetWeightKg: number | null;
  startWeightKg: number | null;
  targetDurationMonths: number | null;
  note: string | null;
}

export interface UpdateGoalPayload {
  goalCode: GoalCode;
  targetWeightKg?: number | null;
  targetDurationMonths?: number;
  note?: string | null;
}

export const getCurrentGoal = async (): Promise<UserGoalResponse | null> => {
  try {
    const response = await apiClient.get<DataResponse<UserGoalResponse> | UserGoalResponse>(
      '/api/user-goals/current'
    );
    return unwrapDataResponse(response.data);
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 404 || error.response?.data?.code === 'GOAL-001')
    ) {
      return null;
    }
    throw error;
  }
};

export const updateCurrentGoal = async (
  payload: UpdateGoalPayload
): Promise<UserGoalResponse> => {
  const response = await apiClient.put<DataResponse<UserGoalResponse>>(
    '/api/user-goals/current',
    payload
  );
  return unwrapDataResponse(response.data);
};

export const getGoalHistory = async (): Promise<UserGoalResponse[]> => {
  const response = await apiClient.get<DataResponse<UserGoalResponse[]> | UserGoalResponse[]>(
    '/api/user-goals/history'
  );
  return unwrapDataResponse(response.data);
};
