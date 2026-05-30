import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = 'sidebarCollapsed';

const readInitialCollapsed = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpenOnMobile, setIsSidebarOpenOnMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(readInitialCollapsed);

  const toggleMobileSidebar = () => {
    setIsSidebarOpenOnMobile((prev) => !prev);
  };

  const toggleDesktopSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Persist desktop sidebar collapsed state across reloads.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        isSidebarCollapsed ? '1' : '0'
      );
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }, [isSidebarCollapsed]);

  return (
    <div className="flex h-screen bg-brand-gray-light overflow-hidden">
      {/* Desktop sidebar — animates between 0 and 256 px width when toggled */}
      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:w-0' : 'md:w-64'
        }`}
      >
        <Sidebar />
      </div>

      {/* Mobile sidebar (overlay) — unchanged */}
      {isSidebarOpenOnMobile && (
        <div className="md:hidden fixed inset-0 flex z-40">
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
            <Sidebar />
          </div>
          <div className="flex-shrink-0 w-14" aria-hidden="true" onClick={toggleMobileSidebar} />
        </div>
      )}

      {/* Main content — left margin tracks the sidebar width on desktop */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-[margin] duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:ml-0' : 'md:ml-64'
        }`}
      >
        <Header
          onToggleMobileSidebar={toggleMobileSidebar}
          onToggleDesktopSidebar={toggleDesktopSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;