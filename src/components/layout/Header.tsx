// src/components/layout/Header.tsx
import React, { useState } from 'react'; // Thêm useState nếu cần cho dropdown
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserCircleIcon, Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth(); // Thêm logout
  const navigate = useNavigate(); // Thêm navigate
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogoutAndRedirect = () => {
    logout();
    navigate('/login');
    setIsUserMenuOpen(false); // Đóng menu sau khi logout
  };


  // Không render gì nếu đang load và chưa xác thực
  if (isLoading) return null; 
  // Chỉ hiển thị header này nếu đã login (MainLayout)
  if (!isAuthenticated) return null;


  return (
    <header className="bg-white text-brand-gray-dark shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Nút mở Sidebar cho mobile */}
          <div className="md:hidden">
            <button
              onClick={onToggleMobileSidebar}
              type="button" // Thêm type="button"
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Phần giữa Header (có thể để trống hoặc tiêu đề trang) */}
          <div className="flex-1 text-center md:text-left">
            {/* Ví dụ: <h1 className="text-xl font-semibold">Dashboard</h1> */}
          </div>

          {/* User Menu ở góc phải */}
          {user && (
            <div className="relative">
              <button
                onClick={handleUserMenuToggle}
                type="button" // Thêm type="button"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              >
                <UserCircleIcon className="h-8 w-8 text-brand-green" />
                <span className="hidden md:inline font-medium text-sm">{user.username}</span>
                <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabIndex={-1}
                  onMouseLeave={() => setIsUserMenuOpen(false)} // Tự đóng khi chuột rời khỏi menu
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                    role="menuitem"
                    tabIndex={-1}
                    id="user-menu-item-0"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Hồ sơ của tôi
                  </Link>
                  <button
                    onClick={handleLogoutAndRedirect}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                    role="menuitem"
                    tabIndex={-1}
                    id="user-menu-item-1"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
