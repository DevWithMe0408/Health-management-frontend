import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface NavItemProps {
  to: string;
  label: string;
  indent?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, indent = false }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center px-3 py-2 rounded-md text-sm transition-colors duration-100 ${
        indent ? 'ml-4' : ''
      } ${
        isActive
          ? 'bg-green-50 text-brand-green font-semibold border-l-2 border-brand-green pl-[10px]'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    {label}
  </NavLink>
);

const AdminSidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [configOpen, setConfigOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <span className="text-lg font-bold text-brand-green">HealthCare</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Dashboard */}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-green-50 text-brand-green font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <ChartBarIcon className="h-5 w-5 shrink-0" />
          Tổng quan
        </NavLink>

        {/* Cấu hình group */}
        <div>
          <button
            type="button"
            onClick={() => setConfigOpen(!configOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
          >
            <Cog6ToothIcon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">Cấu hình</span>
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${configOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {configOpen && (
            <div className="mt-1 space-y-0.5">
              <NavItem to="/admin/configs/goals"    label="Mục tiêu"   indent />
              <NavItem to="/admin/configs/meals"    label="Bữa ăn"     indent />
              <NavItem to="/admin/configs/penalties" label="Penalty"   indent />
              <NavItem to="/admin/configs/scoring"  label="Scoring"    indent />
              <NavItem to="/admin/configs/system"   label="Hệ thống"   indent />
            </div>
          )}
        </div>

        {/* Users */}
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-green-50 text-brand-green font-semibold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <UserGroupIcon className="h-5 w-5 shrink-0" />
          Người dùng
        </NavLink>
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5 shrink-0" />
          User view
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 w-full"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
