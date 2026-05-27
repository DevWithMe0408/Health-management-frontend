import { useState } from 'react';
import { FOOD_GROUP_PALETTE } from '../../../constants/foodGroup.constants';
import type { FoodGroup } from '../../../types/meal.types';

interface FoodThumbProps {
  name: string;
  foodGroup: FoodGroup;
  imageUrl?: string | null;
  size?: number;
}

const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.map((word) => word[0]).slice(0, 2).join('');
  return initials.toUpperCase() || '?';
};

const FoodThumb = ({ name, foodGroup, imageUrl, size = 64 }: FoodThumbProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [from, to] = FOOD_GROUP_PALETTE[foodGroup];

  if (imageUrl && !imageFailed) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="shrink-0 rounded-lg object-cover shadow-sm"
        style={{ width: size, height: size }}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-lg font-bold text-white shadow-sm"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize: Math.max(12, size * 0.3),
      }}
      title={name}
    >
      <span className="relative z-10 drop-shadow-sm">{getInitials(name)}</span>
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(circle at 25% 30%, rgba(255,255,255,.18) 1px, transparent 2px), radial-gradient(circle at 70% 60%, rgba(255,255,255,.12) 1px, transparent 2px)',
          backgroundSize: '14px 14px, 18px 18px',
        }}
      />
    </div>
  );
};

export default FoodThumb;

