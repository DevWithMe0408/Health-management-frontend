import {
  CheckCircleIcon,
  ForwardIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { UIMealStatus } from '../../../types/meal.types';

interface StatusPillProps {
  status: UIMealStatus;
}

const STATUS_META: Record<
  UIMealStatus,
  {
    label: string;
    className: string;
    Icon: typeof SparklesIcon;
  }
> = {
  suggested: {
    label: 'Đề xuất',
    className: 'border-emerald-200 bg-emerald-50 text-brand-green-dark',
    Icon: SparklesIcon,
  },
  eaten: {
    label: 'Đã ăn',
    className: 'border-emerald-200 bg-emerald-100 text-emerald-800',
    Icon: CheckCircleIcon,
  },
  skipped: {
    label: 'Bỏ qua',
    className: 'border-gray-200 bg-gray-100 text-gray-600',
    Icon: ForwardIcon,
  },
};

const StatusPill = ({ status }: StatusPillProps) => {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
};

export default StatusPill;

