import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface HeartButtonProps {
  dishId: string;
  favorite: boolean;
  disabled?: boolean;
  onToggle: (dishId: string, currentFavorite: boolean) => void | Promise<void>;
}

const HeartButton = ({ dishId, favorite, disabled = false, onToggle }: HeartButtonProps) => {
  const Icon = favorite ? HeartSolidIcon : HeartOutlineIcon;
  const label = favorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      className="inline-grid h-8 w-8 place-items-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={() => void onToggle(dishId, favorite)}
    >
      <Icon className={`h-4.5 w-4.5 ${favorite ? 'text-red-500' : ''}`} />
    </button>
  );
};

export default HeartButton;

