import React from 'react';

interface NumericInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  unit,
  error,
  helperText,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) onChange(parsed);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-32 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-400">{helperText}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default NumericInput;
