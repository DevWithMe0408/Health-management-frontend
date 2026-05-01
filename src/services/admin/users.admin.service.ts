import { apiClient } from '../axios';

export interface AdminUserSummary {
  userId: string;
  username: string;
  email: string;
  name: string;
  role: string;
  hasProfile: boolean;
  createdAt: string;
}

export interface AdminUserAccount {
  userId: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AdminUserProfile {
  name: string;
  birthDate: string | null;
  age: number | null;
  gender: string | null;
  phone: string | null;
}

export interface AdminUserHealthMetrics {
  weight: number | null;
  height: number | null;
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
  pbf: number | null;
  whr: number | null;
  lastUpdatedAt: string | null;
}

export interface AdminUserDetail {
  account: AdminUserAccount;
  profile: AdminUserProfile | null;
  latestHealthMetrics: AdminUserHealthMetrics | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export interface ListUsersParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  role?: string;
}

export const listUsers = async (
  params: ListUsersParams = {}
): Promise<PageResponse<AdminUserSummary>> => {
  const res = await apiClient.get<DataResponse<PageResponse<AdminUserSummary>>>(
    '/api/admin/users',
    { params: { page: 0, size: 10, ...params } }
  );
  return res.data.data;
};

export const getUserDetail = async (userId: string): Promise<AdminUserDetail> => {
  const res = await apiClient.get<DataResponse<AdminUserDetail>>(
    `/api/admin/users/${userId}`
  );
  return res.data.data;
};
