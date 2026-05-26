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
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-green text-white shadow-sm">
            <span className="text-base font-bold">HC</span>
          </div>
          <span className="text-lg font-bold text-brand-green-dark">HealthCare</span>
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
