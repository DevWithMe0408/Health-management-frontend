import React from 'react';

interface FieldRowProps {
  label: string;
  value?: string | number | null;
  help?: string;
  placeholder?: string;
}

const FieldRow: React.FC<FieldRowProps> = ({
  label,
  value,
  help,
  placeholder = 'Chưa cập nhật',
}) => {
  const hasValue = value !== undefined && value !== null && value !== '';

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </div>
      <div className={`min-h-[22px] text-sm font-medium ${hasValue ? 'text-gray-900' : 'italic text-gray-400'}`}>
        {hasValue ? value : placeholder}
      </div>
      {help && <div className="mt-0.5 text-xs text-gray-500">{help}</div>}
    </div>
  );
};

export default FieldRow;
