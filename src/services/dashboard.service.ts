import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { getApiErrorMessage, unwrapDataResponse } from './apiResponse';
import { getConstitution } from './constitution.service';
import type { ConstitutionResponse } from './constitution.service';
import { getCurrentGoal } from './userGoals.service';
import type { UserGoalResponse } from './userGoals.service';
import { getAllPreferences } from './userPreferences.service';
import type { PreferenceResponse } from './userPreferences.service';
import { getMealLogHistory } from './mealLog.service';
import type { MealLogHistoryItem } from './mealLog.service';

export interface MetricDataResponse {
  value: number | null;
  unit: string | null;
  lastUpdatedAt: string | null;
  recordedAt?: string | null;
}

export interface DashboardMetricsResponse {
  weight?: MetricDataResponse;
  height?: MetricDataResponse;
  bmi?: MetricDataResponse;
  bmr?: MetricDataResponse;
  tdee?: MetricDataResponse;
  pbf?: MetricDataResponse;
  whr?: MetricDataResponse;
}

export interface HealthHistoryPoint {
  date?: string;
  timestamp?: string;
  value: number;
  unit?: string;
}

export interface DashboardOverview {
  constitution: ConstitutionResponse | null;
  metrics: DashboardMetricsResponse | null;
  weightHistory: HealthHistoryPoint[];
  mealLogHistory: MealLogHistoryItem[];
  currentGoal: UserGoalResponse | null;
  preferences: PreferenceResponse[];
  errors: Partial<
    Record<
      'constitution' | 'metrics' | 'weightHistory' | 'mealLogHistory' | 'currentGoal' | 'preferences',
      string
    >
  >;
}

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDateRange = (days: number) => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);

  return {
    from: formatLocalDate(from),
    to: formatLocalDate(to),
  };
};

export const getDashboardMetrics = async (): Promise<DashboardMetricsResponse> => {
  const response = await apiClient.get<
    DataResponse<DashboardMetricsResponse> | DashboardMetricsResponse
  >('/api/health-data/dashboard-metrics');
  return unwrapDataResponse(response.data);
};

export const getWeightHistory = async (days = 30): Promise<HealthHistoryPoint[]> => {
  const { from, to } = toDateRange(days);
  const response = await apiClient.get<
    DataResponse<HealthHistoryPoint[]> | HealthHistoryPoint[]
  >('/api/health-data/query/history/WEIGHT', {
    params: {
      from,
      to,
      granularity: 'DAILY',
    },
  });
  return unwrapDataResponse(response.data);
};

const collect = async <T,>(
  promise: Promise<T>,
  fallback?: string
): Promise<{ data: T | null; error: string | null }> => {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    return { data: null, error: getApiErrorMessage(error, fallback) };
  }
};

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const [constitution, metrics, weightHistory, mealLogHistory, currentGoal, preferences] = await Promise.all([
    collect(getConstitution(1)),
    collect(getDashboardMetrics()),
    collect(getWeightHistory(30)),
    collect(getMealLogHistory(7), 'Không tải được lịch sử thực đơn.'),
    collect(getCurrentGoal()),
    collect(getAllPreferences()),
  ]);

  return {
    constitution: constitution.data,
    metrics: metrics.data,
    weightHistory: weightHistory.data ?? [],
    mealLogHistory: mealLogHistory.data ?? [],
    currentGoal: currentGoal.data,
    preferences: preferences.data ?? [],
    errors: {
      constitution: constitution.error ?? undefined,
      metrics: metrics.error ?? undefined,
      weightHistory: weightHistory.error ?? undefined,
      mealLogHistory: mealLogHistory.error ?? undefined,
      currentGoal: currentGoal.error ?? undefined,
      preferences: preferences.error ?? undefined,
    },
  };
};
