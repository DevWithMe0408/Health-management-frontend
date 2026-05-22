import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserCircleIcon, ChevronDownIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface AdminHeaderProps {
  onToggleMobileSidebar?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-16 flex items-center px-4 md:px-6">
      <button
        type="button"
        className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 mr-3"
        onClick={onToggleMobileSidebar}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <Link to="/admin" className="text-lg font-bold text-brand-green hidden md:block">
        HealthCare
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold select-none">
          Admin
        </span>

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
            >
              <UserCircleIcon className="h-7 w-7 text-brand-green" />
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {user.username}
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Hồ sơ cá nhân
                </Link>
                <button
                  type="button"
                  onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Chuyển sang user view
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
