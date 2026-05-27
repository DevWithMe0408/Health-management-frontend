import { getMacroDeviationColor } from '../../../constants/score.constants';

interface MacroColProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
}

interface MacroBarProps {
  kcal: number;
  kcalTarget: number;
  p: number;
  pTarget: number;
  f: number;
  fTarget: number;
  c: number;
  cTarget: number;
}

const formatNumber = (value: number) => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
};

const MacroCol = ({ label, value, target, unit = '' }: MacroColProps) => {
  const color = getMacroDeviationColor(value, target);
  const percentage = Math.min(100, Math.max(0, (value / Math.max(target, 1)) * 100));

  return (
    <div className="min-w-0 flex-1">
      <div className="text-[11px] font-semibold uppercase text-gray-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-bold leading-none text-gray-900 tabular-nums">
          {formatNumber(value)}
        </span>
        {unit && <span className="text-xs font-medium text-gray-500">{unit}</span>}
      </div>
      <div className="mt-1 text-[11px] text-gray-400">
        / {formatNumber(target)}
        {unit} target
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const MacroBar = ({
  kcal,
  kcalTarget,
  p,
  pTarget,
  f,
  fTarget,
  c,
  cTarget,
}: MacroBarProps) => {
  return (
    <div className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:grid-cols-4">
      <MacroCol label="Kcal" value={kcal} target={kcalTarget} />
      <MacroCol label="Protein" value={p} target={pTarget} unit="g" />
      <MacroCol label="Fat" value={f} target={fTarget} unit="g" />
      <MacroCol label="Carb" value={c} target={cTarget} unit="g" />
    </div>
  );
};

export default MacroBar;

