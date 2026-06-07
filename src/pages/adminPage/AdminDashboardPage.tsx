import React, { useCallback, useEffect, useState } from 'react';
import {
  CakeIcon,
  CubeIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import DataQualityPanel from '../../components/admin/DataQualityPanel';
import PageHeader from '../../components/admin/PageHeader';
import SlotCoverageChart from '../../components/admin/SlotCoverageChart';
import StatCard from '../../components/admin/StatCard';
import { toast } from '../../components/admin/Toast';
import { getApiErrorMessage } from '../../services/apiResponse';
import {
  getDashboardData,
  type DashboardData,
} from '../../services/admin/dashboard.admin.service';

const todayLabel = (): string => {
  const s = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `Hôm nay: ${s.charAt(0).toUpperCase()}${s.slice(1)}`;
};

const percent = (done: number, total: number): number => (
  total > 0 ? Math.round((done / total) * 100) : 0
);

const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      setData(await getDashboardData());
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Không thể tải dữ liệu tổng quan');
      setData(null);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-green" />
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="Tổng quan hệ thống" description={todayLabel()} />
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            {errorMessage ?? 'Không thể tải dữ liệu tổng quan'}
          </p>
          <button
            type="button"
            onClick={load}
            className="mt-3 rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-green-dark"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { catalog, users } = data;
  const profilePct = percent(users.usersWithProfile, users.totalUsers);

  return (
    <div>
      <PageHeader title="Tổng quan hệ thống" description={todayLabel()} />

      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Người dùng"
            value={users.totalUsers}
            sub={`${users.usersWithProfile} đã hoàn thiện hồ sơ (${profilePct}%)`}
            icon={<UserGroupIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Món ăn"
            value={catalog.dishTotal}
            sub={`${catalog.dishActive} đang hoạt động`}
            icon={<CakeIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Nguyên liệu"
            value={catalog.ingredientTotal}
            sub={`${catalog.ingredientWithMacro} đã có dữ liệu dinh dưỡng`}
            icon={<CubeIcon className="h-5 w-5" />}
          />
          <StatCard
            label="Lượt sinh thực đơn"
            value={catalog.mealLogTotal.toLocaleString('vi-VN')}
            sub="tổng số bản ghi"
            icon={<SparklesIcon className="h-5 w-5" />}
          />
        </div>

        <SlotCoverageChart dishCountBySlot={catalog.dishCountBySlot} />

        <DataQualityPanel
          ingredientTotal={catalog.ingredientTotal}
          ingredientWithMacro={catalog.ingredientWithMacro}
          dishTotal={catalog.dishTotal}
          dishActive={catalog.dishActive}
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
