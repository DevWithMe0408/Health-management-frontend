import {
  CheckIcon,
  ChevronDownIcon,
  ForwardIcon,
} from '@heroicons/react/24/outline';
import Spinner from '../common/Spinner';
import { MEAL_TYPE_ICON, MEAL_TYPE_ICON_BG, MEAL_TYPE_LABEL } from '../../constants/mealType.constants';
import FoodRow from './FoodRow';
import MacroBar from './atoms/MacroBar';
import ScoreBadge from './atoms/ScoreBadge';
import StatusPill from './atoms/StatusPill';
import type {
  DishSuggestionResponse,
  MealSuggestionResponse,
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
  mobile?: boolean;
}

const formatNumber = (value: number) => {
  return Number.isInteger(value) ? value.toLocaleString('vi-VN') : value.toLocaleString('vi-VN', {
    maximumFractionDigits: 1,
  });
};

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
  mobile = false,
}: MealCardProps) => {
  const dishes = meal.topCombination.dishes;
  const mealName = MEAL_TYPE_LABEL[meal.mealType];
  const icon = MEAL_TYPE_ICON[meal.mealType];
  const iconBg = MEAL_TYPE_ICON_BG[meal.mealType];

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
          <div>
            {dishes.map((dish, index) => (
              <FoodRow
                key={dish.slotKey ?? `${dish.dishId}-${index}`}
                dish={dish}
                isLast={index === dishes.length - 1}
                onSwapClick={onSwapClick}
                onToggleFavorite={onToggleFavorite}
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
