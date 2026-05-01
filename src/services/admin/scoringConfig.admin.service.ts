import { apiClient } from '../axios';

export interface SurplusFactors {
  protein: number;
  fat: number;
  carb: number;
  kcal: number;
}

export interface ReoptimizeConfig {
  scoreThreshold: number;
  scoreDrop: number;
}

export interface ScoringConfigResponse {
  threshold: number;
  surplusFactors: SurplusFactors;
  reoptimize: ReoptimizeConfig;
  updatedAt: string;
  updatedBy: string;
}

export type ScoringConfigUpdateRequest = Omit<ScoringConfigResponse, 'updatedAt' | 'updatedBy'>;

interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export const getScoringConfig = async (): Promise<ScoringConfigResponse> => {
  const res = await apiClient.get<DataResponse<ScoringConfigResponse>>('/api/admin/configs/scoring');
  return res.data.data;
};

export const updateScoringConfig = async (
  data: ScoringConfigUpdateRequest
): Promise<ScoringConfigResponse> => {
  const res = await apiClient.put<DataResponse<ScoringConfigResponse>>(
    '/api/admin/configs/scoring',
    data
  );
  return res.data.data;
};
