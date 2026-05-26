import React from 'react';

interface DashboardCardProps {
  title?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  rightAction,
  children,
  className = '',
}) => {
  return (
    <section className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {(title || rightAction) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && <h2 className="text-base font-semibold text-gray-900">{title}</h2>}
          {rightAction}
        </div>
      )}
      {children}
    </section>
  );
};

export default DashboardCard;
