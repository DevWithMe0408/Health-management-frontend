import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { unwrapDataResponse } from './apiResponse';
import type { PbfMethod, UserPreferenceKey } from '../types/refactorUi.types';

export interface PreferenceResponse {
  prefKey: string;
  prefValue: string;
  valueType: string;
  description: string | null;
}

export interface UpdatePreferencePayload {
  prefValue: string;
  valueType?: string;
}

export const getAllPreferences = async (): Promise<PreferenceResponse[]> => {
  const response = await apiClient.get<DataResponse<PreferenceResponse[]>>(
    '/api/user-preferences'
  );
  return unwrapDataResponse(response.data);
};

export const getPreference = async (
  prefKey: UserPreferenceKey
): Promise<PreferenceResponse> => {
  const response = await apiClient.get<DataResponse<PreferenceResponse>>(
    `/api/user-preferences/${prefKey}`
  );
  return unwrapDataResponse(response.data);
};

export const updatePreference = async (
  prefKey: UserPreferenceKey,
  payload: UpdatePreferencePayload
): Promise<PreferenceResponse> => {
  const response = await apiClient.put<DataResponse<PreferenceResponse>>(
    `/api/user-preferences/${prefKey}`,
    payload
  );
  return unwrapDataResponse(response.data);
};

export const updatePbfMethod = async (
  prefValue: PbfMethod
): Promise<PreferenceResponse> => {
  return updatePreference('pbf_method', {
    prefValue,
    valueType: 'STRING',
  });
};

export const deletePreference = async (prefKey: UserPreferenceKey): Promise<void> => {
  await apiClient.delete<DataResponse<null>>(`/api/user-preferences/${prefKey}`);
};
