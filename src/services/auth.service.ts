import axios, { AxiosError } from 'axios'; // Quan trọng: Import AxiosError
import type { RegisterFormData } from '../types/auth.schemas';
import type { LoginFormData } from '../types/auth.schemas';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/auth';


// URL của API Gateway
const API_GATEWAY_URL = import.meta.env.VITE_API_GW_BASE_URL || 'http://localhost:8080';

interface RegisterResponse {
  message: string;
  // Thêm các trường khác nếu API trả về
}

// Interface cho cấu trúc lỗi từ backend của bạn (nếu có một cấu trúc cụ thể)
interface ApiErrorResponse {
  message: string;
  // Các trường lỗi khác như errors, statusCode, etc.
}

// Định nghĩa kiểu dữ liệu cho response từ API login
// Dựa trên TokenRefreshResponse của backend bạn
export interface LoginResponse {
  accessToken: string;  // Hoặc tên là jwt, token, v.v. tùy backend
  refreshToken: string;
  tokenType: string; // Thường là "Bearer"
  // Thêm các thông tin khác nếu API trả về (ví dụ: thông tin user cơ bản)
  // username?: string;
  // roles?: string[];
}
export interface UserProfileData {
  userId: number | null; // Thêm userId
  username: string;
  roles: string[];
}
export const registerUser = async (data: RegisterFormData): Promise<RegisterResponse> => {
  const { confirmPassword, ...payload } = data;
  try {
    const response = await axios.post<RegisterResponse>(`${API_URL}/register`, payload);
    return response.data;
  } catch (error: unknown) { // error là unknown
    // Kiểm tra xem error có phải là một instance của AxiosError không
    if (axios.isAxiosError<ApiErrorResponse>(error)) { // Sử dụng type guard isAxiosError
      // Bây giờ TypeScript biết error là một AxiosError
      // error.response sẽ có kiểu AxiosResponse<ApiErrorResponse> hoặc undefined
      if (error.response && error.response.data) {
        // Truy cập an toàn error.response.data
        // Giả sử backend trả về lỗi có dạng { message: "Some error" }
        // Hoặc một object lỗi phức tạp hơn mà bạn đã định nghĩa trong ApiErrorResponse
        const errorMessage = error.response.data.message ||
                             (typeof error.response.data === 'string' ? error.response.data : 'Đăng ký thất bại do lỗi từ server.');
        throw new Error(errorMessage);
      } else {
        // Lỗi mạng hoặc lỗi không có response body
        throw new Error('Lỗi kết nối hoặc server không phản hồi.');
      }
    } else {
      // Nếu không phải AxiosError, có thể là lỗi khác (ví dụ: lỗi JavaScript thuần)
      console.error("An unexpected error occurred:", error); // Log lỗi đầy đủ để debug
      if (error instanceof Error) {
        throw new Error(`Đã xảy ra lỗi không mong muốn: ${error.message}`);
      }
      throw new Error('Đã xảy ra lỗi không mong muốn khi đăng ký.');
    }
  }
};

// Hàm mới để gọi API login
export const loginUser = async (data: LoginFormData): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // API của bạn trả về message lỗi trong body hoặc một cấu trúc khác
      const errorMessage = error.response.data.message || error.response.data.error || 'Username hoặc password không đúng.';
      throw new Error(errorMessage);
    }
    throw new Error('Đã xảy ra lỗi không mong muốn khi đăng nhập.');
  }
};

export const getCurrentUserProfile = async (token: string): Promise<UserProfileData> => {
  try {
    const response = await axios.get<UserProfileData>(`${API_GATEWAY_URL}/api/user/currentUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      throw new Error('INVALID_TOKEN'); // Lỗi cụ thể để AuthContext xử lý
    }
    console.error('Error fetching current user profile:', error);
    throw new Error('Failed to fetch user profile.');
  }
};