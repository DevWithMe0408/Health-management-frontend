import { StarIcon } from '@heroicons/react/24/solid';
import DeltaPill from './atoms/DeltaPill';
import FoodGroupChip from './atoms/FoodGroupChip';
import FoodThumb from './atoms/FoodThumb';
import HeartButton from './atoms/HeartButton';
import { formatServing } from '../../utils/format';
import type { DishOptionResponse } from '../../types/meal.types';

interface AlternateCardProps {
  option: DishOptionResponse;
  currentScore: number;
  selected: boolean;
  onSelect: () => void;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void | Promise<void>;
  mobile?: boolean;
}

const AlternateCard = ({
  option,
  currentScore,
  selected,
  onSelect,
  onToggleFavorite,
  mobile = false,
}: AlternateCardProps) => {
  // Search results have null expectedScore. Treat delta as 0 to keep DeltaPill stable,
  // but the whole score block is hidden when expectedScore is null.
  const delta = (option.expectedScore ?? 0) - currentScore;

  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-xl text-left transition ${
        mobile ? 'p-3' : 'p-3.5'
      } ${
        selected
          ? 'border-2 border-brand-green bg-brand-green-light shadow-sm shadow-emerald-700/10'
          : 'border border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
      }`}
      onClick={onSelect}
    >
      <FoodThumb name={option.dishName} foodGroup={option.foodGroupCode} size={mobile ? 52 : 56} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-900">
          {option.dishName}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <FoodGroupChip foodGroup={option.foodGroupCode} />
        </span>
        <span className="mt-2 block text-xs text-gray-500 tabular-nums">
          Khẩu phần:{' '}
          <b className="font-semibold text-gray-700">
            {option.unit
              ? `${formatServing(option.expectedServing)} ${option.unit} (${Math.round(option.expectedActualGrams)}g)`
              : `${Math.round(option.expectedActualGrams)}g`}
          </b>
        </span>
        {option.expectedScore !== null && (
          <span className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 tabular-nums">
              <StarIcon className="h-3 w-3 text-amber-500" />
              {option.expectedScore.toFixed(1)}
            </span>
            <DeltaPill value={delta} />
            <span className="text-[11px] text-gray-400">so với hiện tại</span>
          </span>
        )}
      </span>

      <span className="flex shrink-0 flex-col items-center gap-2">
        <span onClick={(event) => event.stopPropagation()}>
          <HeartButton
            dishId={option.dishId}
            favorite={option.favorite}
            onToggle={onToggleFavorite}
          />
        </span>
        <span
          aria-hidden="true"
          className={`h-4.5 w-4.5 rounded-full bg-white transition ${
            selected ? 'border-[5px] border-brand-green' : 'border-2 border-gray-300'
          }`}
        />
      </span>
    </button>
  );
};

export default AlternateCard;

