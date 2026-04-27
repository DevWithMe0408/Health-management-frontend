import axios from 'axios';
import type { RegisterFormData, LoginFormData } from '../types/auth.schemas';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/auth';
const API_GATEWAY_URL = import.meta.env.VITE_API_GW_BASE_URL || 'http://localhost:8080';

interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export class ApiError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileData {
  userId: string | null;
  username: string;
  roles: string[];
}

export const registerUser = async (data: RegisterFormData): Promise<void> => {
  const { confirmPassword: _c, ...payload } = data;
  try {
    await axios.post<DataResponse<null>>(`${API_URL}/register`, payload);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const body = error.response.data as DataResponse<null>;
      throw new ApiError(body.code ?? 'UNKNOWN', body.message || 'Đăng ký thất bại.');
    }
    throw new Error('Lỗi kết nối hoặc server không phản hồi.');
  }
};

export const loginUser = async (data: LoginFormData): Promise<LoginResponse> => {
  try {
    const response = await axios.post<DataResponse<LoginResponse>>(`${API_URL}/login`, data);
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const body = error.response.data as DataResponse<null>;
      throw new ApiError(body.code ?? 'UNKNOWN', body.message || 'Đăng nhập thất bại.');
    }
    throw new Error('Lỗi kết nối hoặc server không phản hồi.');
  }
};

export const getCurrentUserProfile = async (token: string): Promise<UserProfileData> => {
  try {
    const response = await axios.get<DataResponse<UserProfileData>>(
      `${API_GATEWAY_URL}/api/user/currentUser`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      throw new Error('INVALID_TOKEN');
    }
    throw new Error('Failed to fetch user profile.');
  }
};
