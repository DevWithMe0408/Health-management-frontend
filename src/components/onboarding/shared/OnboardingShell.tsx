import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface OnboardingShellProps {
  children: React.ReactNode;
}

const OnboardingShell: React.FC<OnboardingShellProps> = ({ children }) => {
  const { logout } = useAuth();

  return (
    <main
      className="min-h-screen overflow-hidden bg-gradient-to-b from-white via-emerald-50/50 to-brand-green-light px-4 py-6 text-gray-900"
      style={{ fontFamily: '"Be Vietnam Pro", Inter, system-ui, sans-serif' }}
    >
      <div className="pointer-events-none fixed -right-32 top-24 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none fixed -left-32 bottom-16 h-72 w-72 rounded-full bg-green-100/60 blur-3xl" />

      <header className="relative z-10 mx-auto mb-8 flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-green to-emerald-500"
            style={{ boxShadow: '0 4px 12px -4px rgba(5, 150, 105, 0.45)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.75" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-gray-900">
            Health<span className="text-brand-green">Care</span>
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-white/80 hover:text-gray-900"
        >
          Đăng xuất
        </button>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl">{children}</div>
    </main>
  );
};

export default OnboardingShell;
