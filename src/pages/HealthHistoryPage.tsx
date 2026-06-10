import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../services/apiResponse';
import { getHistoricalHealthData } from '../services/healthData.service';
import type { HistoricalDataPoint } from '../services/healthData.service';

export type MetricKey = 'WEIGHT' | 'BMI' | 'PBF' | 'WHR' | 'ABDOMEN' | 'BMR' | 'TDEE';

type Granularity = 'DAILY' | 'WEEKLY' | 'MONTHLY';

type MetricConfig = {
  key: MetricKey;
  label: string;
  unit: string;
  decimals: number;
  goodDirection: 'down' | 'up' | 'none';
  apiType: string;
};

const METRICS: MetricConfig[] = [
  { key: 'WEIGHT', label: 'Cân nặng', unit: 'kg', decimals: 1, goodDirection: 'down', apiType: 'weight' },
  { key: 'BMI', label: 'BMI', unit: '', decimals: 1, goodDirection: 'down', apiType: 'bmi' },
  { key: 'PBF', label: 'PBF (tỷ lệ mỡ)', unit: '%', decimals: 1, goodDirection: 'down', apiType: 'pbf' },
  { key: 'WHR', label: 'WHR (eo/hông)', unit: '', decimals: 2, goodDirection: 'down', apiType: 'whr' },
  { key: 'ABDOMEN', label: 'Vòng bụng', unit: 'cm', decimals: 1, goodDirection: 'down', apiType: 'abdomen' },
  { key: 'BMR', label: 'BMR', unit: 'kcal', decimals: 0, goodDirection: 'none', apiType: 'bmr' },
  { key: 'TDEE', label: 'TDEE', unit: 'kcal', decimals: 0, goodDirection: 'none', apiType: 'tdee' },
];

const METRIC_BY_KEY: Record<MetricKey, MetricConfig> = METRICS.reduce(
  (acc, metric) => ({ ...acc, [metric.key]: metric }),
  {} as Record<MetricKey, MetricConfig>,
);

const RANGES = [
  { key: '7d', label: '7 ngày', days: 7 },
  { key: '1m', label: '1 tháng', days: 30 },
  { key: '3m', label: '3 tháng', days: 90 },
  { key: '6m', label: '6 tháng', days: 180 },
  { key: '1y', label: '1 năm', days: 365 },
] as const;

type RangeKey = (typeof RANGES)[number]['key'];

const BRAND = '#059669';
const BRAND_DARK = '#047857';
const DAY_MS = 86_400_000;
const CARD_SHADOW = '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03)';

const round = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const formatValue = (value: number, decimals: number) =>
  value.toLocaleString('vi-VN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const formatDayMonth = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

const toLocalYmd = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const granularityFor = (days: number): Granularity =>
  days <= 31 ? 'DAILY' : days <= 180 ? 'WEEKLY' : 'MONTHLY';

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: { iso?: string }; value?: number }>;
  metric: MetricConfig;
};

const ChartTooltip: React.FC<TooltipProps> = ({ active, payload, metric }) => {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0];
  const iso = point.payload?.iso;
  const value = typeof point.value === 'number' ? point.value : null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-500">{iso ? formatDayMonth(iso) : ''}</p>
      <p className="mt-0.5 text-sm font-semibold" style={{ color: BRAND_DARK }}>
        {value != null ? formatValue(value, metric.decimals) : '--'}
        {metric.unit ? ` ${metric.unit}` : ''}
      </p>
    </div>
  );
};

type MetricChartCardProps = {
  metric: MetricConfig;
  points: HistoricalDataPoint[];
};

