import React from 'react';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import type { DashboardMetricsResponse, HealthHistoryPoint } from '../../services/dashboard.service';

interface MetricSummaryGridProps {
  metrics: DashboardMetricsResponse | null;
  weightHistory: HealthHistoryPoint[];
}

const formatNumber = (value?: number | null, fractionDigits = 1) => {
  if (value == null) return '--';
  return value.toLocaleString('vi-VN', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });
};

const getWeeklyDelta = (history: HealthHistoryPoint[]) => {
  if (history.length < 2) return null;
  const first = history[0]?.value;
  const last = history[history.length - 1]?.value;
  if (first == null || last == null) return null;
  return last - first;
};

const MetricSummaryGrid: React.FC<MetricSummaryGridProps> = ({ metrics, weightHistory }) => {
  const delta = getWeeklyDelta(weightHistory.slice(-7));
  const DeltaIcon = delta != null && delta > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  const items = [
    {
      label: 'Cân hiện tại',
      value: `${formatNumber(metrics?.weight?.value)} ${metrics?.weight?.unit || 'kg'}`,
      helper: 'Ghi nhận gần nhất',
      Icon: ScaleIcon,
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    {
      label: 'Tuần này',
      value: delta == null ? '--' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg`,
      helper: 'Chênh lệch cân nặng',
      Icon: DeltaIcon,
      bg: delta != null && delta > 0 ? 'bg-orange-50' : 'bg-emerald-50',
      text: delta != null && delta > 0 ? 'text-orange-700' : 'text-emerald-700',
    },
    {
      label: 'TDEE',
      value: `${formatNumber(metrics?.tdee?.value, 0)} ${metrics?.tdee?.unit || 'kcal/ngày'}`,
      helper: 'Nhu cầu năng lượng',
      Icon: FireIcon,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(({ label, value, helper, Icon, bg, text }) => (
        <section
          key={label}
          className="rounded-2xl border border-gray-200 bg-white p-4"
          style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}
        >
          <div className={`mb-3 inline-flex rounded-xl ${bg} p-2.5 ${text}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div
            className="text-2xl font-extrabold tracking-tight text-gray-900"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {value}
          </div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</div>
          <div className="mt-0.5 text-[11px] text-gray-400">{helper}</div>
        </section>
      ))}
    </div>
  );
};

export default MetricSummaryGrid;
