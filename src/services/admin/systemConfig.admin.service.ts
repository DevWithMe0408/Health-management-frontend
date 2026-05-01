import { apiClient } from '../axios';

export interface FilterConfig {
  kcalTolerance: number;
  servingMin: number;
  servingMax: number;
  servingSteps: number[];
  comboServingSteps: number[];
}

export interface ConstraintItem {
  slotCode: string;
  minG: number;
  maxG: number;
}

export interface DisplayConfig {
  topK: number;
  roundStepG: number;
}

export interface SystemConfigResponse {
  filter: FilterConfig;
  constraints: ConstraintItem[];
  display: DisplayConfig;
  updatedAt: string;
  updatedBy: string;
}

export type SystemConfigUpdateRequest = Omit<SystemConfigResponse, 'updatedAt' | 'updatedBy'>;

interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export const getSystemConfig = async (): Promise<SystemConfigResponse> => {
  const res = await apiClient.get<DataResponse<SystemConfigResponse>>('/api/admin/configs/system');
  return res.data.data;
};

export const updateSystemConfig = async (
  data: SystemConfigUpdateRequest
): Promise<SystemConfigResponse> => {
  const res = await apiClient.put<DataResponse<SystemConfigResponse>>(
    '/api/admin/configs/system',
    data
  );
  return res.data.data;
};
