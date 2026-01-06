import axios from 'axios';
import type { SubmitHealthApiRequest } from '../types/healthData.schemas';

// URL của API Gateway trỏ đến Health-Data-Service
const API_HEALTH_DATA_URL = `${import.meta.env.VITE_API_GW_BASE_URL || 'http://localhost:8080'}/api/health-data`;

interface SubmitResponse {
  message: string; // Hoặc kiểu dữ liệu response cụ thể từ backend
}
// Kiểu dữ liệu cho response từ API lấy dữ liệu gần nhất
export interface LatestHealthDataApiResponse {
  baseMetrics: { [key: string]: number | null }; // Key là tên của IndicatorType (string)
  // baseMetricsRecordedAt?: { [key: string]: string | null };
}
export const submitHealthData = async (data: SubmitHealthApiRequest, token: string): Promise<SubmitResponse> => {
  try {
    const response = await axios.post<SubmitResponse>(`${API_HEALTH_DATA_URL}/submit`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { message: response.data as any || "Dữ liệu đã được gửi thành công!" }; // Ép kiểu nếu response.data là string
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = (error.response.data as any)?.message || (error.response.data as string) || 'Gửi dữ liệu thất bại.';
      throw new Error(errorMessage);
    }
    throw new Error('Đã xảy ra lỗi không mong muốn khi gửi dữ liệu.');
  }
};
// Thêm các hàm khác để lấy dữ liệu thống kê sau này
// export const getHealthStatistics = async (userId: number, token: string) => { ... }

export const getLatestHealthData = async (token: string): Promise<LatestHealthDataApiResponse> => {
  try {
    const response = await axios.get<LatestHealthDataApiResponse>(`${API_HEALTH_DATA_URL}/latest-metrics`, {
      headers: {
        Authorization: `Bearer ${token}`,
        // userId sẽ được API Gateway thêm vào từ token, không cần gửi từ client
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = (error.response.data as any)?.message || (error.response.data as string) || 'Lấy dữ liệu gần nhất thất bại.';
      throw new Error(errorMessage);
    }
    throw new Error('Đã xảy ra lỗi không mong muốn khi lấy dữ liệu gần nhất.');
  }
};

export interface MetricDataResponse { // Khớp với MetricData DTO của backend
  value: number | null;
  unit: string | null;
  lastUpdatedAt: string | null; // ISO Date string
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
    const response = await axios.get<DashboardMetricsApiResponse>(`${API_HEALTH_DATA_URL}/dashboard-metrics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // ... (xử lý lỗi tương tự như các hàm khác) ...
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = (error.response.data as any)?.message || (error.response.data as string) || 'Lấy dữ liệu dashboard thất bại.';
      throw new Error(errorMessage);
    }
    throw new Error('Đã xảy ra lỗi không mong muốn khi lấy dữ liệu dashboard.');
  }
};

export interface HistoricalDataPoint {
  timestamp: string; // ISO Date string
  value: number;
  unit?: string; // Tùy chọn, có thể không cần nếu chỉ số có đơn vị cố định
}

export interface HistoricalDataApiResponse extends Array<HistoricalDataPoint> {}

export const getHistoricalHealthData = async (
  token: string,
  indicatorType: string, // Tên của IndicatorType, ví dụ "WEIGHT", "BMI"
  from?: string, // ISO Date string (optional)
  to?: string     // ISO Date string (optional)
): Promise<HistoricalDataApiResponse> => {
  try {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    // userId sẽ được API Gateway thêm vào từ token

    const response = await axios.get<HistoricalDataApiResponse>(
      `${API_HEALTH_DATA_URL}/query/history/${indicatorType}`, // Sử dụng path như đã thiết kế
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params, // Thêm params vào query string
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = (error.response.data as any)?.message || (error.response.data as string) || `Lấy dữ liệu lịch sử cho ${indicatorType} thất bại.`;
      throw new Error(errorMessage);
    }
    throw new Error(`Đã xảy ra lỗi không mong muốn khi lấy dữ liệu lịch sử cho ${indicatorType}.`);
  }
};