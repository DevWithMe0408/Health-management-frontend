import { apiClient } from '../axios';
import type { DataResponse } from '../apiResponse';

export interface CatalogStats {
  dishTotal: number;
  dishActive: number;
  ingredientTotal: number;
  ingredientWithMacro: number;
  mealLogTotal: number;
  dishCountBySlot: Record<string, number>;
}

export interface UserStats {
  totalUsers: number;
  usersWithProfile: number;
}

export interface DashboardData {
  catalog: CatalogStats;
  users: UserStats;
}

const getCatalogStats = async (): Promise<CatalogStats> => {
  const res = await apiClient.get<DataResponse<CatalogStats>>(
    '/api/admin/dashboard/catalog-stats'
  );
  return res.data.data;
};

const getUserStats = async (): Promise<UserStats> => {
  const res = await apiClient.get<DataResponse<UserStats>>('/api/admin/users/stats');
  return res.data.data;
};

// Goi song song 2 endpoint, khong dung aggregator phia BE.
export const getDashboardData = async (): Promise<DashboardData> => {
  const [catalog, users] = await Promise.all([getCatalogStats(), getUserStats()]);
  return { catalog, users };
};
