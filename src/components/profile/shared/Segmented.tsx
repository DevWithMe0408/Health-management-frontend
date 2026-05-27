interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  columns?: number;
}

const Segmented = <T extends string>({
  options,
  value,
  onChange,
  disabled,
  columns,
}: SegmentedProps<T>) => (
  <div
    className="grid gap-2"
    style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
  >
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
            selected
              ? 'border-brand-green bg-brand-green-light text-brand-green-darker'
              : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default Segmented;
