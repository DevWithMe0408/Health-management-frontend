import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';
import FoodGroupChip from './atoms/FoodGroupChip';
import FoodThumb from './atoms/FoodThumb';
import HeartButton from './atoms/HeartButton';
import SlotChip from './atoms/SlotChip';
import type { DishSuggestionResponse } from '../../types/meal.types';

interface FoodRowProps {
  dish: DishSuggestionResponse;
  isLast: boolean;
  pinned?: boolean;
  onSwapClick: (slotKey: string, currentDish: DishSuggestionResponse) => void;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void | Promise<void>;
  onTogglePin?: (slotKey: string) => void;
}

// Keep non-half serving steps (e.g. 0.75) accurate when rendered.
const formatServing = (value: number) => {
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2).replace(/\.?0+$/, '');
};

const formatKcal = (value: number) => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
};

const FoodRow = ({
  dish,
  isLast,
  pinned = false,
  onSwapClick,
  onToggleFavorite,
  onTogglePin,
}: FoodRowProps) => {
  const dishName = dish.dishName ?? 'Món ăn';
  const canSwap = Boolean(dish.slotKey);
  const hasUnit = Boolean(dish.unit && dish.baseServingG);

  const containerClass = [
    'flex items-center gap-3 py-3.5',
    isLast ? '' : 'border-b border-gray-100',
    pinned ? 'border-l-4 border-l-brand-green pl-3' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      <FoodThumb name={dishName} foodGroup={dish.foodGroupCode} size={60} />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-gray-900 sm:text-[15px]">
            {dishName}
          </span>
          <HeartButton
            dishId={dish.dishId}
            favorite={dish.favorite}
            onToggle={onToggleFavorite}
          />
          {pinned && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (dish.slotKey && onTogglePin) onTogglePin(dish.slotKey);
              }}
              title="Đã ghim - bấm để bỏ ghim"
              aria-label="Bỏ ghim món này"
              className="grid h-[22px] w-[22px] shrink-0 cursor-pointer place-items-center rounded-md border border-brand-green bg-brand-green-light text-brand-green-dark transition hover:bg-brand-green hover:text-white"
            >
              <MapPinIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <SlotChip slotCode={dish.slotCode} />
          <FoodGroupChip foodGroup={dish.foodGroupCode} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 tabular-nums">
          <span>
            <b className="font-semibold text-gray-700">
              {hasUnit
                ? `${formatServing(dish.servingMultiplier)} ${dish.unit} (${Math.round(dish.actualGrams)}g)`
                : `${Math.round(dish.actualGrams)}g`}
            </b>
          </span>
          <span className="text-gray-300">·</span>
          <span>
            <b className="font-semibold text-gray-700">{formatKcal(dish.dishKcal)} kcal</b>
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={!canSwap}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => dish.slotKey && onSwapClick(dish.slotKey, dish)}
      >
        <ArrowPathIcon className="h-3.5 w-3.5" />
        Đổi món
      </button>
    </div>
  );
};

export default FoodRow;
