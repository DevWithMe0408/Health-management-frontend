import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from '../../components/admin/Toast';
import { getUserDetail, type AdminUserDetail } from '../../services/admin/users.admin.service';

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
    <dd className="mt-0.5 text-sm text-gray-900">{value ?? <span className="italic text-gray-400">Chưa cập nhật</span>}</dd>
  </div>
);

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-5">
    <h2 className="text-base font-semibold text-gray-800 mb-4">{title}</h2>
    <dl className="grid grid-cols-2 gap-4">{children}</dl>
  </div>
);

const GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác',
};

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getUserDetail(userId);
      setData(res);
    } catch {
      toast.error('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-green" /></div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-gray-400">Không tìm thấy người dùng</div>;
  }

  const { account, profile, latestHealthMetrics: hm } = data;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green mb-5 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Quay về danh sách
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Chi tiết người dùng: <span className="text-brand-green">{account.username}</span>
      </h1>

      <div className="space-y-4">
        <Card title="Thông tin tài khoản">
          <Field label="Username" value={account.username} />
          <Field label="Email" value={account.email} />
          <Field label="Role" value={
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              account.role === 'ROLE_ADMIN' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {account.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
            </span>
          } />
          <Field label="Tạo lúc" value={account.createdAt ? new Date(account.createdAt).toLocaleString('vi-VN') : null} />
        </Card>

        <Card title="Hồ sơ cá nhân">
          {profile ? (
            <>
              <Field label="Họ tên"    value={profile.name} />
              <Field label="Giới tính" value={profile.gender ? GENDER_LABELS[profile.gender] ?? profile.gender : null} />
              <Field label="Ngày sinh" value={profile.birthDate ? `${profile.birthDate} (${profile.age} tuổi)` : null} />
              <Field label="SĐT"       value={profile.phone} />
            </>
          ) : (
            <div className="col-span-2 text-sm text-gray-400 italic">Chưa cập nhật hồ sơ</div>
          )}
        </Card>

        <Card title="Chỉ số sức khỏe gần nhất">
          {hm ? (
            <>
              <Field label="Cân nặng"  value={hm.weight  != null ? `${hm.weight} kg`  : null} />
              <Field label="Chiều cao" value={hm.height  != null ? `${hm.height} cm`  : null} />
              <Field label="BMI"       value={hm.bmi     != null ? hm.bmi.toFixed(1)  : null} />
              <Field label="BMR"       value={hm.bmr     != null ? `${hm.bmr} kcal`   : null} />
              <Field label="TDEE"      value={hm.tdee    != null ? `${hm.tdee} kcal`  : null} />
              <Field label="PBF"       value={hm.pbf     != null ? `${hm.pbf}%`       : null} />
              <Field label="WHR"       value={hm.whr     != null ? hm.whr.toFixed(2)  : null} />
              <Field label="Cập nhật" value={hm.lastUpdatedAt ? new Date(hm.lastUpdatedAt).toLocaleString('vi-VN') : null} />
            </>
          ) : (
            <div className="col-span-2 text-sm text-gray-400 italic">Chưa có dữ liệu sức khỏe</div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserDetailPage;
