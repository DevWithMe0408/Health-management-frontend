import React from 'react';
import type { DashboardMetricsResponse, MetricDataResponse } from '../../services/dashboard.service';
import DashboardCard from './DashboardCard';

interface HealthMetricsDetailsProps {
  metrics: DashboardMetricsResponse | null;
  error?: string;
}

const metricRows: Array<{ key: keyof DashboardMetricsResponse; label: string; fallbackUnit: string }> = [
  { key: 'height', label: 'Chiều cao', fallbackUnit: 'cm' },
  { key: 'weight', label: 'Cân nặng', fallbackUnit: 'kg' },
  { key: 'bmi', label: 'BMI', fallbackUnit: '' },
  { key: 'bmr', label: 'BMR', fallbackUnit: 'kcal/ngày' },
  { key: 'tdee', label: 'TDEE', fallbackUnit: 'kcal/ngày' },
  { key: 'pbf', label: 'PBF', fallbackUnit: '%' },
  { key: 'whr', label: 'WHR', fallbackUnit: '' },
];

const formatMetric = (metric: MetricDataResponse | undefined, fallbackUnit: string) => {
  if (!metric || metric.value == null) return '--';
  const unit = metric.unit ?? fallbackUnit;
  return `${metric.value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}${unit ? ` ${unit}` : ''}`;
};

const HealthMetricsDetails: React.FC<HealthMetricsDetailsProps> = ({ metrics, error }) => {
  return (
    <DashboardCard title="Chi tiết chỉ số">
      {error && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricRows.map((row) => (
          <div key={row.key} className="rounded-md border border-gray-100 bg-gray-50 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">{row.label}</div>
            <div className="mt-1 text-base font-bold text-gray-950">
              {formatMetric(metrics?.[row.key], row.fallbackUnit)}
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default HealthMetricsDetails;
