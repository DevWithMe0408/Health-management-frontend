import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { formatServing } from '../../utils/format';

interface ServingStepperProps {
  name: string;
  serving: number;
  unit: string;
  baseServingG: number;
  onChange: (nextServing: number) => void;
}

export const SERVING_STEP = 0.5;
export const MIN_SERVING = 0.5;
export const MAX_SERVING = 2.5;

export const clampServing = (value: number) => {
  return Math.min(MAX_SERVING, Math.max(MIN_SERVING, value));
};

const ServingStepper = ({
  name,
  serving,
  unit,
  baseServingG,
  onChange,
}: ServingStepperProps) => {
  const safeServing = clampServing(serving);
  const atMin = safeServing <= MIN_SERVING;
  const atMax = safeServing >= MAX_SERVING;
  const grams = Math.round(safeServing * baseServingG);

  const buttonBase =
    'grid h-9 w-9 place-items-center rounded-lg border-[1.5px] border-brand-green bg-white text-brand-green-dark';

  return (
    <div className="mb-3 rounded-xl border border-brand-green/30 bg-brand-green-light px-4 py-3.5">
      <div className="flex items-center gap-3.5">
        <div className="min-w-0 flex-1">
          <div className="text-[11.5px] font-semibold uppercase tracking-wide text-brand-green-darker">
            Khẩu phần
          </div>
          <div className="mt-0.5 truncate text-[13.5px] font-semibold text-gray-900">
            {name}
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            disabled={atMin}
            onClick={() => onChange(clampServing(safeServing - SERVING_STEP))}
            aria-label="Giảm khẩu phần"
            className={
              buttonBase +
              ' ' +
              (atMin
                ? 'cursor-not-allowed opacity-35'
                : 'cursor-pointer hover:bg-brand-green-light')
            }
          >
            <MinusIcon className="h-4 w-4" strokeWidth={2.5} />
          </button>

          <div className="mx-3 min-w-[90px] text-center">
            <div className="leading-tight">
              <span className="text-[22px] font-bold tabular-nums text-gray-900">
                {formatServing(safeServing)}
              </span>
              <span className="ml-1 text-sm font-medium text-gray-700">{unit}</span>
            </div>
            <div className="mt-0.5 text-[11.5px] tabular-nums text-gray-400">
              ≈ {grams}g
            </div>
          </div>

          <button
            type="button"
            disabled={atMax}
            onClick={() => onChange(clampServing(safeServing + SERVING_STEP))}
            aria-label="Tăng khẩu phần"
            className={
              buttonBase +
              ' ' +
              (atMax
                ? 'cursor-not-allowed opacity-35'
                : 'cursor-pointer hover:bg-brand-green-light')
            }
          >
            <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="mt-2 text-center text-xs text-gray-500">
        Bước {formatServing(SERVING_STEP)} {unit} · Min {formatServing(MIN_SERVING)} · Max{' '}
        {formatServing(MAX_SERVING)}
      </div>
    </div>
  );
};

export default ServingStepper;
