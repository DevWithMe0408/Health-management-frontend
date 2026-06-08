import React from 'react';
import DashboardCard from './DashboardCard';
import type { RoadmapMode } from '../../utils/roadmap';

type RoadmapState = 'normal' | 'incomplete' | 'loading';

interface RecommendationRoadmapProps {
  state?: RoadmapState;
  mode?: RoadmapMode;
  current?: number;
  low?: number;
  high?: number;
  delta?: number;
  speed?: string;
  time?: string;
  pbf?: number | null;
  missing?: string[];
  onSetTarget?: () => void;
  onUpdate?: () => void;
}

interface ModeMeta {
  label: string;
  color: string;
  softClass: string;
  borderClass: string;
  textClass: string;
  verb: string;
  direction: 'down' | 'up' | 'check' | 'recomp';
}

const metaByMode: Record<RoadmapMode, ModeMeta> = {
  GIAM: {
    label: 'GIẢM',
    color: '#ea580c',
    softClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    textClass: 'text-orange-700',
    verb: 'Cần giảm',
    direction: 'down',
  },
  TANG: {
    label: 'TĂNG',
    color: '#2563eb',
    softClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-700',
    verb: 'Cần tăng',
    direction: 'up',
  },
  DUY_TRI: {
    label: 'DUY TRÌ',
    color: '#059669',
    softClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    textClass: 'text-brand-green-darker',
    verb: 'Duy trì',
    direction: 'check',
  },
  DAC_BIET: {
    label: 'GIẢM MỠ',
    color: '#7c3aed',
    softClass: 'bg-violet-50',
    borderClass: 'border-violet-200',
    textClass: 'text-violet-700',
    verb: 'Tái cấu trúc',
    direction: 'recomp',
  },
};

const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value));

const formatKg = (value: number) => value.toFixed(1);

