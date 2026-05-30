import { XMarkIcon } from '@heroicons/react/24/outline';
import FoodThumb from './atoms/FoodThumb';
import { formatServing } from '../../utils/format';
import type { FoodGroup } from '../../types/meal.types';

export interface PinnedItem {
  slotKey: string;
  dishId: string;
  dishName: string;
  foodGroup: FoodGroup;
  serving: number;
  unit: string;
  grams: number;
}

interface PinnedStripProps {
  pins: PinnedItem[];
  onUnpin: (slotKey: string) => void;
  mobile?: boolean;
}

/**
 * Horizontal strip rendered inside the swap drawer showing the dishes that are
 * pinned in OTHER slots of the same meal. The pinned dish of the currently
 * open slot is intentionally excluded by the caller.
 */
const PinnedStrip = ({ pins, onUnpin, mobile = false }: PinnedStripProps) => {
  if (pins.length === 0) return null;

  const wrapperClass = [
    'border-b border-gray-100 bg-brand-green-light',
    mobile ? 'px-[18px] py-2.5' : 'px-[22px] py-3',
  ].join(' ');

  return (
    <div className={wrapperClass}>
      <div className="text-[11.5px] font-semibold uppercase tracking-wide text-gray-500">
        Đang ghim · sẽ giữ nguyên khi áp dụng
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5">
        {pins.map((pin) => (
          <div
            key={pin.slotKey}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5"
          >
            <FoodThumb name={pin.dishName} foodGroup={pin.foodGroup} size={28} />
            <div className="min-w-0">
              <div className="max-w-[120px] truncate text-[13px] font-semibold text-gray-800">
                {pin.dishName}
              </div>
              <div className="text-[11.5px] tabular-nums text-gray-500">
                {formatServing(pin.serving)} {pin.unit} ({pin.grams}g)
              </div>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onUnpin(pin.slotKey);
              }}
              aria-label="Bỏ ghim"
              title="Bỏ ghim"
              className="shrink-0 p-0.5 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-[14px] w-[14px]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinnedStrip;
