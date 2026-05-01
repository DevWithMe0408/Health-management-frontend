import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface FilterOption {
  value: string;
  label: string;
}

export interface ToolbarFilter {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface ToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ToolbarFilter[];
}

const Toolbar: React.FC<ToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters = [],
}) => (
  <div className="flex flex-wrap items-center gap-3 mb-4">
    <div className="relative flex-1 min-w-48">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
      />
    </div>

    {filters.map((f) => (
      <div key={f.label} className="flex items-center gap-1.5">
        <label className="text-sm text-gray-500 shrink-0">{f.label}:</label>
        <select
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    ))}
  </div>
);

export default Toolbar;
