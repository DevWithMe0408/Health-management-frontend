import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowPathIcon,
  LightBulbIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import AlternateCard from './AlternateCard';
import Spinner from '../common/Spinner';
import { SLOT_CODE_LABEL } from '../../constants/slotCode.constants';
import type {
  DishOptionResponse,
  DishSuggestionResponse,
  SwapSuggestion,
} from '../../types/meal.types';

interface SwapDrawerProps {
  open: boolean;
  mobile?: boolean;
  currentDish: DishSuggestionResponse;
  currentMealScore: number;
  alternatives: DishOptionResponse[];
  suggestion?: SwapSuggestion | null;
  confirmLoading: boolean;
  onClose: () => void;
  onConfirm: (newDishId: string) => void | Promise<void>;
  onToggleFavorite: (dishId: string, currentFavorite: boolean) => void | Promise<void>;
}

const formatNumber = (value: number) => {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
};

const findInitialIndex = (
  alternatives: DishOptionResponse[],
  suggestion?: SwapSuggestion | null
) => {
  if (suggestion?.suggestedDishId) {
    const suggestionIndex = alternatives.findIndex(
      (option) => option.dishId === suggestion.suggestedDishId
    );
    if (suggestionIndex >= 0) return suggestionIndex;
  }

  return alternatives.length > 0 ? 0 : -1;
};

const SwapDrawer = ({
  open,
  mobile = false,
  currentDish,
  currentMealScore,
  alternatives,
  suggestion = null,
  confirmLoading,
  onClose,
  onConfirm,
  onToggleFavorite,
}: SwapDrawerProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const currentDishName = currentDish.dishName ?? 'Món ăn';
  const selectedOption = selectedIndex >= 0 ? alternatives[selectedIndex] : null;
  const suggestionIndex = useMemo(
    () =>
      suggestion?.suggestedDishId
        ? alternatives.findIndex((option) => option.dishId === suggestion.suggestedDishId)
        : -1,
    [alternatives, suggestion?.suggestedDishId]
  );

  useEffect(() => {
    if (!open) return;
    setSelectedIndex(findInitialIndex(alternatives, suggestion));
  }, [alternatives, open, suggestion]);

  const handleConfirm = () => {
    if (!selectedOption || confirmLoading) return;
    void onConfirm(selectedOption.dishId);
  };

  const handleApplySuggestion = () => {
    if (suggestionIndex < 0) return;
    setSelectedIndex(suggestionIndex);
    void onConfirm(alternatives[suggestionIndex].dishId);
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
                  {formatNumber(currentDish.actualGrams)}g
                  <span className="mx-1.5 text-gray-300">·</span>
                  {formatNumber(currentDish.dishKcal)} kcal
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

            <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3">
              <div className="text-sm font-bold text-gray-700">
                {alternatives.length} lựa chọn thay thế
              </div>
              <div className="text-xs text-gray-400">Điểm cao → thấp</div>
            </div>

            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 pb-4">
              {alternatives.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  Không có lựa chọn thay thế phù hợp.
                </div>
              ) : (
                alternatives.map((option, index) => (
                  <AlternateCard
                    key={option.dishId}
                    option={option}
                    currentScore={currentMealScore}
                    selected={index === selectedIndex}
                    onSelect={() => setSelectedIndex(index)}
                    onToggleFavorite={onToggleFavorite}
                    mobile={mobile}
                  />
                ))
              )}
            </div>

            <footer className="shrink-0 border-t border-gray-100 bg-white px-5 py-4">
              {suggestion && (
                <div className="mb-3 flex items-center gap-3 rounded-r-xl border-l-4 border-amber-400 bg-amber-50 px-3 py-2.5">
                  <LightBulbIcon className="h-5 w-5 shrink-0 text-amber-600" />
                  <div className="min-w-0 flex-1 text-xs leading-5 text-amber-900">
                    <b>Gợi ý:</b> {suggestion.message}
                  </div>
                  <button
                    type="button"
                    disabled={suggestionIndex < 0 || confirmLoading}
                    className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleApplySuggestion}
                  >
                    Áp dụng
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={!selectedOption || confirmLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                onClick={handleConfirm}
              >
                {confirmLoading ? (
                  <>
                    <Spinner size={14} thin />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="h-4 w-4" />
                    Xác nhận đổi món
                  </>
                )}
              </button>

              {selectedOption && (
                <p className="mt-2 text-center text-xs text-gray-500">
                  Sẽ đổi <b>{currentDishName}</b> →{' '}
                  <b className="text-gray-700">{selectedOption.dishName}</b>
                </p>
              )}
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwapDrawer;

