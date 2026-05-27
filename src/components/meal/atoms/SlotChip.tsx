import { SLOT_CODE_LABEL } from '../../../constants/slotCode.constants';
import type { SlotCode } from '../../../types/meal.types';

interface SlotChipProps {
  slotCode: SlotCode;
}

const SlotChip = ({ slotCode }: SlotChipProps) => {
  return (
    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
      {SLOT_CODE_LABEL[slotCode]}
    </span>
  );
};

export default SlotChip;

