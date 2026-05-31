import { ArrowPathIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';
import Spinner from '../common/Spinner';
import ServingStepper from './ServingStepper';
import FoodGroupChip from './atoms/FoodGroupChip';
import FoodThumb from './atoms/FoodThumb';
import HeartButton from './atoms/HeartButton';
import SlotChip from './atoms/SlotChip';
import { formatServing } from '../../utils/format';
import type { DishSuggestionResponse } from '../../types/meal.types';

interface FoodRowProps {
  dish: DishSuggestionResponse;
  isLast: boolean;
  pinned?: boolean;
  onSwapClick: (slotKey: string, currentDish: DishSuggestionResponse) => void;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void | Promise<void>;
  onTogglePin?: (slotKey: string) => void;
  editingServing?: boolean;
  servingDraft?: number;
  onToggleServing?: () => void;
  onServingDraftChange?: (nextServing: number) => void;
  onRebalance?: () => void | Promise<void>;
  rebalanceLoading?: boolean;
}

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
  editingServing = false,
  servingDraft,
  onToggleServing,
  onServingDraftChange,
  onRebalance,
  rebalanceLoading = false,
}: FoodRowProps) => {
  const dishName = dish.dishName ?? 'Món ăn';
  const canSwap = Boolean(dish.slotKey);
  const hasUnit = Boolean(dish.unit && dish.baseServingG);

  const containerClass = [
    'py-3.5',
    isLast ? '' : 'border-b border-gray-100',
    pinned ? 'border-l-4 border-l-brand-green pl-3' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      <div className="flex items-center gap-3">
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

        <div className="flex shrink-0 items-center gap-2">
          {hasUnit && (
            <button
              type="button"
              disabled={!canSwap}
              className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                editingServing
                  ? 'border-brand-green bg-brand-green-light text-brand-green-dark hover:bg-brand-green-light'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-brand-green-dark'
              }`}
              onClick={onToggleServing}
              title="Chỉnh khẩu phần món này"
            >
              {editingServing ? (
                <MinusIcon className="h-3.5 w-3.5" />
              ) : (
                <PlusIcon className="h-3.5 w-3.5" />
              )}
              Khẩu phần
            </button>
          )}

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
      </div>

      {editingServing && hasUnit && dish.unit && dish.baseServingG && (
        <div className="ml-[72px] mt-3">
          <ServingStepper
            name={dishName}
            serving={servingDraft ?? dish.servingMultiplier}
            unit={dish.unit}
            baseServingG={dish.baseServingG}
            expectedServing={dish.servingMultiplier}
            onChange={(nextServing) => onServingDraftChange?.(nextServing)}
          />

          <div className="mt-2.5 flex items-center gap-3.5">
            <span className="min-w-0 flex-1 text-xs leading-snug text-gray-500">
              Giữ nguyên các món đã ghim, hệ thống tự cân đối khẩu phần các món còn lại.
            </span>
            <button
              type="button"
              disabled={rebalanceLoading || !onRebalance}
              onClick={onRebalance}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-green px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {rebalanceLoading ? (
                <>
                  <Spinner size={14} thin />
                  Đang cân đối...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4" />
                  Cân đối lại
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodRow;