const MetricChartCard: React.FC<MetricChartCardProps> = ({ metric, points }) => {
  const sorted = useMemo(
    () =>
      [...points]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((point) => ({
          iso: point.timestamp,
          label: formatDayMonth(point.timestamp),
          value: point.value,
        })),
    [points],
  );

  const enough = sorted.length >= 2;

  const summary = useMemo(() => {
    if (!enough) return null;

    const first = sorted[0].value;
    const last = sorted[sorted.length - 1].value;
    const change = round(last - first, metric.decimals);
    const dir: 'down' | 'up' | 'flat' = change < 0 ? 'down' : change > 0 ? 'up' : 'flat';
    const positive = metric.goodDirection !== 'none' && dir !== 'flat' && dir === metric.goodDirection;
    const negative = metric.goodDirection !== 'none' && dir !== 'flat' && dir !== metric.goodDirection;
    const word = dir === 'down' ? 'giảm' : dir === 'up' ? 'tăng' : 'không đổi';

    return {
      last,
      changeAbs: Math.abs(change),
      dir,
      word,
      tone: positive ? 'good' : negative ? 'bad' : 'neutral',
    } as const;
  }, [enough, metric, sorted]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: CARD_SHADOW }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{metric.label}</h3>
          {summary ? (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
              <span className="text-lg font-bold tracking-tight text-gray-900">
                {formatValue(summary.last, metric.decimals)}
                {metric.unit ? ` ${metric.unit}` : ''}
              </span>
              <span
                className={
                  summary.tone === 'good'
                    ? 'inline-flex items-center gap-1 font-semibold text-brand-green-dark'
                    : summary.tone === 'bad'
                      ? 'inline-flex items-center gap-1 font-semibold text-rose-600'
                      : 'inline-flex items-center gap-1 font-medium text-gray-500'
                }
              >
                {summary.dir === 'down' ? (
                  <ArrowTrendingDownIcon className="h-4 w-4" />
                ) : summary.dir === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                ) : (
                  <MinusIcon className="h-4 w-4" />
                )}
                {summary.dir === 'flat'
                  ? 'không đổi trong kỳ'
                  : `${summary.word} ${formatValue(summary.changeAbs, metric.decimals)}${metric.unit ? ` ${metric.unit}` : ''} trong kỳ`}
              </span>
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-gray-500">Theo dõi thay đổi theo thời gian</p>
          )}
        </div>
      </div>

      {enough ? (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sorted} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#eef2f1" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                minTickGap={28}
                interval="preserveStartEnd"
              />
              <YAxis
                width={44}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value: number) => formatValue(value, metric.decimals)}
              />
              <Tooltip
                content={<ChartTooltip metric={metric} />}
                cursor={{ stroke: BRAND, strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={BRAND}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: '#ffffff', stroke: BRAND }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-green-light">
            <ChartBarIcon className="h-6 w-6 text-brand-green-dark" />
          </span>
          <p className="mt-3 text-sm font-semibold text-gray-900">Chưa đủ dữ liệu để vẽ biểu đồ</p>
          <p className="mt-1 max-w-xs text-sm text-gray-500">
            Cần ít nhất 2 lần đo trong khoảng thời gian đã chọn. Hãy cập nhật chỉ số hoặc mở rộng khoảng thời gian.
          </p>
        </div>
      )}
    </section>
  );
};

const HealthHistoryPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [selected, setSelected] = useState<MetricKey[]>(['WEIGHT', 'PBF', 'ABDOMEN']);
  const [rangeKey, setRangeKey] = useState<RangeKey>('3m');
  const [data, setData] = useState<Partial<Record<MetricKey, HistoricalDataPoint[]>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = RANGES.find((item) => item.key === rangeKey) ?? RANGES[2];

  const toggleMetric = (key: MetricKey) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  };

  useEffect(() => {
    if (selected.length === 0) {
      setData({});
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const from = new Date(Date.now() - range.days * DAY_MS);
      const to = new Date();
      const fromStr = toLocalYmd(from);
      const toStr = toLocalYmd(to);
      const granularity = granularityFor(range.days);

      try {
        const entries = await Promise.all(
          selected.map(async (key) => {
            const metric = METRIC_BY_KEY[key];
            const series = await getHistoricalHealthData(accessToken ?? undefined, metric.apiType, fromStr, toStr, granularity);
            return [key, series] as const;
          }),
        );

        if (!cancelled) setData(Object.fromEntries(entries));
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Không tải được dữ liệu lịch sử.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [accessToken, range.days, selected]);

  const orderedSelected = METRICS.filter((metric) => selected.includes(metric.key));
  const hasAnyData = Object.keys(data).length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Lịch sử chỉ số</h1>
        <p className="mt-1 text-sm text-gray-500">
          Theo dõi diễn biến các chỉ số sức khỏe của bạn theo thời gian. Chọn chỉ số và khoảng thời gian để xem biểu đồ.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6" style={{ boxShadow: CARD_SHADOW }}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Chọn chỉ số</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {METRICS.map((metric) => {
            const active = selected.includes(metric.key);

            return (
              <button
                key={metric.key}
                type="button"
                onClick={() => toggleMetric(metric.key)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-emerald-200 bg-brand-green-light font-semibold text-brand-green-darker'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {metric.label}
              </button>
            );
          })}
        </div>

        <div className="my-5 h-px bg-gray-100" />

        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Khoảng thời gian</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {RANGES.map((item) => {
            const active = item.key === rangeKey;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setRangeKey(item.key)}
                aria-pressed={active}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-brand-green bg-brand-green text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>
      )}

      {selected.length === 0 ? (
        <section
          className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center"
          style={{ boxShadow: CARD_SHADOW }}
        >
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-green-light">
            <ChartBarIcon className="h-6 w-6 text-brand-green-dark" />
          </span>
          <p className="mt-3 text-sm font-semibold text-gray-900">Chưa chọn chỉ số nào</p>
          <p className="mt-1 text-sm text-gray-500">Chọn ít nhất một chỉ số ở trên để hiển thị biểu đồ lịch sử.</p>
        </section>
      ) : isLoading && !hasAnyData ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-brand-green" />
          <p className="ml-3 text-sm text-gray-500">Đang tải dữ liệu biểu đồ...</p>
        </div>
      ) : (
        <>
          {isLoading && <p className="text-xs text-gray-400">Đang cập nhật theo khoảng thời gian mới...</p>}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {orderedSelected.map((metric) => (
              <MetricChartCard key={metric.key} metric={metric} points={data[metric.key] ?? []} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HealthHistoryPage;
