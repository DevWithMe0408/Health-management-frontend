import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HomeIcon, PencilSquareIcon, BeakerIcon, BellIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, onClick }) => {
  const baseClasses = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-150 group";
  
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} text-gray-700 hover:bg-green-50 hover:text-green-700 w-full text-left`}
      >
        <Icon className="h-6 w-6 text-gray-600 group-hover:text-green-600" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${baseClasses} ${
          isActive
            ? 'bg-green-600 text-white font-semibold shadow-md'
            : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon 
            className={`h-6 w-6 ${
              isActive 
                ? 'text-white' 
                : 'text-gray-600 group-hover:text-green-600'
            }`} 
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white shadow-lg h-full flex flex-col p-4 pt-6 border-r border-gray-200">
      <div className="mb-8 text-center">
        <Link 
          to={user ? "/dashboard" : "/"} 
          className="text-2xl font-bold text-green-700 hover:text-green-800 transition-colors"
        >
          HealthCare
        </Link>
      </div>

      <nav className="flex-grow space-y-2">
        <NavItem to="/dashboard" icon={HomeIcon} label="Thông số Sức khỏe" />
        <NavItem to="/submit-data" icon={PencilSquareIcon} label="Cập nhật Chỉ số" />
        <NavItem to="/nutrition-plan" icon={BeakerIcon} label="Đề xuất Thực đơn" />
        <NavItem to="/notifications" icon={BellIcon} label="Thông báo" />
      </nav>

      <div className="mt-auto">
        <NavItem onClick={handleLogout} icon={ArrowLeftOnRectangleIcon} label="Đăng xuất" to="" />
      </div>
    </aside>
  );
};

export default Sidebar;