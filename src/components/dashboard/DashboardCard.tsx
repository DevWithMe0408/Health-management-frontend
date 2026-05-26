import React from 'react';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  info?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  info,
  rightAction,
  children,
  className = '',
}) => {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white p-6 ${className}`}
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)' }}
    >
      {(title || rightAction) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                {title}
                {info && (
                  <span
                    title={info}
                    className="inline-grid h-3.5 w-3.5 cursor-help place-items-center rounded-full bg-gray-100 text-[9px] font-bold text-gray-500"
                  >
                    i
                  </span>
                )}
              </h3>
            )}
            {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {rightAction}
        </div>
      )}
      {children}
    </section>
  );
};

export default DashboardCard;
