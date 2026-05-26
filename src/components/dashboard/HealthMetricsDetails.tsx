import React, { useState } from 'react';
import type { DashboardMetricsResponse, MetricDataResponse } from '../../services/dashboard.service';

interface HealthMetricsDetailsProps {
  metrics: DashboardMetricsResponse | null;
  error?: string;
}

const metricRows: Array<{
  key: keyof DashboardMetricsResponse;
  label: string;
  fallbackUnit: string;
  tip?: string;
}> = [
  { key: 'height', label: 'Chiều cao', fallbackUnit: 'cm' },
  { key: 'weight', label: 'Cân nặng', fallbackUnit: 'kg' },
  { key: 'bmi', label: 'BMI', fallbackUnit: '', tip: 'Chỉ số khối cơ thể (WHO Asian)' },
  { key: 'bmr', label: 'BMR', fallbackUnit: 'kcal/ngày', tip: 'Tỉ lệ chuyển hóa cơ bản (Mifflin-St Jeor)' },
  { key: 'tdee', label: 'TDEE', fallbackUnit: 'kcal/ngày', tip: 'Tổng năng lượng tiêu thụ ngày' },
  { key: 'pbf', label: 'PBF', fallbackUnit: '%', tip: 'Tỉ lệ mỡ cơ thể (Navy formula)' },
  { key: 'whr', label: 'WHR', fallbackUnit: '', tip: 'Tỉ lệ eo/hông' },
];

const formatMetric = (metric: MetricDataResponse | undefined, fallbackUnit: string) => {
  if (!metric || metric.value == null) return '--';
  const unit = metric.unit ?? fallbackUnit;
  return `${metric.value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ''}`;
};

const HealthMetricsDetails: React.FC<HealthMetricsDetailsProps> = ({ metrics, error }) => {
  const [open, setOpen] = useState(false);
  const preview = [
    `BMR ${metrics?.bmr?.value?.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) || '--'}`,
    `TDEE ${metrics?.tdee?.value?.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) || '--'}`,
    `PBF ${metrics?.pbf?.value?.toFixed(1) || '--'}%`,
    `WHR ${metrics?.whr?.value?.toFixed(2) || '--'}`,
  ].join(' · ');

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition hover:bg-gray-50"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Chi tiết chỉ số y khoa</span>
          {!open && <span className="hidden truncate text-xs text-gray-400 sm:inline">· {preview}</span>}
        </div>
        <span className="flex-shrink-0 text-xs text-gray-400">{open ? 'Thu gọn' : 'Mở rộng'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5">
          {error && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {error}
            </div>
          )}
          <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
            {metricRows.map((row) => (
              <div key={row.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {row.label}
                  {row.tip && (
                    <span
                      title={row.tip}
                      className="inline-grid h-3.5 w-3.5 cursor-help place-items-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-500"
                    >
                      i
                    </span>
                  )}
                </div>
                <div className="mt-1 text-base font-bold text-gray-900" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMetric(metrics?.[row.key], row.fallbackUnit)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthMetricsDetails;
