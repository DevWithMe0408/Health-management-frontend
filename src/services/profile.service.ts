import { getApiErrorMessage } from './apiResponse';
import { getConstitution } from './constitution.service';
import type { ConstitutionResponse } from './constitution.service';
import { getDashboardMetrics } from './dashboard.service';
import type { DashboardMetricsResponse } from './dashboard.service';
import { getCurrentGoal, getGoalHistory } from './userGoals.service';
import type { UserGoalResponse } from './userGoals.service';
import { getAllPreferences } from './userPreferences.service';
import type { PreferenceResponse } from './userPreferences.service';

export interface ProfileOverview {
  currentGoal: UserGoalResponse | null;
  goalHistory: UserGoalResponse[];
  preferences: PreferenceResponse[];
  metrics: DashboardMetricsResponse | null;
  constitution: ConstitutionResponse | null;
  errors: Partial<Record<
    'currentGoal' | 'goalHistory' | 'preferences' | 'metrics' | 'constitution',
    string
  >>;
}

export const getProfileOverview = async (): Promise<ProfileOverview> => {
  const [
    currentGoalResult,
    goalHistoryResult,
    preferencesResult,
    metricsResult,
    constitutionResult,
  ] = await Promise.allSettled([
    getCurrentGoal(),
    getGoalHistory(),
    getAllPreferences(),
    getDashboardMetrics(),
    getConstitution(),
  ]);

  return {
    currentGoal: currentGoalResult.status === 'fulfilled' ? currentGoalResult.value : null,
    goalHistory: goalHistoryResult.status === 'fulfilled' ? goalHistoryResult.value : [],
    preferences: preferencesResult.status === 'fulfilled' ? preferencesResult.value : [],
    metrics: metricsResult.status === 'fulfilled' ? metricsResult.value : null,
    constitution: constitutionResult.status === 'fulfilled' ? constitutionResult.value : null,
    errors: {
      ...(currentGoalResult.status === 'rejected' && {
        currentGoal: getApiErrorMessage(currentGoalResult.reason, 'Không tải được mục tiêu hiện tại'),
      }),
      ...(goalHistoryResult.status === 'rejected' && {
        goalHistory: getApiErrorMessage(goalHistoryResult.reason, 'Không tải được lịch sử mục tiêu'),
      }),
      ...(preferencesResult.status === 'rejected' && {
        preferences: getApiErrorMessage(preferencesResult.reason, 'Không tải được cài đặt'),
      }),
      ...(metricsResult.status === 'rejected' && {
        metrics: getApiErrorMessage(metricsResult.reason, 'Không tải được chỉ số'),
      }),
      ...(constitutionResult.status === 'rejected' && {
        constitution: getApiErrorMessage(constitutionResult.reason, 'Không tải được thể trạng'),
      }),
    },
  };
};
