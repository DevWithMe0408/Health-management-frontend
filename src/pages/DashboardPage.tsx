import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import {
  getDashboardOverview,
  type DashboardOverview,
} from '../services/dashboard.service';
import type { GoalCode } from '../types/refactorUi.types';
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
    <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
      <div className="h-96 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-96 animate-pulse rounded-lg bg-gray-100" />
    </div>
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
      <section className="rounded-lg border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-green-dark">Dashboard sức khỏe</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-950">
              Xin chào, {displayName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Theo dõi thể trạng, cân nặng và các chỉ số nền để điều chỉnh mục tiêu kịp thời.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentGoal && (
              <span className="rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-brand-green-dark">
                Mục tiêu: {goalLabels[currentGoal]}
              </span>
            )}
            <span className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600">
              PBF: {pbfMethod}
            </span>
            <Link
              to="/submit-data"
              className="inline-flex items-center gap-2 rounded-md bg-brand-green px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-green-dark"
            >
              <PlusCircleIcon className="h-4 w-4" />
              Cập nhật chỉ số
            </Link>
          </div>
        </div>
      </section>

      <MetricSummaryGrid
        metrics={overview?.metrics ?? null}
        weightHistory={overview?.weightHistory ?? []}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-5">
          <ConstitutionCard
            constitution={overview?.constitution ?? null}
            bmiMetric={overview?.metrics?.bmi}
            error={overview?.errors.constitution}
            onRetry={loadDashboard}
          />
          <WeightChartCard
            data={overview?.weightHistory ?? []}
            error={overview?.errors.weightHistory}
          />
          <HealthMetricsDetails
            metrics={overview?.metrics ?? null}
            error={overview?.errors.metrics}
          />
        </div>

        <ReminderList
          user={user}
          metrics={overview?.metrics ?? null}
          weightHistory={overview?.weightHistory ?? []}
          currentGoal={overview?.currentGoal ?? null}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
