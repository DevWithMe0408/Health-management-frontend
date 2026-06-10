import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { PlanDay } from '../../types/meal.types';

interface DaySelectorProps {
  value: PlanDay;
  onChange: (day: PlanDay) => void;
  disabled?: boolean;
  full?: boolean;
}

const ITEMS: { key: PlanDay; label: string }[] = [
  { key: 'TODAY', label: 'Hôm nay' },
  { key: 'TOMORROW', label: 'Ngày mai' },
];

const DaySelector: React.FC<DaySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  full = false,
}) => (
  <div
    role="tablist"
    aria-label="Chọn ngày thực đơn"
    className={`gap-0.5 rounded-xl border border-gray-200 bg-gray-50 p-1 ${
      full ? 'flex w-full' : 'inline-flex'
    }`}
  >
    {ITEMS.map((item) => {
      const active = value === item.key;

      return (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={active}
          disabled={disabled}
          onClick={() => onChange(item.key)}
          className={`min-w-[92px] rounded-[9px] px-[18px] py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            full ? 'flex-1' : ''
          } ${
            active
              ? 'bg-brand-green text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {item.label}
        </button>
      );
    })}
  </div>
);

export const TomorrowChip: React.FC = () => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-brand-green-darker ring-1 ring-inset ring-emerald-200">
    <CalendarDaysIcon className="h-3.5 w-3.5" />
    Ngày mai
  </span>
);

export default DaySelector;
