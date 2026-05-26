import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { getApiErrorMessage } from './apiResponse';
import { getConstitution } from './constitution.service';
import type { ConstitutionResponse } from './constitution.service';
import { updateCurrentGoal } from './userGoals.service';
import type {
  Gender,
  GoalCode,
  OnboardingBaseMetricType,
} from '../types/refactorUi.types';

interface BaseMetricInput {
  type: OnboardingBaseMetricType;
  value: number;
}

export interface SubmitOnboardingPayload {
  fullName: string;
  birthDate: string;
  gender: Gender;
  phone?: string | null;
  goalCode: GoalCode;
  targetWeightKg?: number | null;
  targetDurationMonths?: number;
  heightCm: number;
  weightKg: number;
  activityFactor: number;
  waistCm?: number | null;
  hipCm?: number | null;
  neckCm?: number | null;
  bustCm?: number | null;
}

export interface OnboardingResult {
  constitution: ConstitutionResponse | null;
  userGoal: GoalCode;
  suggestedGoal: GoalCode | null;
  goalMismatch: boolean;
  constitutionError?: string;
}

const addOptionalMetric = (
  metrics: BaseMetricInput[],
  type: OnboardingBaseMetricType,
  value: number | null | undefined
) => {
  if (value != null) metrics.push({ type, value });
};

export const submitOnboarding = async (
  payload: SubmitOnboardingPayload
): Promise<OnboardingResult> => {
  await apiClient.put<DataResponse<unknown>>('/api/user/profile', {
    name: payload.fullName,
    birthDate: payload.birthDate,
    gender: payload.gender,
    phone: payload.phone?.trim() || null,
  });

  const baseMetrics: BaseMetricInput[] = [
    { type: 'HEIGHT', value: payload.heightCm },
    { type: 'WEIGHT', value: payload.weightKg },
    { type: 'ACTIVITY_FACTOR', value: payload.activityFactor },
  ];

  addOptionalMetric(baseMetrics, 'WAIST', payload.waistCm);
  addOptionalMetric(baseMetrics, 'HIP', payload.hipCm);
  addOptionalMetric(baseMetrics, 'NECK', payload.neckCm);
  addOptionalMetric(baseMetrics, 'BUST', payload.bustCm);

  await apiClient.post<DataResponse<null>>('/api/health-data/submit', {
    baseMetrics,
  });

  await updateCurrentGoal({
    goalCode: payload.goalCode,
    targetWeightKg: payload.targetWeightKg,
    targetDurationMonths: payload.targetDurationMonths ?? 6,
    note: 'Onboarding goal',
  });

  await apiClient.put<DataResponse<null>>('/api/user/profile-completed');

  try {
    const constitution = await getConstitution();
    const suggestedGoal = constitution.suggestedGoal;

    return {
      constitution,
      userGoal: payload.goalCode,
      suggestedGoal,
      goalMismatch: suggestedGoal !== null && suggestedGoal !== payload.goalCode,
    };
  } catch (error) {
    return {
      constitution: null,
      userGoal: payload.goalCode,
      suggestedGoal: null,
      goalMismatch: false,
      constitutionError: getApiErrorMessage(
        error,
        'Không thể tải phân loại thể trạng sau khi hoàn tất onboarding.'
      ),
    };
  }
};
