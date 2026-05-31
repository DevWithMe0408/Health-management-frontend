import { useState } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  ForwardIcon,
  LightBulbIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';
import Spinner from '../common/Spinner';
import { MEAL_TYPE_ICON, MEAL_TYPE_ICON_BG, MEAL_TYPE_LABEL } from '../../constants/mealType.constants';
import FoodRow from './FoodRow';
import MacroBar from './atoms/MacroBar';
import ScoreBadge from './atoms/ScoreBadge';
import StatusPill from './atoms/StatusPill';
import type {
  DishSuggestionResponse,
  MealSuggestionResponse,
  MealType,
  SwapSuggestion,
  UIMealStatus,
} from '../../types/meal.types';

interface MealCardProps {
  meal: MealSuggestionResponse;
  status: UIMealStatus;
  expanded: boolean;
  score: number;
  confirmLoading: boolean;
  onToggleExpand: () => void;
  onSwapClick: (slotKey: string, currentDish: DishSuggestionResponse) => void;
  onConfirm: () => void;
  onSkip: () => void;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void | Promise<void>;
  onRebalanceServing?: (
    mealType: MealType,
    dish: DishSuggestionResponse,
    draftServing: number
  ) => void | Promise<void>;
  // Pin state for this meal. Optional so existing call sites keep working
  // before MealRecommendationPage wires the full state in Step 9.
  pinnedSlotKeys?: Set<string>;
  onTogglePin?: (slotKey: string) => void;
  // Suggestion banner rendered above the food list after a swap.
  suggestion?: SwapSuggestion | null;
  onApplySuggestion?: (suggestion: SwapSuggestion) => void;
  onDismissSuggestion?: () => void;
  mobile?: boolean;
}

const formatNumber = (value: number) => {
  return Number.isInteger(value) ? value.toLocaleString('vi-VN') : value.toLocaleString('vi-VN', {
    maximumFractionDigits: 1,
  });
};

const EMPTY_PINNED_SLOTS: Set<string> = new Set();