const DirectionGlyph: React.FC<{
  direction: ModeMeta['direction'];
  color: string;
}> = ({ direction, color }) => {
  if (direction === 'check') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 12.5l4 4L19 7"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (direction === 'recomp') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 9a8 8 0 0113.5-4M20 15a8 8 0 01-13.5 4"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M17.5 2.5V6H14M6.5 21.5V18H10"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const path =
    direction === 'down'
      ? 'M12 5v14M6 13l6 6 6-6'
      : 'M12 19V5M6 11l6-6 6 6';

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const WeightRuler: React.FC<{
  low: number;
  high: number;
  current: number;
  mode: RoadmapMode;
}> = ({ low, high, current, mode }) => {
  const min = Math.floor(Math.min(low, current) - 6);
  const max = Math.ceil(Math.max(high, current) + 6);
  const span = max - min || 1;
  const percent = (value: number) => ((clamp(value, min, max) - min) / span) * 100;
  const currentPercent = percent(current);
  const lowPercent = percent(low);
  const highPercent = percent(high);
  const insideHealthyRange = current >= low && current <= high;
  const nearestEdge = current > high ? high : current < low ? low : current;
  const nearestEdgePercent = percent(nearestEdge);
  const gapLeft = Math.min(currentPercent, nearestEdgePercent);
  const gapWidth = Math.abs(currentPercent - nearestEdgePercent);
  const meta = metaByMode[mode];

  return (
    <div className="mt-5">
      <div className="relative h-7">
        <div
          className="absolute rounded-md bg-gray-900 px-2 py-1 text-[11px] font-bold text-white shadow-sm"
          style={{
            left: `${currentPercent}%`,
            transform: 'translateX(-50%)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatKg(current)} kg
          <span
            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-900"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="relative h-3 rounded-full border border-gray-200 bg-gray-100">
        <div
          className="absolute inset-y-0 border-x-2 border-brand-green bg-emerald-100"
          style={{
            left: `${lowPercent}%`,
            width: `${Math.max(0, highPercent - lowPercent)}%`,
            backgroundImage:
              'repeating-linear-gradient(45deg, #bbf7d0, #bbf7d0 6px, #dcfce7 6px, #dcfce7 12px)',
          }}
        />
        {!insideHealthyRange && gapWidth > 0.5 && (
          <div
            className="absolute inset-y-0"
            style={{
              left: `${gapLeft}%`,
              width: `${gapWidth}%`,
              background: meta.color,
              opacity: 0.32,
            }}
          />
        )}
        <div
          className="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3.5px] bg-white shadow-sm"
          style={{
            left: `${currentPercent}%`,
            borderColor: insideHealthyRange ? '#059669' : meta.color,
          }}
        />
      </div>

      <div
        className="mt-2 flex justify-between text-[11px] font-medium text-gray-500"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        <span>{min}</span>
        <span className="font-bold text-brand-green">
          {formatKg(low)}-{formatKg(high)} kg cân đối
        </span>
        <span>{max}</span>
      </div>
    </div>
  );
};

const StatTile: React.FC<{
  label: string;
  value: string;
  unit?: string;
  caption?: string;
  accent?: string;
}> = ({ label, value, unit, caption, accent }) => (
  <div className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500">
      {label}
    </div>
    <div
      className="mt-1 text-lg font-extrabold leading-tight text-gray-900"
      style={{ color: accent, fontVariantNumeric: 'tabular-nums' }}
    >
      {value}
      {unit && <span className="ml-1 text-xs font-semibold text-gray-500">{unit}</span>}
    </div>
    {caption && <p className="mt-1.5 text-[11px] leading-5 text-gray-500">{caption}</p>}
  </div>
);

const TargetButton: React.FC<{
  mode: RoadmapMode;
  onClick?: () => void;
}> = ({ mode, onClick }) => {
  const meta = metaByMode[mode];
  const label =
    mode === 'DAC_BIET'
      ? 'Đặt mục tiêu giảm mỡ'
      : mode === 'DUY_TRI'
        ? 'Dùng duy trì làm mục tiêu'
        : 'Dùng mức này làm mục tiêu';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50 ${meta.borderClass} ${meta.textClass}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      </svg>
      {label}
    </button>
  );
};

const RoadmapLoading: React.FC = () => (
  <DashboardCard title="Lộ trình khuyến nghị">
    <div className="flex gap-4">
      <div className="h-14 w-14 animate-db-shimmer rounded-2xl bg-gray-100" />
      <div className="flex-1">
        <div className="h-3.5 w-28 animate-db-shimmer rounded bg-gray-100" />
        <div className="mt-2 h-7 w-40 animate-db-shimmer rounded bg-gray-100" />
        <div className="mt-2 h-3.5 w-52 animate-db-shimmer rounded bg-gray-100" />
      </div>
    </div>
    <div className="mt-7 h-3 animate-db-shimmer rounded-full bg-gray-100" />
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="h-20 animate-db-shimmer rounded-xl bg-gray-100" />
      <div className="h-20 animate-db-shimmer rounded-xl bg-gray-100" />
    </div>
  </DashboardCard>
);

const RoadmapIncomplete: React.FC<{
  missing: string[];
  onUpdate?: () => void;
}> = ({ missing, onUpdate }) => (
  <DashboardCard title="Lộ trình khuyến nghị">
    <div className="flex items-start gap-4">
      <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-gray-100 text-gray-500">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base font-bold text-gray-900">Chưa tính được lộ trình</div>
        <p className="mt-1.5 text-sm leading-6 text-gray-600">
          Cần thêm dữ liệu để ước lượng tốc độ và thời gian an toàn cho bạn.
        </p>
      </div>
    </div>

    <div className="mt-4 space-y-2">
      {missing.map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-700"
        >
          <span className="h-[18px] w-[18px] rounded-full border-2 border-dashed border-gray-400" />
          <span className="min-w-0 flex-1">
            Thiếu <b>{item}</b>
          </span>
          <span className="text-xs text-gray-500">chưa có</span>
        </div>
      ))}
    </div>

    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 sm:flex-row sm:items-center">
      <span className="flex-1">Cập nhật chỉ số để mở khóa lộ trình cá nhân hóa.</span>
      <button
        type="button"
        onClick={onUpdate}
        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
      >
        Cập nhật chỉ số
      </button>
    </div>
  </DashboardCard>
);

