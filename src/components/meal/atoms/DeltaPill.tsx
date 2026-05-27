interface DeltaPillProps {
  value: number;
}

const DeltaPill = ({ value }: DeltaPillProps) => {
  const roundedValue = Number.isFinite(value) ? value : 0;
  const isPositive = roundedValue > 0;
  const isNegative = roundedValue < 0;
  const label = `${isPositive ? '+' : ''}${roundedValue.toFixed(1)}`;

  const className = isPositive
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : isNegative
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-gray-200 bg-gray-50 text-gray-600';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${className}`}
    >
      {label}
    </span>
  );
};

export default DeltaPill;

