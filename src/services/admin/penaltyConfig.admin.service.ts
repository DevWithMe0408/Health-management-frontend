import { apiClient } from '../axios';

export interface PenaltyLayer {
  sameDay: number;
  oneDayBefore: number;
  twoDayBefore: number;
}

export interface SlotFactors {
  main: number;
  veg: number;
  carb: number;
  combo: number;
}

export interface PenaltyOthers {
  penaltyCap: number;
  favoriteDiscount: number;
  lookbackDays: number;
}

export interface PenaltyConfigResponse {
  layer1: PenaltyLayer;
  layer2: PenaltyLayer;
  slotFactors: SlotFactors;
  others: PenaltyOthers;
  updatedAt: string;
  updatedBy: string;
}

export type PenaltyConfigUpdateRequest = Omit<PenaltyConfigResponse, 'updatedAt' | 'updatedBy'>;

interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export const getPenaltyConfig = async (): Promise<PenaltyConfigResponse> => {
  const res = await apiClient.get<DataResponse<PenaltyConfigResponse>>('/api/admin/configs/penalties');
  return res.data.data;
};

export const updatePenaltyConfig = async (
  data: PenaltyConfigUpdateRequest
): Promise<PenaltyConfigResponse> => {
  const res = await apiClient.put<DataResponse<PenaltyConfigResponse>>(
    '/api/admin/configs/penalties',
    data
  );
  return res.data.data;
};
