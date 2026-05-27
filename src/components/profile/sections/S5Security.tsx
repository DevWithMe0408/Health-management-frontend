import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { getApiErrorCode, getApiErrorMessage } from '../../../services/apiResponse';
import { changePassword } from '../../../services/password.service';
import {
  changePasswordSchema,
  type ChangePasswordData,
} from '../../../types/profile.schemas';
import SectionCard from '../shared/SectionCard';

function inputClass(hasError: boolean): string {
  return `mt-1 w-full rounded-xl border-2 px-3 py-2.5 text-sm outline-none transition ${
    hasError
      ? 'border-red-300 bg-red-50 focus:border-red-500'
      : 'border-gray-100 focus:border-brand-green focus:ring-4 focus:ring-brand-green-light'
  }`;
}

const S5Security: React.FC = () => {
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordData) => {
    setSaving(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Đã đổi mật khẩu thành công');
      reset();
    } catch (error: unknown) {
      const code = getApiErrorCode(error);
      if (code === 'AUTH-011') {
        setError('currentPassword', { message: 'Mật khẩu hiện tại không đúng' });
      } else if (code === 'AUTH-012') {
        setError('newPassword', { message: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
      } else {
        toast.error(getApiErrorMessage(error, 'Có lỗi xảy ra'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Bảo mật" subtitle="Đổi mật khẩu đăng nhập của bạn">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700">
            Mật khẩu hiện tại *
          </label>
          <input
            type="password"
            autoComplete="current-password"
            {...register('currentPassword')}
            className={inputClass(!!errors.currentPassword)}
            disabled={saving}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">
            Mật khẩu mới *
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
            className={inputClass(!!errors.newPassword)}
            disabled={saving}
          />
          <p className="mt-1 text-xs text-gray-500">
            Ít nhất 8 ký tự, có chữ HOA và chữ số
          </p>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700">
            Xác nhận mật khẩu mới *
          </label>
          <input
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={inputClass(!!errors.confirmPassword)}
            disabled={saving}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!isValid || saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-green to-brand-green-medium px-5 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 sm:w-auto"
          >
            {saving && (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
};

export default S5Security;
