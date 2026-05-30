import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import AlternateCard from './AlternateCard';
import PinnedStrip from './PinnedStrip';
import type { PinnedItem } from './PinnedStrip';
import SearchBar from './SearchBar';
import ServingStepper from './ServingStepper';
import Spinner from '../common/Spinner';
import { SLOT_CODE_LABEL } from '../../constants/slotCode.constants';
import { searchDishes } from '../../services/dish.service';
import { formatServing } from '../../utils/format';
import type {
  DishOptionResponse,
  DishSuggestionResponse,
  SwapSuggestion,
  WarningResponse,
} from '../../types/meal.types';

interface SwapDrawerProps {
  open: boolean;
  mobile?: boolean;
  currentDish: DishSuggestionResponse;
  currentMealScore: number;
  // Used by the search endpoint to snap expectedServing toward the slot's
  // calorie budget. Falls back to the current dish kcal as a proxy.
  slotKcalTarget?: number;
  alternatives: DishOptionResponse[];
  // Optional auto-selection target on open.
  suggestion?: SwapSuggestion | null;
  // Pinned dishes from OTHER slots of the same meal. The caller is
  // responsible for excluding the slot that is currently being swapped.
  pins?: PinnedItem[];
  // Display string "X + Y" for the kept dishes in the apply caption.
  keepDishNames?: string;
  confirmLoading: boolean;
  warning?: WarningResponse | null;
  onClose: () => void;
  onConfirm: (newDishId: string, overrideGrams: number) => void | Promise<void>;
  onUnpin?: (slotKey: string) => void;
  // Called when the user picks "Điều chỉnh lại" inside the warning banner.
  // The page should clear the warning state but keep the drawer open.
  onDismissWarning?: () => void;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void | Promise<void>;
}

const formatKcal = (value: number) =>
  Number.isInteger(value) ? value.toString() : value.toFixed(1);

const findInitialDishId = (
  options: DishOptionResponse[],
  suggestion?: SwapSuggestion | null
): string | null => {
  if (suggestion?.suggestedDishId) {
    const target = options.find((option) => option.dishId === suggestion.suggestedDishId);
    if (target) return target.dishId;
  }
  return options[0]?.dishId ?? null;
};

