import axios from 'axios';
import { apiClient } from './axios';
import type { DataResponse } from './apiResponse';
import { unwrapDataResponse } from './apiResponse';
import type {
  ConstitutionCode,
  GoalCode,
  PbfMethod,
} from '../types/refactorUi.types';

export interface ConstitutionResponse {
  constitution: ConstitutionCode;
  method: string;
  bmi: number | null;
  pbf: number | null;
  pbfSource: PbfMethod;
  bmiClass: number | null;
  pbfClass: number | null;
  finalClass: number;
  suggestedGoal: GoalCode | null;
  warning: string | null;
  computedAt: string;
}

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const shouldRetryConstitution = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;

  const code = error.response?.data?.code;
  return (
    error.response?.status === 422 ||
    code === 'HEALTH-001' ||
    code === 'HEALTH-002' ||
    code === 'HEALTH_MISSING_BASIC_DATA' ||
    code === 'HEALTH_MISSING_GENDER'
  );
};

export const getConstitution = async (
  maxAttempts = 3,
  initialDelayMs = 1500
): Promise<ConstitutionResponse> => {
  let lastError: unknown;
  let waitMs = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await apiClient.get<DataResponse<ConstitutionResponse>>(
        '/api/health-data/constitution'
      );
      return unwrapDataResponse(response.data);
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !shouldRetryConstitution(error)) break;
      await delay(waitMs);
      waitMs *= 2;
    }
  }

  throw lastError;
};
