import { FOOD_GROUP_LABEL } from '../../../constants/foodGroup.constants';
import type { FoodGroup } from '../../../types/meal.types';

interface FoodGroupChipProps {
  foodGroup: FoodGroup;
}

const FoodGroupChip = ({ foodGroup }: FoodGroupChipProps) => {
  return (
    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-brand-green-dark">
      {FOOD_GROUP_LABEL[foodGroup]}
    </span>
  );
};

export default FoodGroupChip;

