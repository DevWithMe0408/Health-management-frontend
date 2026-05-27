import ScoreBadge from './atoms/ScoreBadge';
import { getMacroDeviationColor } from '../../constants/score.constants';

interface MacroTotals {
  kcal: number;
  p: number;
  f: number;
  c: number;
}

interface FooterSummaryProps {
  totals: MacroTotals;
  targets: MacroTotals;
  overallScore: number;
  mobile?: boolean;
}

interface SummaryColProps {
  label: string;
  value: number;
  target: number;
  unit: string;
}

interface MacroDonutProps {
  pPct: number;
  fPct: number;
  cPct: number;
  pGrams: number;
  fGrams: number;
  cGrams: number;
}

const formatNumber = (value: number) => {
  return Number.isInteger(value) ? value.toLocaleString('vi-VN') : value.toLocaleString('vi-VN', {
    maximumFractionDigits: 1,
  });
};

const SummaryCol = ({ label, value, target, unit }: SummaryColProps) => {
  const rawPercentage = (value / Math.max(target, 1)) * 100;
  const percentage = Math.min(100, Math.max(0, rawPercentage));
  const color = getMacroDeviationColor(value, target);

  return (
    <div className="min-w-0">
      <div className="text-xs font-semibold uppercase text-gray-500">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold leading-none text-gray-900 tabular-nums sm:text-3xl">
          {formatNumber(value)}
        </span>
        <span className="text-sm font-medium text-gray-500">{unit}</span>
      </div>
      <div className="mt-1 text-xs text-gray-400">
        / {formatNumber(target)}
        {unit} target
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <span className="w-10 text-right text-xs font-bold tabular-nums" style={{ color }}>
          {Math.round(rawPercentage)}%
        </span>
      </div>
    </div>
  );
};

const LegendRow = ({
  color,
  label,
  percentage,
  grams,
}: {
  color: string;
  label: string;
  percentage: number;
  grams: number;
}) => (
  <div className="flex items-center gap-2 text-xs">
    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
    <span className="min-w-14 font-medium text-gray-600">{label}</span>
    <span className="font-bold text-gray-900 tabular-nums">{percentage}%</span>
    <span className="text-gray-400 tabular-nums">· {formatNumber(grams)}g</span>
  </div>
);

const MacroDonut = ({ pPct, fPct, cPct, pGrams, fGrams, cGrams }: MacroDonutProps) => {
  const radius = 56;
  const center = 70;
  const circumference = 2 * Math.PI * radius;
  const arcs = [
    { percentage: pPct, color: '#10b981', offsetPct: 0 },
    { percentage: fPct, color: '#f59e0b', offsetPct: pPct },
    { percentage: cPct, color: '#3b82f6', offsetPct: pPct + fPct },
  ];

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[140px] w-[140px] shrink-0">
        <svg width="140" height="140" className="-rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#f3f4f6" strokeWidth="14" />
          {arcs.map((arc) => {
            const dash = (arc.percentage / 100) * circumference;
            const gap = circumference - dash;
            const offset = -((arc.offsetPct / 100) * circumference);

            return (
              <circle
                key={arc.color}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-xs font-semibold uppercase text-gray-500">Phân bổ</div>
            <div className="mt-1 text-base font-bold text-gray-900">P/F/C</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <LegendRow color="#10b981" label="Protein" percentage={pPct} grams={pGrams} />
        <LegendRow color="#f59e0b" label="Fat" percentage={fPct} grams={fGrams} />
        <LegendRow color="#3b82f6" label="Carb" percentage={cPct} grams={cGrams} />
        <div className="mt-1 border-t border-dashed border-gray-200 pt-2 text-[11px] leading-5 text-gray-400">
          Tính theo % calo (P*4 · F*9 · C*4)
        </div>
      </div>
    </div>
  );
};

const FooterSummary = ({ totals, targets, overallScore, mobile = false }: FooterSummaryProps) => {
  const proteinKcal = totals.p * 4;
  const fatKcal = totals.f * 9;
  const carbKcal = totals.c * 4;
  const macroKcal = Math.max(1, proteinKcal + fatKcal + carbKcal);
  const pPct = Math.round((proteinKcal / macroKcal) * 100);
  const fPct = Math.round((fatKcal / macroKcal) * 100);
  const cPct = Math.max(0, 100 - pPct - fPct);

  return (
    <section
      aria-label="Tổng dinh dưỡng cả ngày"
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${mobile ? 'p-4' : 'p-6'}`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Tổng dinh dưỡng cả ngày</h3>
          <p className="mt-1 text-sm text-gray-500">
            Tính từ các bữa đã ăn và bữa đề xuất còn lại
          </p>
        </div>
        <ScoreBadge score={overallScore} />
      </div>

      <div className={`grid items-center gap-6 ${mobile ? 'grid-cols-1' : 'lg:grid-cols-[1fr_300px]'}`}>
        <div className="grid gap-5 sm:grid-cols-2">
          <SummaryCol label="Tổng Kcal" value={totals.kcal} target={targets.kcal} unit="kcal" />
          <SummaryCol label="Protein" value={totals.p} target={targets.p} unit="g" />
          <SummaryCol label="Fat" value={totals.f} target={targets.f} unit="g" />
          <SummaryCol label="Carb" value={totals.c} target={targets.c} unit="g" />
        </div>

        <div className="flex justify-center lg:justify-end">
          <MacroDonut
            pPct={pPct}
            fPct={fPct}
            cPct={cPct}
            pGrams={totals.p}
            fGrams={totals.f}
            cGrams={totals.c}
          />
        </div>
      </div>
    </section>
  );
};

export default FooterSummary;

