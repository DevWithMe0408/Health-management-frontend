import React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const SLOT_LABELS: Record<string, string> = {
  CHINH: 'Món chính',
  RAU: 'Rau',
  TINH_BOT: 'Tinh bột',
  COMBO: 'Combo',
  BUA_PHU: 'Bữa phụ',
};

const SLOT_ORDER = ['CHINH', 'RAU', 'TINH_BOT', 'COMBO', 'BUA_PHU'];
const THRESHOLD = 10;
const MIN_DOMAIN_MAX = 50;

interface SlotCoverageChartProps {
  dishCountBySlot: Record<string, number>;
}

interface SlotDatum {
  code: string;
  name: string;
  value: number;
}

interface TickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
    payload?: SlotDatum;
  };
}

const normalizeCount = (value: number | undefined): number => (
  Number.isFinite(value) && value !== undefined ? Math.max(0, value) : 0
);

const SlotTick: React.FC<TickProps> = ({ x = 0, y = 0, payload }) => {
  const datum = payload?.payload;

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#374151">
        <tspan x={0} y={16} fontSize={12} fontWeight={500}>
          {payload?.value}
        </tspan>
        <tspan x={0} y={31} fontSize={10} fill="#9ca3af" fontFamily="monospace">
          {datum?.code}
        </tspan>
      </text>
    </g>
  );
};

const SlotCoverageChart: React.FC<SlotCoverageChartProps> = ({ dishCountBySlot }) => {
  const data: SlotDatum[] = SLOT_ORDER.map((code) => ({
    code,
    name: SLOT_LABELS[code] ?? code,
    value: normalizeCount(dishCountBySlot[code]),
  }));
  const below = data.filter((d) => d.value < THRESHOLD);
  const maxValue = Math.max(THRESHOLD, ...data.map((d) => d.value));
  const domainMax = Math.max(MIN_DOMAIN_MAX, Math.ceil(maxValue * 1.12));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-800">Độ phủ kho món theo slot</h2>
        <p className="mt-1 text-xs text-gray-500">
          Số món đang hoạt động ở mỗi vị trí trong bữa ăn. Thuật toán đề xuất cần đủ ứng viên
          ở mỗi slot mới sinh được thực đơn đa dạng.
        </p>
      </div>

      <div className="relative h-[260px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 34 }}>
            <YAxis hide domain={[0, domainMax]} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={<SlotTick />}
              height={42}
            />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              formatter={(value: number) => [`${value} món`, 'Số món']}
              labelFormatter={(_, payload) => {
                const datum = payload?.[0]?.payload as SlotDatum | undefined;
                return datum ? `${datum.name} (${datum.code})` : '';
              }}
            />
            <ReferenceLine
              y={THRESHOLD}
              stroke="#fb923c"
              strokeDasharray="5 4"
              ifOverflow="extendDomain"
              label={{
                value: `Ngưỡng tối thiểu (${THRESHOLD})`,
                position: 'right',
                fill: '#f97316',
                fontSize: 11,
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((d) => (
                <Cell key={d.code} fill={d.value < THRESHOLD ? '#fb923c' : '#059669'} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                style={{ fill: '#374151', fontSize: 14, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {below.length === 0 ? (
        <div className="mt-4 flex w-fit items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
          <CheckCircleIcon className="h-4 w-4 shrink-0 text-green-600" />
          <span>Tất cả slot đều ≥ ngưỡng — kho món đủ đa dạng để sinh thực đơn.</span>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-orange-500" />
          <span>
            {below.length} slot dưới ngưỡng: {below.map((d) => d.name).join(', ')} — nên bổ sung món.
          </span>
        </div>
      )}
    </div>
  );
};

export default SlotCoverageChart;
