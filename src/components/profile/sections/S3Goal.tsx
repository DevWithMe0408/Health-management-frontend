import React, { useMemo, useState } from 'react';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChevronDownIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import type { UserGoalResponse } from '../../../services/userGoals.service';
import type { GoalCode } from '../../../types/refactorUi.types';
import GoalChangeModal from '../modals/GoalChangeModal';
import ProgressBar from '../shared/ProgressBar';
import SectionCard from '../shared/SectionCard';

interface S3GoalProps {
  currentGoal: UserGoalResponse | null;
  history: UserGoalResponse[];
  currentWeight: number | null;
  onGoalChanged: () => Promise<void>;
}

const GOAL_STYLE: Record<GoalCode, {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bg: string;
  border: string;
}> = {
  GIAM: {
    label: 'GIẢM CÂN',
    icon: ArrowTrendingDownIcon,
    color: 'text-brand-green-darker',
    bg: 'bg-brand-green-light',
    border: 'border-green-200',
  },
  DUY_TRI: {
    label: 'DUY TRÌ',
    icon: ScaleIcon,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  TANG: {
    label: 'TĂNG CÂN',
    icon: ArrowTrendingUpIcon,
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
};

const STATUS_STYLE = {
  active: { label: 'Đang theo', cls: 'bg-brand-green text-white' },
  done: { label: 'Đã hoàn tất', cls: 'bg-gray-200 text-gray-700' },
  dropped: { label: 'Đã dừng', cls: 'bg-amber-100 text-amber-700' },
};

function formatVnDate(iso?: string | null): string {
  if (!iso) return '-';
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

function getGoalStatus(goal: UserGoalResponse): keyof typeof STATUS_STYLE {
  if (goal.isActive) return 'active';
  if (goal.endDate) return 'done';
  return 'dropped';
}

const S3Goal: React.FC<S3GoalProps> = ({
  currentGoal,
  history,
  currentWeight,
  onGoalChanged,
}) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const progress = useMemo(() => {
    if (!currentGoal || currentGoal.goalCode === 'DUY_TRI') return null;

    const startWeight = currentGoal.startWeightKg;
    const targetWeight = currentGoal.targetWeightKg;

    if (startWeight == null || targetWeight == null || currentWeight == null) {
      return null;
    }

    if (currentGoal.goalCode === 'GIAM' && startWeight > targetWeight) {
      const changed = startWeight - currentWeight;
      const needed = startWeight - targetWeight;
      const value = Math.max(0, Math.min(100, Math.round((changed / needed) * 100)));
      return {
        value,
        label: `Đã giảm ${changed.toFixed(1)}kg / ${needed.toFixed(1)}kg`,
      };
    }

    if (currentGoal.goalCode === 'TANG' && startWeight < targetWeight) {
      const changed = currentWeight - startWeight;
      const needed = targetWeight - startWeight;
      const value = Math.max(0, Math.min(100, Math.round((changed / needed) * 100)));
      return {
        value,
        label: `Đã tăng ${changed.toFixed(1)}kg / ${needed.toFixed(1)}kg`,
      };
    }

    return null;
  }, [currentGoal, currentWeight]);

  const missingProgressReason = useMemo(() => {
    if (!currentGoal || currentGoal.goalCode === 'DUY_TRI') return null;
    if (currentGoal.startWeightKg == null) return 'Chưa có dữ liệu cân nặng khởi điểm';
    if (currentGoal.targetWeightKg == null) return 'Chưa đặt cân nặng mục tiêu';
    if (currentWeight == null) return 'Chưa có dữ liệu cân nặng hiện tại';
    return 'Tiến độ chưa khả dụng';
  }, [currentGoal, currentWeight]);

  const goalStyle = currentGoal ? GOAL_STYLE[currentGoal.goalCode] : null;
  const GoalIcon = goalStyle?.icon;

  return (
    <>
      <SectionCard
        title="Mục tiêu hiện tại"
        subtitle="Mục tiêu bạn đang theo đuổi cùng tiến độ"
      >
        {currentGoal && goalStyle && GoalIcon ? (
          <>
            <div className={`flex flex-col gap-4 rounded-2xl border ${goalStyle.border} ${goalStyle.bg} p-5 sm:flex-row sm:items-center`}>
              <div
                className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-white text-brand-green-dark"
                style={{ boxShadow: '0 4px 12px -4px rgba(15,23,42,.1)' }}
              >
                <GoalIcon className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider ${goalStyle.color}`}>
                  Đang theo
                </div>
                <div className="mt-0.5 text-xl font-bold text-gray-900 lg:text-[22px]">
                  {goalStyle.label}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Bắt đầu {formatVnDate(currentGoal.startDate)}
                  {currentGoal.targetDurationMonths && ` · trong ${currentGoal.targetDurationMonths} tháng`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-brand-green-light px-3.5 py-2 text-sm font-semibold text-brand-green-darker transition hover:bg-green-100 sm:w-auto"
              >
                Đổi mục tiêu
                <ChevronDownIcon className="h-4 w-4 -rotate-90" aria-hidden="true" />
              </button>
            </div>

            {progress ? (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">{progress.label}</span>
                  <span className="text-sm font-bold text-brand-green-dark" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {progress.value}%
                  </span>
                </div>
                <ProgressBar value={progress.value} max={100} />
                <div
                  className="mt-2 grid grid-cols-1 gap-1 text-xs text-gray-500 sm:grid-cols-3"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  <span>Bắt đầu: {currentGoal.startWeightKg?.toFixed(1)} kg</span>
                  <span className="font-semibold text-brand-green-dark sm:text-center">
                    Hiện tại: {currentWeight?.toFixed(1)} kg
                  </span>
                  <span className="sm:text-right">Mục tiêu: {currentGoal.targetWeightKg?.toFixed(1)} kg</span>
                </div>
              </div>
            ) : missingProgressReason ? (
              <div className="mt-5 rounded-xl bg-gray-50 p-3 text-center text-sm text-gray-500">
                {missingProgressReason}
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
            Bạn chưa đặt mục tiêu nào
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-green to-brand-green-medium px-5 py-2 text-sm font-semibold text-white shadow-sm"
              >
                Chọn mục tiêu
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setHistoryOpen((value) => !value)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-800 transition hover:text-brand-green-dark"
          >
            <span>
              Lịch sử mục tiêu{' '}
              <span className="font-medium text-gray-500">({history.length})</span>
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${historyOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {historyOpen && (
            <div className="mt-3 space-y-2">
              {history.length === 0 ? (
                <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                  Bạn chưa từng đổi mục tiêu
                </div>
              ) : (
                history.map((item) => {
                  const itemGoal = GOAL_STYLE[item.goalCode];
                  const ItemIcon = itemGoal.icon;
                  const status = STATUS_STYLE[getGoalStatus(item)];

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-gray-50 text-gray-600">
                          <ItemIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{itemGoal.label}</div>
                          <div className="text-xs text-gray-500">
                            {formatVnDate(item.startDate)} - {formatVnDate(item.endDate)}
                          </div>
                        </div>
                      </div>
                      <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </SectionCard>

      {modalOpen && (
        <GoalChangeModal
          currentGoalCode={currentGoal?.goalCode}
          onClose={() => setModalOpen(false)}
          onConfirmed={async () => {
            setModalOpen(false);
            await onGoalChanged();
          }}
        />
      )}
    </>
  );
};

export default S3Goal;
