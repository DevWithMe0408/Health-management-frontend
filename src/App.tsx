// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SubmitHealthDataPage from './pages/SubmitHealthDataPage';
import HealthStatsPage from './pages/HealthStatsPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage'; // Import LandingPage
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './contexts/AuthContext'; // Import useAuth
import UserProfilePage from './pages/UserProfilePage'; // Import UserProfilePage

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Hiển thị một loader toàn cục trong khi AuthContext đang kiểm tra
    // Điều này đã được xử lý bên trong AuthProvider, nên ở đây có thể không cần nữa
    // nếu bạn muốn component con của AuthProvider tự xử lý (ví dụ: Header)
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-green"></div>
        </div>
    );
  }

  return (
    <Routes>
      {/* Route cho Landing Page khi chưa đăng nhập */}
      {!isAuthenticated && <Route path="/" element={<LandingPage />} />}
      
      {/* Routes công khai */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

      {/* Routes được bảo vệ sử dụng MainLayout */}
      {/* Trang chủ sau khi đăng nhập sẽ là /dashboard hoặc một path khác nếu / là landing page */}
      <Route 
        path={isAuthenticated ? "/" : "/dashboard"} // Nếu đã đăng nhập, / là HomePage. Nếu chưa, /dashboard sẽ được bảo vệ.
                                                // Hoặc luôn đặt HomePage ở một path riêng như /dashboard
        element={
          <ProtectedRoute>
            <MainLayout><HomePage /></MainLayout>
          </ProtectedRoute>
        } 
      />
       {/* Giải pháp tốt hơn: Luôn đặt HomePage ở một path cụ thể sau khi đăng nhập */}
       <Route 
        path="/dashboard" // Đây sẽ là trang chủ sau khi đăng nhập
        element={
          <ProtectedRoute>
            <MainLayout><HomePage /></MainLayout>
          </ProtectedRoute>
        } 
      />
      {/* Nếu user đã đăng nhập và vào /, chuyển hướng đến /dashboard */}
      {isAuthenticated && <Route path="/" element={<Navigate to="/dashboard" replace />} />}


      <Route 
        path="/submit-data" 
        element={
          <ProtectedRoute>
            <MainLayout><SubmitHealthDataPage /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <MainLayout><UserProfilePage /></MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/stats" 
        element={
          <ProtectedRoute>
            <MainLayout><HealthStatsPage /></MainLayout>
          </ProtectedRoute>
        } 
      />
      {/* Placeholder routes cho các chức năng khác */}
      <Route path="/nutrition-plan" element={<ProtectedRoute><MainLayout><div>Nutrition Plan Page (Coming Soon)</div></MainLayout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><MainLayout><div>Notifications Page (Coming Soon)</div></MainLayout></ProtectedRoute>} />
      
      <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
    </Routes>
  );
}


const App: React.FC = () => {
  return (
    <Router>
      <AppRoutes /> {/* Tách Routes ra một component riêng để sử dụng useAuth */}
    </Router>
  );
};

export default App;