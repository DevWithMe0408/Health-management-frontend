import type { SubmitHealthApiRequest } from '../types/healthData.schemas';
import type { DashboardMetricsResponse, MetricDataResponse } from './dashboard.service';
import { apiClient } from './axios';
import { getApiErrorMessage, unwrapDataResponse } from './apiResponse';
import type { DataResponse } from './apiResponse';

const throwApiError = (error: unknown, fallback: string): never => {
  throw new Error(getApiErrorMessage(error, fallback));
};

interface SubmitResponse {
  message: string;
}

const DEFAULT_SUBMIT_MESSAGE = 'Cập nhật thành công';

const normalizeSubmitMessage = (message?: string | null) => {
  if (!message || message === 'Success') return DEFAULT_SUBMIT_MESSAGE;
  return message;
};

const getSubmitMessage = (
  payload: DataResponse<SubmitResponse | null> | SubmitResponse
): string => {
  if ('data' in payload && 'code' in payload) {
    return normalizeSubmitMessage(payload.message || payload.data?.message);
  }

  return normalizeSubmitMessage(payload.message);
};

export interface LatestHealthDataApiResponse {
  baseMetrics: { [key: string]: number | null };
}

export type { MetricDataResponse };
export type DashboardMetricsApiResponse = DashboardMetricsResponse;

export type HistoricalDataPoint = {
  timestamp: string;
  value: number;
  unit?: string;
};

export type HistoricalDataApiResponse = HistoricalDataPoint[];

export const submitHealthData = async (
  data: SubmitHealthApiRequest,
  _token?: string
): Promise<SubmitResponse> => {
  void _token;
  try {
    const response = await apiClient.post<DataResponse<SubmitResponse | null> | SubmitResponse>(
      '/api/health-data/submit',
      data
    );
    return { message: getSubmitMessage(response.data) };
  } catch (error) {
    return throwApiError(error, 'Gửi dữ liệu thất bại.');
  }
};

export const getLatestHealthData = async (
  _token?: string
): Promise<LatestHealthDataApiResponse> => {
  void _token;
  try {
    const response = await apiClient.get<
      DataResponse<LatestHealthDataApiResponse> | LatestHealthDataApiResponse
    >('/api/health-data/latest-metrics');
    return unwrapDataResponse(response.data);
  } catch (error) {
    return throwApiError(error, 'Lấy dữ liệu gần nhất thất bại.');
  }
};

export const getDashboardMetrics = async (
  _token?: string
): Promise<DashboardMetricsApiResponse> => {
  void _token;
  try {
    const response = await apiClient.get<
      DataResponse<DashboardMetricsApiResponse> | DashboardMetricsApiResponse
    >('/api/health-data/dashboard-metrics');
    return unwrapDataResponse(response.data);
  } catch (error) {
    return throwApiError(error, 'Lấy dữ liệu dashboard thất bại.');
  }
};

export const getHistoricalHealthData = async (
  _token: string | undefined,
  indicatorType: string,
  from?: string,
  to?: string
): Promise<HistoricalDataApiResponse> => {
  void _token;
  try {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await apiClient.get<
      DataResponse<HistoricalDataApiResponse> | HistoricalDataApiResponse
    >(`/api/health-data/query/history/${indicatorType}`, { params });
    return unwrapDataResponse(response.data);
  } catch (error) {
    return throwApiError(error, `Lấy dữ liệu lịch sử cho ${indicatorType} thất bại.`);
  }
};
