import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar from '../components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="relative flex flex-col w-60 bg-white shadow-xl">
            <button
              type="button"
              className="absolute top-3 right-3 p-1 rounded-md text-gray-400 hover:text-gray-600"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <AdminSidebar />
          </div>
          <div
            className="flex-1 bg-black bg-opacity-30"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-60">
        <AdminHeader onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
