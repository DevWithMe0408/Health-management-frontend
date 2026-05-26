import React from 'react';

interface WizardFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  helper?: string;
  required?: boolean;
  optional?: boolean;
  colSpan?: 1 | 2;
}

const WizardField: React.FC<WizardFieldProps> = ({
  label,
  children,
  error,
  helper,
  required = false,
  optional = false,
  colSpan = 1,
}) => {
  return (
    <label className={`block ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-xs font-medium text-gray-400">(tùy chọn)</span>}
      </span>
      {children}
      {helper && !error && <span className="mt-1 block text-xs text-gray-500">{helper}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
};

export default WizardField;
