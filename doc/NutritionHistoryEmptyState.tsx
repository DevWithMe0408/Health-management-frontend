import React from 'react';
import { CalendarDaysIcon, SparklesIcon } from '@heroicons/react/24/outline';

/** Empty state khi chưa có bữa ăn nào được ghi nhận. */
export const NutritionHistoryEmptyState: React.FC<{ onCreatePlan?: () => void }> = ({
  onCreatePlan,
}) => (
  <section
    className="rounded-2xl border border-gray-200 bg-white p-6"
    style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)' }}
  >
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-green-light text-brand-green">
        <CalendarDaysIcon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-gray-900">Chưa có bữa ăn nào được ghi nhận</h3>
      <p className="max-w-sm text-sm leading-6 text-gray-500">
        Hãy tạo thực đơn để bắt đầu theo dõi mức độ tuân thủ của bạn.
      </p>
      <button
        type="button"
        onClick={onCreatePlan}
        className="mt-1 inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark"
      >
        <SparklesIcon className="h-4 w-4" />
        Tạo thực đơn
      </button>
    </div>
  </section>
);
