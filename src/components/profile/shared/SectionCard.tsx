import React from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger';
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  rightSlot,
  children,
  className = '',
  variant = 'default',
}) => {
  const borderClass = variant === 'danger' ? 'border-red-200' : 'border-gray-100';
  const bgClass = variant === 'danger' ? 'bg-red-50/50' : 'bg-white';

  return (
    <section
      className={`rounded-2xl border ${borderClass} ${bgClass} p-6 lg:p-7 ${className}`}
      style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)' }}
    >
      {(title || rightSlot) && (
        <header className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {rightSlot}
        </header>
      )}
      {children}
    </section>
  );
};

export default SectionCard;
