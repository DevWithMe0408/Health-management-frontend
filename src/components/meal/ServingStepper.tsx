import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { formatServing } from '../../utils/format';

interface ServingStepperProps {
  name: string;
  serving: number;
  unit: string;
  baseServingG: number;
  expectedServing: number;
  onChange: (nextServing: number) => void;
}

const STEP = 0.5;
const MIN = 0.5;

/**
 * Serving stepper bound to the 0.5 grid. Max is computed as 1.5x expected
 * serving snapped DOWN to the nearest 0.5 — using Math.floor not Math.round,
 * otherwise an expected of 1.5 would yield a max of 2.25 which falls off the
 * grid and breaks the +/- buttons.
 */
const ServingStepper = ({
  name,
  serving,
  unit,
  baseServingG,
  expectedServing,
  onChange,
}: ServingStepperProps) => {
  const max = Math.floor(1.5 * expectedServing * 2) / 2;
  const atMin = serving <= MIN;
  const atMax = serving >= max;
  const grams = Math.round(serving * baseServingG);

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
            onClick={() => onChange(Math.max(MIN, serving - STEP))}
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
                {formatServing(serving)}
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
            onClick={() => onChange(Math.min(max, serving + STEP))}
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
        Bước {formatServing(STEP)} {unit} · Min {formatServing(MIN)} · Max {formatServing(max)}
      </div>
    </div>
  );
};

export default ServingStepper;
