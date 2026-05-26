import React from 'react';
import { Link } from 'react-router-dom';
import type { UserProfileData } from '../../services/auth.service';
import type { DashboardMetricsResponse, HealthHistoryPoint } from '../../services/dashboard.service';
import type { UserGoalResponse } from '../../services/userGoals.service';
import DashboardCard from './DashboardCard';

interface ReminderListProps {
  user: UserProfileData | null;
  metrics: DashboardMetricsResponse | null;
  weightHistory: HealthHistoryPoint[];
  currentGoal: UserGoalResponse | null;
}

interface Reminder {
  key: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  emoji: string;
  title: string;
  message: string;
  ctaText: string;
  ctaPath: string;
}

const daysBetween = (from?: string | null) => {
  if (!from) return null;
  const date = new Date(from);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
};

const computeWeightTrend = (history: HealthHistoryPoint[]) => {
  if (history.length < 2) return null;
  const first = history[0]?.value;
  const last = history[history.length - 1]?.value;
  if (first == null || last == null) return null;
  return last - first;
};

const buildReminders = (
  user: UserProfileData | null,
  metrics: DashboardMetricsResponse | null,
  weightHistory: HealthHistoryPoint[],
  currentGoal: UserGoalResponse | null
): Reminder[] => {
  const reminders: Reminder[] = [];

  if (!user?.birthDate || !user?.gender) {
    reminders.push({
      key: 'profile-incomplete',
      priority: 'HIGH',
      emoji: '👤',
      title: 'Bổ sung thông tin hồ sơ',
      message: 'Ngày sinh và giới tính giúp hệ thống tính BMR, TDEE và PBF chính xác hơn.',
      ctaText: 'Cập nhật hồ sơ',
      ctaPath: '/profile',
    });
  }

  const lastWeightAt = metrics?.weight?.recordedAt || metrics?.weight?.lastUpdatedAt;
  const daysSinceWeight = daysBetween(lastWeightAt);
  if (daysSinceWeight == null || daysSinceWeight > 7) {
    reminders.push({
      key: 'weight-outdated',
      priority: 'HIGH',
      emoji: '⚖️',
      title: daysSinceWeight == null ? 'Chưa có cân nặng gần đây' : `Đã ${daysSinceWeight} ngày chưa cân`,
      message: 'Cập nhật cân nặng để dashboard phản ánh đúng tiến độ.',
      ctaText: 'Cập nhật cân nặng',
      ctaPath: '/submit-data',
    });
  }

  const trend = computeWeightTrend(weightHistory.slice(-7));
  if (trend != null && currentGoal?.goalCode === 'DUY_TRI' && trend < -0.7) {
    reminders.push({
      key: 'weight-dropping',
      priority: 'MEDIUM',
      emoji: '📉',
      title: 'Cân đang giảm nhanh hơn dự kiến',
      message: `Đã giảm ${Math.abs(trend).toFixed(1)}kg trong tuần. Mục tiêu là duy trì, xem lại chế độ?`,
      ctaText: 'Xem chi tiết',
      ctaPath: '/stats',
    });
  }

  if (trend != null && currentGoal?.goalCode === 'GIAM' && trend > 0.5) {
    reminders.push({
      key: 'weight-rising',
      priority: 'MEDIUM',
      emoji: '📈',
      title: 'Cân nặng tăng ngoài kỳ vọng',
      message: `Bạn đã tăng ${trend.toFixed(1)} kg trong tuần gần đây.`,
      ctaText: 'Xem thực đơn',
      ctaPath: '/nutrition-plan',
    });
  }

  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return reminders.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 3);
};

const priorityStyle = {
  HIGH: {
    card: 'border-amber-200 bg-amber-50',
    iconBg: 'bg-amber-100',
  },
  MEDIUM: {
    card: 'border-blue-200 bg-blue-50',
    iconBg: 'bg-blue-100',
  },
  LOW: {
    card: 'border-gray-200 bg-gray-50',
    iconBg: 'bg-gray-100',
  },
};

const ReminderList: React.FC<ReminderListProps> = ({
  user,
  metrics,
  weightHistory,
  currentGoal,
}) => {
  const reminders = buildReminders(user, metrics, weightHistory, currentGoal);

  return (
    <DashboardCard
      title="Nhắc nhở"
      subtitle={reminders.length > 0 ? `${reminders.length} việc cần làm` : undefined}
      rightAction={
        reminders.length > 0 ? (
          <Link to="/notifications" className="text-xs font-medium text-gray-400 hover:text-gray-600">
            Xem tất cả →
          </Link>
        ) : undefined
      }
    >
      {reminders.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 py-6 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-200 bg-brand-green-light text-2xl">
            ✨
          </div>
          <div className="text-sm font-semibold text-gray-900">Tuyệt vời! Mọi thứ đều ổn.</div>
          <p className="max-w-xs text-xs leading-5 text-gray-500">
            Bạn đang theo dõi đầy đủ. Tiếp tục duy trì để đạt mục tiêu nhé!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reminders.map((reminder) => {
            const style = priorityStyle[reminder.priority];

            return (
              <div key={reminder.key} className={`relative rounded-xl border p-3.5 pl-3.5 pr-9 ${style.card}`}>
                <div className="flex gap-3">
                  <div className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-lg ${style.iconBg}`}>
                    {reminder.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900">{reminder.title}</div>
                    <p className="mt-0.5 text-xs leading-5 text-gray-600">{reminder.message}</p>
                    <Link
                      to={reminder.ctaPath}
                      className="mt-2.5 inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50"
                    >
                      {reminder.ctaText}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
                <button
                  type="button"
                  title="Ẩn nhắc nhở này"
                  className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md text-gray-400 hover:bg-white hover:text-gray-700"
                  onClick={(event) => event.stopPropagation()}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12M6 18L18 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
};

export default ReminderList;
