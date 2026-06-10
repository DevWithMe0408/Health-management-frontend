import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Card khung cho từng chế độ — tiêu đề IN HOA + cụm điều hướng prev/next.
 * Style đồng bộ DashboardCard hiện có.
 */
export const RangeCard: React.FC<{
  title: string;
  label: React.ReactNode;
  labelMinWidth?: number;
  onPrev: () => void;
  onNext: () => void;
  children: React.ReactNode;
}> = ({ title, label, labelMinWidth = 130, onPrev, onNext, children }) => (
  <section
    className="rounded-2xl border border-gray-200 bg-white p-6"
    style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)' }}
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h3>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50"
          aria-label="Trước"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span
          className="text-center text-sm font-semibold capitalize text-gray-700"
          style={{ minWidth: labelMinWidth }}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50"
          aria-label="Sau"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
    {children}
  </section>
);
