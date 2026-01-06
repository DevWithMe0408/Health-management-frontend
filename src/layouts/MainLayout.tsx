import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer'; // Giữ lại Footer nếu muốn
import Sidebar from '../components/layout/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // State để quản lý việc hiển thị sidebar trên mobile (nếu cần)
  const [isSidebarOpenOnMobile, setIsSidebarOpenOnMobile] = useState(false);
  // const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleMobileSidebar = () => {
    setIsSidebarOpenOnMobile(!isSidebarOpenOnMobile);
  };
  return (
    <div className="flex h-screen bg-brand-gray-light overflow-hidden"> {/* Thêm overflow-hidden ở đây */}
      {/* Sidebar */}
      {/* Sidebar cho màn hình lớn (luôn hiển thị) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0"> {/* md:w-64 là chiều rộng sidebar */}
        <Sidebar />
      </div>

      {/* Sidebar cho mobile (toggle được) */}
      {isSidebarOpenOnMobile && (
        <div className="md:hidden fixed inset-0 flex z-40">
          {/* Phần Sidebar thực sự */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileSidebar}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <Sidebar /> {/* Sử dụng lại component Sidebar */}
          </div>
          {/* Overlay phía sau */}
          <div className="flex-shrink-0 w-14" aria-hidden="true" onClick={toggleMobileSidebar}>
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
      )}
      
      {/* Vùng Nội dung chính */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64"> {/* md:ml-64 để đẩy content sang phải trên desktop */}
        <Header onToggleMobileSidebar={toggleMobileSidebar} /> {/* Truyền hàm toggle cho Header */}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          {children}
        </main>
        
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default MainLayout;