import { StarIcon } from '@heroicons/react/24/solid';
import { getScoreTier } from '../../../constants/score.constants';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md';
}

const ScoreBadge = ({ score, size = 'md' }: ScoreBadgeProps) => {
  const tier = getScoreTier(score);
  const roundedScore = Number.isFinite(score) ? score : 0;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-[13px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold tabular-nums ${sizeClass}`}
      style={{
        backgroundColor: tier.bg,
        color: tier.fg,
        boxShadow: `inset 0 0 0 1px ${tier.ring}`,
      }}
    >
      <StarIcon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      <span>{roundedScore.toFixed(1)}</span>
      <span className="font-medium opacity-55">·</span>
      <span>{tier.label}</span>
    </span>
  );
};

export default ScoreBadge;

