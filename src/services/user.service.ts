import axios from 'axios';
import { apiClient } from './axios';
import { unwrapDataResponse } from './apiResponse';
import type { DataResponse as ApiDataResponse } from './apiResponse';
import type { Gender } from '../types/refactorUi.types';

const API_USER_SERVICE_URL = `${import.meta.env.VITE_API_GW_BASE_URL || 'http://localhost:8080'}/api/user`;

interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export interface UserAccountDetails {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  name?: string | null;
  phoneNumber?: string | null;
  birthDate?: string | null;
  gender?: string | null;
}

export interface UpdateUserAccountDetailsPayload {
  name?: string | null;
  phoneNumber?: string | null;
  birthDate?: string | null;
  gender?: string | null;
}

export interface UpdateProfilePayload {
  name: string;
  birthDate: string;
  gender: Gender;
  phone?: string | null;
}

export const getUserAccountDetails = async (token: string): Promise<UserAccountDetails> => {
  try {
    const response = await axios.get<DataResponse<UserAccountDetails>>(
      `${API_USER_SERVICE_URL}/account-details`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as DataResponse<null>;
      throw new Error(body?.message || 'Lấy thông tin tài khoản thất bại.');
    }
    throw new Error('Đã xảy ra lỗi không mong muốn khi lấy thông tin tài khoản.');
  }
};

export const updateUserAccountDetails = async (
  token: string,
  payload: UpdateUserAccountDetailsPayload,
): Promise<UserAccountDetails> => {
  try {
    const response = await axios.put<DataResponse<UserAccountDetails>>(
      `${API_USER_SERVICE_URL}/update-account-details`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as DataResponse<null>;
      throw new Error(body?.message || 'Cập nhật thông tin tài khoản thất bại.');
    }
    throw new Error('Đã xảy ra lỗi không mong muốn khi cập nhật thông tin tài khoản.');
  }
};

export const updateUserProfile = async (payload: UpdateProfilePayload): Promise<void> => {
  const response = await apiClient.put<ApiDataResponse<unknown>>('/api/user/profile', payload);
  unwrapDataResponse(response.data);
};
