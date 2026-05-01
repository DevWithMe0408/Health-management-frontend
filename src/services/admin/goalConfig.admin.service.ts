import { apiClient } from '../axios';

export interface GoalConfig {
  goalCode: 'GIAM' | 'DUY_TRI' | 'TANG';
  calMultiplier: number;
  proteinRatio: number;
  fatRatio: number;
  carbRatio: number;
  slotMainRatio: number;
  slotVegRatio: number;
  slotCarbRatio: number;
  weightP: number;
  weightF: number;
  weightC: number;
  weightKcal: number;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

export type GoalConfigUpdateRequest = Omit<GoalConfig, 'goalCode' | 'description' | 'updatedAt' | 'updatedBy'>;

interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export const getAllGoalConfigs = async (): Promise<GoalConfig[]> => {
  const res = await apiClient.get<DataResponse<GoalConfig[]>>('/api/admin/configs/goals');
  return res.data.data;
};

export const getGoalConfig = async (goalCode: string): Promise<GoalConfig> => {
  const res = await apiClient.get<DataResponse<GoalConfig>>(`/api/admin/configs/goals/${goalCode}`);
  return res.data.data;
};

export const updateGoalConfig = async (
  goalCode: string,
  data: GoalConfigUpdateRequest
): Promise<GoalConfig> => {
  const res = await apiClient.put<DataResponse<GoalConfig>>(
    `/api/admin/configs/goals/${goalCode}`,
    data
  );
  return res.data.data;
};
