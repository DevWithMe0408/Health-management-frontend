import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import S1ProfileHeader from '../components/profile/sections/S1ProfileHeader';
import S2PersonalInfo from '../components/profile/sections/S2PersonalInfo';
import S3Goal from '../components/profile/sections/S3Goal';
import S4HealthSettings from '../components/profile/sections/S4HealthSettings';
import S5Security from '../components/profile/sections/S5Security';
import S6DangerZone from '../components/profile/sections/S6DangerZone';
import { useAuth } from '../contexts/AuthContext';
import { getProfileOverview } from '../services/profile.service';
import type { ProfileOverview } from '../services/profile.service';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfileOverview();
      setOverview(data);
    } catch (error) {
      console.error(error);
      toast.error('Không tải được hồ sơ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return (
    <div className="px-2 py-4 md:px-4 lg:px-6">
      <div className="mx-auto mb-6 max-w-[880px]">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <span>Trang chủ</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-gray-800">Hồ sơ của tôi</span>
        </div>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
          Hồ sơ của tôi
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Quản lý thông tin cá nhân, mục tiêu và cài đặt sức khỏe của bạn
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5 pb-6">
        {loading || !overview ? (
          <ProfileSkeleton />
        ) : (
          <>
            <S1ProfileHeader
              user={user}
              constitution={overview.constitution?.constitution}
            />
            <S2PersonalInfo user={user} onUpdated={refreshUser} />
            <S3Goal
              currentGoal={overview.currentGoal}
              history={overview.goalHistory}
              currentWeight={overview.metrics?.weight?.value ?? null}
              onGoalChanged={loadProfile}
            />
            <S4HealthSettings
              preferences={overview.preferences}
              onPreferenceChanged={loadProfile}
            />
            <S5Security />
            <S6DangerZone />
            {Object.keys(overview.errors).length > 0 && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                <div className="text-xs text-amber-600">
                  Có {Object.keys(overview.errors).length} phần dữ liệu chưa tải thành công.
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
