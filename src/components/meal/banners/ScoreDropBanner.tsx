import { ArrowUturnLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ScoreBadge from '../atoms/ScoreBadge';

interface ScoreDropBannerProps {
  from: number;
  to: number;
  onKeep: () => void;
  onRevert: () => void;
  mobile?: boolean;
}

const ScoreDropBanner = ({
  from,
  to,
  onKeep,
  onRevert,
  mobile = false,
}: ScoreDropBannerProps) => {
  const delta = Math.max(0, from - to);

  return (
    <section
      aria-label="Cảnh báo giảm điểm bữa ăn"
      className={`flex gap-3 rounded-r-xl border-l-4 border-orange-500 bg-orange-100 p-4 ${
        mobile ? 'flex-col' : 'items-center'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-200 text-orange-800">
          <ExclamationTriangleIcon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-orange-950">
            Điểm bữa này giảm mạnh sau khi đổi món
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-orange-800">
            <span>Từ</span>
            <ScoreBadge score={from} size="sm" />
            <span>xuống</span>
            <ScoreBadge score={to} size="sm" />
            <span className="rounded-md bg-orange-900/10 px-2 py-0.5 text-xs font-bold tabular-nums text-orange-900">
              -{delta.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className={`flex shrink-0 gap-2 ${mobile ? 'w-full' : ''}`}>
        <button
          type="button"
          className={`rounded-lg border border-orange-300 bg-white px-3 py-2 text-xs font-semibold text-orange-800 transition hover:bg-orange-50 ${
            mobile ? 'flex-1' : ''
          }`}
          onClick={onKeep}
        >
          Giữ thay đổi
        </button>
        <button
          type="button"
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-orange-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-900 ${
            mobile ? 'flex-1' : ''
          }`}
          onClick={onRevert}
        >
          <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
          Quay lại
        </button>
      </div>
    </section>
  );
};

export default ScoreDropBanner;

