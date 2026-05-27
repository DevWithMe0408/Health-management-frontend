import { apiClient } from './axios';
import { unwrapDataResponse } from './apiResponse';
import type { DataResponse } from './apiResponse';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  const response = await apiClient.put<DataResponse<void>>(
    '/api/auth/change-password',
    payload,
  );
  unwrapDataResponse(response.data);
};
