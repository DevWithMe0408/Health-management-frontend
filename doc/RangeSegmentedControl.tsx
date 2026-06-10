import React from 'react';
import type { RangeMode } from '../nutritionHistory.types';

const RANGES: { key: RangeMode; label: string }[] = [
  { key: 'day', label: 'Ngày' },
  { key: 'week', label: 'Tuần' },
  { key: 'month', label: 'Tháng' },
];

/** Segmented control: [Ngày] · [Tuần] · [Tháng]. */
export const RangeSegmentedControl: React.FC<{
  value: RangeMode;
  onChange: (next: RangeMode) => void;
}> = ({ value, onChange }) => (
  <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
    {RANGES.map((r) => {
      const active = value === r.key;
      return (
        <button
          key={r.key}
          type="button"
          onClick={() => onChange(r.key)}
          className={`min-w-[76px] rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
            active ? 'bg-brand-green text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {r.label}
        </button>
      );
    })}
  </div>
);
