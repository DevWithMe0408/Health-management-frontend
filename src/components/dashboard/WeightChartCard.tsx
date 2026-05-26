import React from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import type { HealthHistoryPoint } from '../../services/dashboard.service';
import DashboardCard from './DashboardCard';

interface WeightChartCardProps {
  data: HealthHistoryPoint[];
  error?: string;
}

interface ChartPoint {
  date: string;
  label: string;
  weight: number;
}

const toChartPoint = (point: HealthHistoryPoint): ChartPoint | null => {
  const rawDate = point.date || point.timestamp;
  if (!rawDate || point.value == null) return null;

  const date = new Date(rawDate);
  const label = Number.isNaN(date.getTime())
    ? rawDate
    : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

  return {
    date: rawDate,
    label,
    weight: point.value,
  };
};

const WeightChartCard: React.FC<WeightChartCardProps> = ({ data, error }) => {
  const chartData = data.map(toChartPoint).filter((point): point is ChartPoint => point !== null);

  return (
    <DashboardCard title="Cân nặng 30 ngày">
      {error && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}

      {chartData.length < 2 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <ChartBarIcon className="h-9 w-9 text-gray-400" />
          <div className="mt-3 text-sm font-semibold text-gray-900">Cần ít nhất 2 lần cân</div>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Cập nhật cân nặng định kỳ để theo dõi tiến độ trong 30 ngày gần nhất.
          </p>
          <Link
            to="/submit-data"
            className="mt-4 rounded-md bg-brand-green px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
          >
            Cập nhật cân nặng
          </Link>
        </div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 16, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis
                dataKey="weight"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'Cân nặng']}
                labelFormatter={(_, payload) => {
                  const date = payload?.[0]?.payload?.date as string | undefined;
                  if (!date) return '';
                  const parsed = new Date(date);
                  return Number.isNaN(parsed.getTime())
                    ? date
                    : parsed.toLocaleDateString('vi-VN');
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
};

export default WeightChartCard;
