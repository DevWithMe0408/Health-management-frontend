import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import {
  getDashboardOverview,
  type DashboardOverview,
} from '../services/dashboard.service';
import type { GoalCode } from '../types/refactorUi.types';
import ComplianceCard from '../components/dashboard/ComplianceCard';
import ConstitutionCard from '../components/dashboard/ConstitutionCard';
import HealthMetricsDetails from '../components/dashboard/HealthMetricsDetails';
import MetricSummaryGrid from '../components/dashboard/MetricSummaryGrid';
import ReminderList from '../components/dashboard/ReminderList';
import WeightChartCard from '../components/dashboard/WeightChartCard';

const goalLabels: Record<GoalCode, string> = {
  GIAM: 'Giảm cân',
  DUY_TRI: 'Duy trì',
  TANG: 'Tăng cân',
};

const DashboardSkeleton: React.FC = () => (
  <div className="space-y-5">
    <div className="h-24 animate-pulse rounded-3xl bg-gray-100" />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
      <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
      <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
    </div>
    <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
      <div className="h-60 animate-pulse rounded-2xl bg-gray-100" />
      <div className="h-60 animate-pulse rounded-2xl bg-gray-100" />
    </div>
    <div className="h-14 animate-pulse rounded-2xl bg-gray-100" />
  </div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const data = await getDashboardOverview();
      setOverview(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải dashboard.';
      setPageError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const pbfMethod = useMemo(() => {
    const preference = overview?.preferences.find((item) => item.prefKey === 'pbf_method');
    return preference?.prefValue === 'MODEL_1' ? 'Model 1' : 'Công thức Navy';
  }, [overview?.preferences]);

  const displayName = user?.name || user?.username || 'bạn';
  const currentGoal = overview?.currentGoal?.goalCode;

  if (loading) return <DashboardSkeleton />;

  if (pageError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-900">Không thể tải dashboard</h1>
        <p className="mt-2 text-sm text-red-700">{pageError}</p>
        <button
          type="button"
          onClick={loadDashboard}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section
        className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-brand-green-light via-emerald-50 to-white p-6 lg:p-7"
        style={{ boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-[26px]">
              Xin chào, {displayName}! 👋
            </h1>
            {currentGoal && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <span className="text-base">
                  {currentGoal === 'GIAM' ? '📉' : currentGoal === 'TANG' ? '📈' : '⚖️'}
                </span>
                Đang theo mục tiêu:
                <span className="font-bold tracking-wide text-brand-green-darker">
                  {goalLabels[currentGoal].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600">
              PBF: <b className="text-gray-900">{pbfMethod}</b>
            </span>
            <Link
              to="/submit-data"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm font-semibold text-brand-green-darker transition hover:bg-emerald-50"
            >
              <PlusCircleIcon className="h-4 w-4" />
              Cập nhật chỉ số
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
        <ConstitutionCard
          constitution={overview?.constitution ?? null}
          bmiMetric={overview?.metrics?.bmi}
          error={overview?.errors.constitution}
          onRetry={loadDashboard}
        />
        <ReminderList
          user={user}
          metrics={overview?.metrics ?? null}
          weightHistory={overview?.weightHistory ?? []}
          currentGoal={overview?.currentGoal ?? null}
        />
      </div>

      <WeightChartCard
        data={overview?.weightHistory ?? []}
        error={overview?.errors.weightHistory}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
        <ComplianceCard
          data={overview?.mealLogHistory ?? []}
          error={overview?.errors.mealLogHistory}
        />
        <MetricSummaryGrid
          metrics={overview?.metrics ?? null}
          weightHistory={overview?.weightHistory ?? []}
        />
      </div>

      <HealthMetricsDetails
        metrics={overview?.metrics ?? null}
        error={overview?.errors.metrics}
      />
    </div>
  );
};

export default DashboardPage;
