import axios from 'axios';

const API_USER_SERVICE_URL = `${import.meta.env.VITE_API_GW_BASE_URL || 'http://localhost:8080'}/api/user`;

// Khớp với UserAccountDetailsResponse từ backend
export interface UserAccountDetails {
  userId: number;
  userName: string;
  email: string;
  roles: string[];
  name?: string | null;
  phoneNumber?: string | null;
  birthDate?: string | null; // Sẽ là ISO date string từ backend
  gender?: string | null;    // "MALE", "FEMALE"
}

export const getUserAccountDetails = async (token: string): Promise<UserAccountDetails> => {
  try {
    const response = await axios.get<UserAccountDetails>(`${API_USER_SERVICE_URL}/account-details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('User account details fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = (error.response.data as any)?.message || (error.response.data as string) || 'Lấy thông tin tài khoản thất bại.';
      throw new Error(errorMessage);
    }
    throw new Error('Đã xảy ra lỗi không mong muốn khi lấy thông tin tài khoản.');
  }
};

// src/services/user.service.ts
// ... (imports và getUserAccountDetails, UserAccountDetails đã có) ...

// Kiểu dữ liệu cho request body của API cập nhật (khớp với UpdateUserAccountDetailsRequest backend)
export interface UpdateUserAccountDetailsPayload {
  name?: string | null;
  phoneNumber?: string | null;
  birthDate?: string | null; // Gửi dưới dạng YYYY-MM-DD string
  gender?: string | null;    // "MALE", "FEMALE"
}

// Hàm mới để cập nhật thông tin tài khoản
export const updateUserAccountDetails = async (
  token: string,
  payload: UpdateUserAccountDetailsPayload
): Promise<UserAccountDetails> => { // API trả về thông tin đã cập nhật
  try {
    const response = await axios.put<UserAccountDetails>(`${API_USER_SERVICE_URL}/update-account-details`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Xử lý lỗi validation từ backend nếu có (thường là 400)
      if (error.response.data && error.response.data.errors) { // Giả sử backend trả về lỗi validation có cấu trúc
        const validationErrors = error.response.data.errors.map((e: any) => e.defaultMessage || e.message).join(', ');
        throw new Error(`Lỗi dữ liệu: ${validationErrors}`);
      }
      const errorMessage = (error.response.data as any)?.message || (error.response.data as string) || 'Cập nhật thông tin tài khoản thất bại.';
      throw new Error(errorMessage);
    }
    throw new Error('Đã xảy ra lỗi không mong muốn khi cập nhật thông tin tài khoản.');
  }
};