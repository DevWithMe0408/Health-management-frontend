import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, height = 10 }) => {
  const percentage = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className="relative overflow-hidden rounded-full bg-gray-100"
      style={{ height }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(max, Math.max(0, value))}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-green to-brand-green-medium transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
