import {
  ArrowPathIcon,
  BoltIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import Spinner from '../common/Spinner';
import type { GoalCode } from '../../types/meal.types';

interface InfoStripProps {
  goal: GoalCode;
  goalLabel: string;
  tdee: number;
  constitutionLabel: string;
  date: string;
  onChangeGoal: () => void;
  onRegen: () => void;
  regenLoading?: boolean;
  mobile?: boolean;
}

const Dot = () => (
  <span className="hidden h-1 w-1 shrink-0 rounded-full bg-emerald-300 sm:inline-block" />
);

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FlagIcon;
  label: string;
  value: string;
}) => (
  <div className="flex min-w-0 items-center gap-1.5 text-sm">
    <Icon className="h-4 w-4 shrink-0 text-brand-green-dark" />
    <span className="shrink-0 text-gray-500">{label}:</span>
    <span className="truncate font-bold text-gray-900">{value}</span>
  </div>
);

const InfoStrip = ({
  goal,
  goalLabel,
  tdee,
  constitutionLabel,
  date,
  onChangeGoal,
  onRegen,
  regenLoading = false,
  mobile = false,
}: InfoStripProps) => {
  return (
    <section
      aria-label="Thông tin đề xuất thực đơn"
      className={`mb-5 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-r-xl border-l-4 border-brand-green bg-brand-green-light shadow-sm ${
        mobile ? 'px-3.5 py-3' : 'px-5 py-3'
      }`}
      data-goal={goal}
    >
      <InfoItem icon={FlagIcon} label="Mục tiêu" value={goalLabel} />
      <Dot />
      <InfoItem icon={BoltIcon} label="TDEE" value={`${tdee.toLocaleString('vi-VN')} kcal`} />
      <Dot />
      <InfoItem icon={ChartBarIcon} label="Thể trạng" value={constitutionLabel} />
      <Dot />
      <div className="hidden min-w-0 items-center gap-1.5 text-sm text-gray-500 lg:flex">
        <CalendarDaysIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">{date}</span>
      </div>

      <div className="min-w-0 flex-1" />

      <button
        type="button"
        className="rounded-md px-2 py-1 text-sm font-semibold text-brand-green-dark underline decoration-emerald-700/30 underline-offset-4 transition hover:bg-white/60"
        onClick={onChangeGoal}
      >
        Thay đổi mục tiêu
      </button>

      <button
        type="button"
        disabled={regenLoading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-70"
        onClick={onRegen}
      >
        {regenLoading ? (
          <Spinner size={14} thin />
        ) : (
          <ArrowPathIcon className="h-4 w-4" />
        )}
        Gen lại cả ngày
      </button>
    </section>
  );
};

export default InfoStrip;

