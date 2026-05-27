import axios from 'axios';

export interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

const isDataResponse = <T>(payload: unknown): payload is DataResponse<T> => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    'message' in payload &&
    'code' in payload
  );
};

export const unwrapDataResponse = <T>(payload: T | DataResponse<T>): T => {
  return isDataResponse<T>(payload) ? payload.data : payload;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Yêu cầu thất bại. Vui lòng thử lại.'
): string => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as Partial<DataResponse<unknown>> | undefined;
    return body?.message || error.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};

export const getApiErrorCode = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) return null;

  const body = error.response?.data as Partial<DataResponse<unknown>> | undefined;
  return body?.code ?? null;
};