const SwapDrawer = ({
  open,
  mobile = false,
  currentDish,
  currentMealScore,
  slotKcalTarget,
  alternatives,
  suggestion = null,
  pins = [],
  keepDishNames = '',
  confirmLoading,
  warning = null,
  onClose,
  onConfirm,
  onUnpin,
  onDismissWarning,
  onToggleFavorite,
}: SwapDrawerProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DishOptionResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [serving, setServing] = useState(0);

  const currentDishName = currentDish.dishName ?? 'Món ăn';
  const effectiveSlotKcalTarget = slotKcalTarget ?? currentDish.dishKcal;

  // Reset internal state when the drawer closes so the next open starts fresh.
  useEffect(() => {
    if (open) return;
    setQuery('');
    setDebouncedQuery('');
    setSearchResults([]);
    setSearchLoading(false);
    setSelectedDishId(null);
    setServing(0);
  }, [open]);

  // Pick the initial option (suggestion-aware) every time the drawer opens or
  // the alternative list refreshes for a different slot. The serving stepper
  // is seeded from the picked option's expectedServing.
  useEffect(() => {
    if (!open) return;
    const initialId = findInitialDishId(alternatives, suggestion);
    setSelectedDishId(initialId);
    const initialOption = alternatives.find((option) => option.dishId === initialId);
    if (initialOption) setServing(initialOption.expectedServing);
  }, [open, alternatives, suggestion]);

  // Debounce the search query.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  // Fetch search results whenever the debounced query changes.
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    searchDishes({
      slotCode: currentDish.slotCode,
      q: debouncedQuery,
      slotKcalTarget: effectiveSlotKcalTarget,
    })
      .then((results) => {
        if (!cancelled) setSearchResults(results);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, currentDish.slotCode, effectiveSlotKcalTarget]);

  const displayList = debouncedQuery ? searchResults : alternatives;
  const selectedOption = displayList.find((option) => option.dishId === selectedDishId) ?? null;
  const canApply =
    Boolean(selectedOption) && Boolean(selectedOption?.baseServingG) && !confirmLoading;

  const handleSelect = (option: DishOptionResponse) => {
    setSelectedDishId(option.dishId);
    setServing(option.expectedServing);
  };

  const handleConfirm = () => {
    if (!selectedOption?.baseServingG || confirmLoading) return;
    const overrideGrams = Math.round(serving * selectedOption.baseServingG);
    void onConfirm(selectedOption.dishId, overrideGrams);
  };

  const panelClass = mobile
    ? 'fixed inset-x-0 bottom-0 flex max-h-[75dvh] flex-col rounded-t-2xl bg-white shadow-2xl'
    : 'fixed bottom-0 right-0 top-0 flex w-full max-w-[480px] flex-col bg-white shadow-2xl';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Đổi món"
            className={panelClass}
            initial={mobile ? { y: '100%' } : { x: 480 }}
            animate={mobile ? { y: 0 } : { x: 0 }}
            exit={mobile ? { y: '100%' } : { x: 480 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {mobile && (
              <div className="flex shrink-0 justify-center pt-2.5">
                <span className="h-1 w-10 rounded-full bg-gray-200" />
              </div>
            )}

            <header className="flex shrink-0 items-start gap-3 border-b border-gray-100 px-5 py-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-900">
                  Đổi món:{' '}
                  <span className="text-brand-green-dark">
                    {SLOT_CODE_LABEL[currentDish.slotCode]}
                  </span>
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Đang là:{' '}
                  <b className="font-semibold text-gray-700">{currentDishName}</b>
                  <span className="mx-1.5 text-gray-300">·</span>
                  {Math.round(currentDish.actualGrams)}g
                  <span className="mx-1.5 text-gray-300">·</span>
                  {formatKcal(currentDish.dishKcal)} kcal
                </p>
              </div>

              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-500 transition hover:bg-gray-100"
                aria-label="Đóng"
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </header>

            {onUnpin && <PinnedStrip pins={pins} onUnpin={onUnpin} mobile={mobile} />}

            <SearchBar value={query} onChange={setQuery} mobile={mobile} />

            <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-2">
              <div className="text-sm font-bold text-gray-700">
                {debouncedQuery
                  ? `${displayList.length} kết quả cho "${debouncedQuery}"`
                  : `${displayList.length} lựa chọn thay thế`}
              </div>
              {!debouncedQuery && (
                <div className="text-xs text-gray-400">Điểm cao → thấp</div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-4">
              {searchLoading ? (
                <div className="grid place-items-center py-10">
                  <Spinner size={20} />
                </div>
              ) : displayList.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-5 py-10 text-center">
                  <MagnifyingGlassIcon className="h-10 w-10 text-gray-300" />
                  <div className="text-sm text-gray-500">
                    {debouncedQuery
                      ? `Không tìm thấy món nào với "${debouncedQuery}"`
                      : 'Không có lựa chọn thay thế phù hợp.'}
                  </div>
                  {debouncedQuery && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Xoá tìm kiếm
                    </button>
                  )}
                </div>
              ) : (
                displayList.map((option) => (
                  <AlternateCard
                    key={option.dishId}
                    option={option}
                    currentScore={currentMealScore}
                    selected={option.dishId === selectedDishId}
                    onSelect={() => handleSelect(option)}
                    onToggleFavorite={onToggleFavorite}
                    mobile={mobile}
                  />
                ))
              )}
            </div>

            <footer className="shrink-0 border-t border-gray-100 bg-white px-5 py-4">
              {selectedOption && selectedOption.unit && selectedOption.baseServingG && (
                <ServingStepper
                  name={selectedOption.dishName}
                  serving={serving}
                  unit={selectedOption.unit}
                  baseServingG={selectedOption.baseServingG}
                  expectedServing={selectedOption.expectedServing}
                  onChange={setServing}
                />
              )}

              {warning ? (
                <div className="flex items-start gap-2.5 rounded-r-lg border-l-4 border-amber-500 bg-amber-50 px-3 py-2.5">
                  <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-600" />
                  <div className="min-w-0 flex-1 text-[12.5px] leading-snug text-amber-900">
                    {warning.message}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-amber-500 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-50"
                    >
                      Vẫn áp dụng
                    </button>
                    {onDismissWarning && (
                      <button
                        type="button"
                        onClick={onDismissWarning}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
                      >
                        Điều chỉnh lại
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={!canApply}
                    onClick={handleConfirm}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                  >
                    {confirmLoading ? (
                      <>
                        <Spinner size={14} thin />
                        Đang cân đối...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4" />
                        Áp dụng & cân đối lại bữa
                      </>
                    )}
                  </button>

                  {selectedOption && keepDishNames && (
                    <p className="mt-2 text-center text-xs leading-snug text-gray-500">
                      Giữ nguyên <b className="text-gray-700">{keepDishNames}</b>, hệ thống tự cân đối khẩu phần
                    </p>
                  )}

                  {selectedOption && !keepDishNames && (
                    <p className="mt-2 text-center text-xs text-gray-500 tabular-nums">
                      Khẩu phần áp dụng:{' '}
                      <b className="text-gray-700">
                        {selectedOption.unit && selectedOption.baseServingG
                          ? `${formatServing(serving)} ${selectedOption.unit} (${Math.round(serving * selectedOption.baseServingG)}g)`
                          : `${Math.round(selectedOption.expectedActualGrams)}g`}
                      </b>
                    </p>
                  )}
                </>
              )}
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwapDrawer;
