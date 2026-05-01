import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SumIndicatorProps {
  values: number[];
  expected: number;
  label?: string;
  precision?: number;
}

const SumIndicator: React.FC<SumIndicatorProps> = ({
  values,
  expected,
  label = 'Tổng',
  precision = 2,
}) => {
  const sum = values.reduce((a, b) => a + b, 0);
  const isValid = Math.abs(sum - expected) < 0.005;

  return (
    <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border ${
      isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
    }`}>
      {isValid ? (
        <CheckCircleIcon className="h-4 w-4 text-green-600 shrink-0" />
      ) : (
        <XCircleIcon className="h-4 w-4 text-red-500 shrink-0" />
      )}
      <span className={isValid ? 'text-green-700' : 'text-red-600'}>
        {label}: <strong>{sum.toFixed(precision)}</strong>
        {!isValid && (
          <span className="ml-1 text-xs">(cần = {expected.toFixed(precision)})</span>
        )}
      </span>
    </div>
  );
};

export default SumIndicator;