const RecommendationRoadmap: React.FC<RecommendationRoadmapProps> = ({
  state = 'normal',
  mode = 'GIAM',
  current = 75,
  low = 53.5,
  high = 66.5,
  delta = 8.5,
  speed = '0.3-0.5',
  time = '4-6 tháng',
  pbf = null,
  missing = ['TDEE'],
  onSetTarget,
  onUpdate,
}) => {
  if (state === 'loading') return <RoadmapLoading />;
  if (state === 'incomplete') {
    return <RoadmapIncomplete missing={missing} onUpdate={onUpdate} />;
  }

  const meta = metaByMode[mode];
  const showJourney = mode === 'GIAM' || mode === 'TANG';

  return (
    <DashboardCard
      title="Lộ trình khuyến nghị"
      info="Dựa trên thể trạng và TDEE. Mục tiêu là dải cân đối, không phải một con số tuyệt đối."
    >
      <div className="flex items-start gap-4">
        <div
          className={`grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl border ${meta.softClass} ${meta.borderClass}`}
        >
          <DirectionGlyph direction={meta.direction} color={meta.color} />
        </div>

        <div className="min-w-0 flex-1">
          {showJourney ? (
            <>
              <div className="text-sm font-medium text-gray-500">{meta.verb} khoảng</div>
              <div
                className={`mt-0.5 text-3xl font-extrabold leading-none tracking-tight ${meta.textClass}`}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                ~{formatKg(delta)} kg
              </div>
              <p className="mt-1.5 text-sm text-gray-600">
                để chạm ngưỡng cân đối gần nhất
              </p>
            </>
          ) : (
            <>
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${meta.softClass} ${meta.borderClass} ${meta.textClass}`}
              >
                {mode === 'DUY_TRI' ? 'Đã cân đối' : 'Cân nặng ổn, mỡ cao'}
              </span>
              <p className="mt-2 text-base font-bold leading-6 text-gray-900">
                {mode === 'DUY_TRI'
                  ? 'Bạn đang ở vùng cân đối, hãy tiếp tục duy trì'
                  : 'Ưu tiên giảm mỡ và giữ khối cơ thay vì ép số cân giảm nhanh'}
              </p>
            </>
          )}
        </div>
      </div>

      <WeightRuler low={low} high={high} current={current} mode={mode} />

      {showJourney && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatTile
              label="Tốc độ dự kiến"
              value={`khoảng ${speed}`}
              unit="kg/tuần"
              accent={meta.color}
            />
            <StatTile
              label="Thời gian dự kiến"
              value={time}
              caption="Ước lượng ban đầu, tốc độ sẽ chậm dần"
            />
          </div>
          {mode === 'TANG' && (
            <p className="mt-3 text-xs leading-5 text-gray-500">
              Tăng cân hiệu quả nhất khi kết hợp tập kháng lực và theo dõi đều.
            </p>
          )}
        </>
      )}

      {mode === 'DUY_TRI' && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-brand-green-darker">
          Giữ thực đơn cân bằng và vận động đều, chưa cần tăng hoặc giảm cân.
        </div>
      )}

      {mode === 'DAC_BIET' && (
        <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-700">
          Không đặt mục tiêu theo số cân. Trọng tâm là <b>giảm mỡ và giữ khối cơ</b>.
          {pbf != null && (
            <span className="mt-1.5 block font-semibold">
              PBF hiện tại {pbf.toFixed(1)}%.
            </span>
          )}
        </div>
      )}

      <TargetButton mode={mode} onClick={onSetTarget} />
    </DashboardCard>
  );
};

export default RecommendationRoadmap;
