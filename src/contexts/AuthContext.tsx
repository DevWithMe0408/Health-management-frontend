import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LoginResponse } from '../services/auth.service'; // Import LoginResponse
import type { UserProfileData } from '../services/auth.service'; // Import UserProfileData
import { getCurrentUserProfile } from '../services/auth.service'; // Import hàm lấy thông tin user profile

interface UserProfile extends UserProfileData {
  userId: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null; // Bạn có thể thêm thông tin user profile ở đây sau
  login: (authData: LoginResponse) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean; // Để xử lý việc kiểm tra token khi tải lại trang
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Ban đầu là true để kiểm tra token

  useEffect(() => {
    const attemptAutoLogin = async () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedAccessToken) {
        try {
          console.log("AuthProvider: Attempting to fetch user profile with stored token...");
          const userProfile = await getCurrentUserProfile(storedAccessToken);
          
          console.log("AuthProvider: Token valid, user profile fetched:", userProfile);
          setAccessToken(storedAccessToken);
          if (storedRefreshToken) setRefreshToken(storedRefreshToken);
          setUser(userProfile); // Lưu thông tin user đầy đủ
          setIsAuthenticated(true);
        } catch (error: any) {
          if (error.message === 'INVALID_TOKEN') {
            console.log("AuthProvider: Stored token is invalid or expired. Logging out.");
            performLogout(); // Token không hợp lệ từ Gateway
          } else {
            console.error("AuthProvider: Error fetching user profile during auto-login:", error.message);
            // Có thể là lỗi mạng hoặc lỗi server sau Gateway, cân nhắc không logout ngay
            // Hoặc nếu muốn an toàn thì vẫn logout:
            performLogout();
          }
        }
      }
      setIsLoading(false); // Kết thúc quá trình kiểm tra
    };

    attemptAutoLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  const performLogin = async (authData: LoginResponse) => {
    localStorage.setItem('accessToken', authData.accessToken);
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
      setRefreshToken(authData.refreshToken);
    }
    setAccessToken(authData.accessToken);
    setIsAuthenticated(true); // Đặt isAuthenticated trước khi gọi API /me

    try {
      console.log("AuthProvider: Fetching user profile after successful login...");
      const userProfile = await getCurrentUserProfile(authData.accessToken);
      setUser(userProfile);
      console.log("AuthProvider: User profile fetched and set after login:", userProfile);
    } catch (error) {
        console.error("AuthProvider: Failed to fetch user profile after login:", error);
        performLogout(); // Nếu không lấy được profile, có thể logout để đảm bảo an toàn
    }
  };

  const refreshUser = async () => {
    const token = accessToken || localStorage.getItem('accessToken');
    if (!token) return;

    const userProfile = await getCurrentUserProfile(token);
    setUser(userProfile);
  };
  
  const performLogout = () => {
    console.log("AuthProvider: Performing logout...");
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, refreshToken, user, login: performLogin, logout: performLogout, refreshUser, isLoading }}>
      {!isLoading && children}
      {isLoading && ( /* Màn hình loading toàn cục */
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.8)', zIndex: 9999 }}>
          <p>Initializing Application...</p> {/* Hoặc một spinner đẹp hơn */}
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
