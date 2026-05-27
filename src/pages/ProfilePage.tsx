import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { getProfileOverview } from '../services/profile.service';
import type { ProfileOverview } from '../services/profile.service';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
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
        <section className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          {loading ? (
            <div className="text-sm font-medium text-gray-400">Đang tải...</div>
          ) : (
            <div className="text-sm text-gray-500">
              Profile shell đã sẵn sàng cho các section tiếp theo.
              <div className="mt-2 text-xs text-gray-400">
                {user?.username ? `Người dùng: ${user.username}` : 'Chưa có thông tin người dùng'}
                {overview?.errors && Object.keys(overview.errors).length > 0
                  ? ` · ${Object.keys(overview.errors).length} phần tải chưa thành công`
                  : ''}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
