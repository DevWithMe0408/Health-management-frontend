import axios from 'axios';

export interface DataResponse<T> {
  code: string | null;
  message: string;
  data: T;
}

export interface GatewayDataResponse<T> {
  success: boolean;
  data: T;
  errorCode: string | null;
  message: string | null;
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

const isGatewayDataResponse = <T>(payload: unknown): payload is GatewayDataResponse<T> => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'data' in payload &&
    'success' in payload &&
    'errorCode' in payload
  );
};

export const unwrapDataResponse = <T>(payload: T | DataResponse<T> | GatewayDataResponse<T>): T => {
  return isDataResponse<T>(payload) || isGatewayDataResponse<T>(payload) ? payload.data : payload;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Yêu cầu thất bại. Vui lòng thử lại.'
): string => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as
      | Partial<DataResponse<unknown> & GatewayDataResponse<unknown>>
      | undefined;
    return body?.message || error.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};

export const getApiErrorCode = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) return null;

  const body = error.response?.data as
    | Partial<DataResponse<unknown> & GatewayDataResponse<unknown>>
    | undefined;
  return body?.code ?? body?.errorCode ?? null;
};
