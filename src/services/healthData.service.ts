import axios from 'axios';
import type { SubmitHealthApiRequest } from '../types/healthData.schemas';
import { unwrapDataResponse } from './apiResponse';
import type { DataResponse } from './apiResponse';

const API_HEALTH_DATA_URL = `${import.meta.env.VITE_API_GW_BASE_URL || 'http://localhost:8080'}/api/health-data`;

const extractErrorMessage = (error: unknown, fallback: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const msg = (error.response.data as any)?.message
        || (typeof error.response.data === 'string' ? error.response.data : null)
        || fallback;
      throw new Error(msg);
    }
    console.error('[healthData] Network/timeout error:', error.message);
    throw new Error('Lỗi kết nối tới server. Vui lòng kiểm tra backend đang chạy.');
  }
  console.error('[healthData] Unexpected error:', error);
  throw new Error(fallback);
};

interface SubmitResponse {
  message: string;
}

export interface LatestHealthDataApiResponse {
  baseMetrics: { [key: string]: number | null };
}

export const submitHealthData = async (data: SubmitHealthApiRequest, token: string): Promise<SubmitResponse> => {
  try {
    const response = await axios.post<SubmitResponse>(`${API_HEALTH_DATA_URL}/submit`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { message: (response.data as any)?.message || 'Dữ liệu đã được gửi thành công!' };
  } catch (error) {
    return extractErrorMessage(error, 'Gửi dữ liệu thất bại.');
  }
};

export const getLatestHealthData = async (token: string): Promise<LatestHealthDataApiResponse> => {
  try {
    const response = await axios.get<DataResponse<LatestHealthDataApiResponse> | LatestHealthDataApiResponse>(
      `${API_HEALTH_DATA_URL}/latest-metrics`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return unwrapDataResponse(response.data);
  } catch (error) {
    return extractErrorMessage(error, 'Lấy dữ liệu gần nhất thất bại.');
  }
};

export interface MetricDataResponse {
  value: number | null;
  unit: string | null;
  lastUpdatedAt: string | null;
}

export interface DashboardMetricsApiResponse {
  weight?: MetricDataResponse;
  height?: MetricDataResponse;
  bmi?: MetricDataResponse;
  bmr?: MetricDataResponse;
  tdee?: MetricDataResponse;
  pbf?: MetricDataResponse;
  whr?: MetricDataResponse;
}

export const getDashboardMetrics = async (token: string): Promise<DashboardMetricsApiResponse> => {
  try {
    const response = await axios.get<DataResponse<DashboardMetricsApiResponse> | DashboardMetricsApiResponse>(
      `${API_HEALTH_DATA_URL}/dashboard-metrics`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return unwrapDataResponse(response.data);
  } catch (error) {
    return extractErrorMessage(error, 'Lấy dữ liệu dashboard thất bại.');
  }
};

export interface HistoricalDataPoint {
  timestamp: string;
  value: number;
  unit?: string;
}

export interface HistoricalDataApiResponse extends Array<HistoricalDataPoint> {}

export const getHistoricalHealthData = async (
  token: string,
  indicatorType: string,
  from?: string,
  to?: string,
): Promise<HistoricalDataApiResponse> => {
  try {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get<DataResponse<HistoricalDataApiResponse> | HistoricalDataApiResponse>(
      `${API_HEALTH_DATA_URL}/query/history/${indicatorType}`,
      { headers: { Authorization: `Bearer ${token}` }, params },
    );
    return unwrapDataResponse(response.data);
  } catch (error) {
    return extractErrorMessage(error, `Lấy dữ liệu lịch sử cho ${indicatorType} thất bại.`);
  }
};