const MealCard = ({
  meal,
  status,
  expanded,
  score,
  confirmLoading,
  onToggleExpand,
  onSwapClick,
  onConfirm,
  onSkip,
  onToggleFavorite,
  onRebalanceServing,
  pinnedSlotKeys = EMPTY_PINNED_SLOTS,
  onTogglePin,
  suggestion = null,
  onApplySuggestion,
  onDismissSuggestion,
  mobile = false,
}: MealCardProps) => {
  const dishes = meal.topCombination.dishes;
  const mealName = MEAL_TYPE_LABEL[meal.mealType];
  const icon = MEAL_TYPE_ICON[meal.mealType];
  const iconBg = MEAL_TYPE_ICON_BG[meal.mealType];
  const pinnedCount = pinnedSlotKeys.size;
  const [editingSlotKey, setEditingSlotKey] = useState<string | null>(null);
  const [servingDraft, setServingDraft] = useState(0);
  const [rebalancingSlotKey, setRebalancingSlotKey] = useState<string | null>(null);

  const handleToggleServing = (dish: DishSuggestionResponse) => {
    if (!dish.slotKey) return;
    if (editingSlotKey === dish.slotKey) {
      setEditingSlotKey(null);
      return;
    }
    setServingDraft(dish.servingMultiplier);
    setEditingSlotKey(dish.slotKey);
  };

  const handleRebalanceServing = async (dish: DishSuggestionResponse) => {
    if (!dish.slotKey || !onRebalanceServing) return;

    setRebalancingSlotKey(dish.slotKey);
    try {
      await onRebalanceServing(meal.mealType, dish, servingDraft);
      setEditingSlotKey(null);
    } finally {
      setRebalancingSlotKey(null);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <header
        className={`flex flex-wrap items-center gap-3 border-gray-100 ${
          expanded ? 'border-b' : ''
        } ${mobile ? 'p-4' : 'p-5'}`}
      >
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={onToggleExpand}
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl"
            style={{ backgroundColor: iconBg }}
            aria-hidden="true"
          >
            {icon}
          </span>

          <span className="min-w-0">
            <span className="block truncate text-lg font-bold text-gray-900">{mealName}</span>
            <span className="mt-0.5 block text-xs text-gray-500">
              Target:{' '}
              <b className="font-semibold text-gray-700">
                {formatNumber(meal.mealKcalTarget)} kcal
              </b>
            </span>
          </span>
        </button>

        {status !== 'suggested' && <StatusPill status={status} />}

        {pinnedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-green-light px-3 py-[5px] text-[12.5px] font-semibold text-brand-green-darker ring-1 ring-brand-green/30">
            <MapPinIcon className="h-3 w-3" />
            {pinnedCount} món đã ghim
          </span>
        )}

        <div className="flex items-center gap-2">
          <ScoreBadge score={score} />
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50"
            onClick={onToggleExpand}
            aria-label={expanded ? 'Thu gọn bữa ăn' : 'Mở rộng bữa ăn'}
          >
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </header>

      {!expanded && (
        <div className="bg-gray-50 px-5 py-3 text-sm text-gray-600">
          <span className="line-clamp-2">
            {dishes.map((dish) => dish.dishName ?? 'Món ăn').join(' · ')}
            <span className="mx-2 text-gray-300">—</span>
            <b className="font-semibold text-gray-800 tabular-nums">
              {formatNumber(meal.topCombination.totalKcal)} kcal
            </b>
          </span>
        </div>
      )}

      {expanded && (
        <div className={mobile ? 'px-4 pb-4' : 'px-5 pb-5'}>
          {suggestion && (
            <div className="mx-1 mb-4 mt-1 flex items-center gap-2.5 rounded-r-lg border-l-4 border-amber-500 bg-amber-50 px-3.5 py-3">
              <LightBulbIcon className="h-5 w-5 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1 text-[12.5px] leading-snug text-amber-900">
                <b>Gợi ý:</b> {suggestion.message}
              </div>
              {onApplySuggestion && (
                <button
                  type="button"
                  onClick={() => onApplySuggestion(suggestion)}
                  className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-600"
                >
                  Áp dụng gợi ý
                </button>
              )}
              {onDismissSuggestion && (
                <button
                  type="button"
                  onClick={onDismissSuggestion}
                  title="Bỏ qua gợi ý"
                  aria-label="Bỏ qua gợi ý"
                  className="shrink-0 p-0.5 text-amber-900 opacity-50 transition hover:opacity-100"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          <div>
            {dishes.map((dish, index) => (
              <FoodRow
                key={dish.slotKey ?? `${dish.dishId}-${index}`}
                dish={dish}
                isLast={index === dishes.length - 1}
                pinned={dish.slotKey ? pinnedSlotKeys.has(dish.slotKey) : false}
                onSwapClick={onSwapClick}
                onToggleFavorite={onToggleFavorite}
                onTogglePin={onTogglePin}
                editingServing={editingSlotKey === dish.slotKey}
                servingDraft={editingSlotKey === dish.slotKey ? servingDraft : undefined}
                onToggleServing={() => handleToggleServing(dish)}
                onServingDraftChange={setServingDraft}
                onRebalance={
                  onRebalanceServing ? () => void handleRebalanceServing(dish) : undefined
                }
                rebalanceLoading={rebalancingSlotKey === dish.slotKey}
              />
            ))}
          </div>

          <div className="mt-4">
            <MacroBar
              kcal={meal.topCombination.totalKcal}
              kcalTarget={meal.mealKcalTarget}
              p={meal.topCombination.totalProtein}
              pTarget={meal.proteinTarget}
              f={meal.topCombination.totalFat}
              fTarget={meal.fatTarget}
              c={meal.topCombination.totalCarb}
              cTarget={meal.carbTarget}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={confirmLoading || status === 'skipped'}
              onClick={onSkip}
            >
              <ForwardIcon className="h-4 w-4" />
              Bỏ qua
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-70"
              disabled={confirmLoading || status === 'eaten'}
              onClick={onConfirm}
            >
              {confirmLoading ? (
                <>
                  <Spinner size={14} thin />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Đánh dấu đã ăn
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default MealCard;
