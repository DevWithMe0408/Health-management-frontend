import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
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
      title: daysSinceWeight == null ? 'Chưa có cân nặng gần đây' : `${daysSinceWeight} ngày chưa cân`,
      message: 'Cập nhật cân nặng để dashboard và gợi ý mục tiêu phản ánh đúng tiến độ.',
      ctaText: 'Cập nhật cân nặng',
      ctaPath: '/submit-data',
    });
  }

  const trend = computeWeightTrend(weightHistory.slice(-7));
  if (trend != null && currentGoal?.goalCode === 'DUY_TRI' && trend < -0.7) {
    reminders.push({
      key: 'weight-dropping',
      priority: 'MEDIUM',
      title: 'Cân nặng đang giảm',
      message: `Bạn đã giảm ${Math.abs(trend).toFixed(1)} kg trong tuần gần đây.`,
      ctaText: 'Xem hồ sơ',
      ctaPath: '/profile',
    });
  }

  if (trend != null && currentGoal?.goalCode === 'GIAM' && trend > 0.5) {
    reminders.push({
      key: 'weight-rising',
      priority: 'MEDIUM',
      title: 'Cân nặng tăng ngoài kỳ vọng',
      message: `Bạn đã tăng ${trend.toFixed(1)} kg trong tuần gần đây.`,
      ctaText: 'Xem thực đơn',
      ctaPath: '/nutrition-plan',
    });
  }

  if (reminders.length === 0) {
    reminders.push({
      key: 'keep-going',
      priority: 'LOW',
      title: 'Bạn đang theo dõi khá đầy đủ',
      message: 'Tiếp tục cập nhật chỉ số định kỳ để dashboard giữ được độ chính xác.',
      ctaText: 'Cập nhật chỉ số',
      ctaPath: '/submit-data',
    });
  }

  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return reminders.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 3);
};

const priorityStyle = {
  HIGH: {
    card: 'border-amber-300 bg-amber-50',
    icon: 'text-amber-700',
    Icon: ExclamationTriangleIcon,
  },
  MEDIUM: {
    card: 'border-blue-300 bg-blue-50',
    icon: 'text-blue-700',
    Icon: InformationCircleIcon,
  },
  LOW: {
    card: 'border-gray-200 bg-gray-50',
    icon: 'text-gray-600',
    Icon: CheckCircleIcon,
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
    <DashboardCard title="Nhắc nhở">
      <div className="space-y-3">
        {reminders.map((reminder) => {
          const style = priorityStyle[reminder.priority];
          const Icon = style.Icon;

          return (
            <div key={reminder.key} className={`rounded-md border p-4 ${style.card}`}>
              <div className="flex gap-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-950">{reminder.title}</div>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{reminder.message}</p>
                  <Link
                    to={reminder.ctaPath}
                    className="mt-3 inline-flex rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 transition hover:bg-gray-50"
                  >
                    {reminder.ctaText}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
};

export default ReminderList;
