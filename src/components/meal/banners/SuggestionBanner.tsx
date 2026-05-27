import { LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ScoreBadge from '../atoms/ScoreBadge';

interface SuggestionBannerProps {
  from: string;
  to: string;
  newScore: number;
  onApply: () => void;
  onDismiss: () => void;
  mobile?: boolean;
}

const SuggestionBanner = ({
  from,
  to,
  newScore,
  onApply,
  onDismiss,
  mobile = false,
}: SuggestionBannerProps) => {
  return (
    <section
      aria-label="Gợi ý cải thiện điểm bữa ăn"
      className={`flex gap-3 rounded-r-xl border-l-4 border-amber-400 bg-amber-50 p-3.5 ${
        mobile ? 'flex-col' : 'items-center'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-200 text-amber-700">
          <LightBulbIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 text-sm leading-6 text-amber-950">
          <b>Gợi ý:</b> Đổi <b>{from}</b> sang <b>{to}</b> sẽ tăng điểm bữa lên{' '}
          <span className="inline-flex align-middle">
            <ScoreBadge score={newScore} size="sm" />
          </span>
        </div>
      </div>

      <div className={`flex shrink-0 items-center gap-2 ${mobile ? 'w-full' : ''}`}>
        <button
          type="button"
          className={`rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-amber-600 ${
            mobile ? 'flex-1' : ''
          }`}
          onClick={onApply}
        >
          Áp dụng
        </button>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg text-amber-800 transition hover:bg-amber-100"
          aria-label="Bỏ qua gợi ý"
          onClick={onDismiss}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};

export default SuggestionBanner;

