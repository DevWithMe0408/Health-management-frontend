import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { UserProfileData } from '../../../services/auth.service';
import { getApiErrorMessage } from '../../../services/apiResponse';
import { updateUserProfile } from '../../../services/user.service';
import type { Gender } from '../../../types/refactorUi.types';
import {
  computeAge,
  personalInfoSchema,
  type PersonalInfoData,
} from '../../../types/profile.schemas';
import EditIconButton from '../shared/EditIconButton';
import FieldRow from '../shared/FieldRow';
import SectionCard from '../shared/SectionCard';
import Segmented from '../shared/Segmented';

interface S2PersonalInfoProps {
  user: UserProfileData | null;
  onUpdated: () => Promise<void>;
}

const GENDER_LABEL: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

function formatVnDate(iso?: string | null): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

function inputClass(hasError: boolean): string {
  return `mt-1 w-full rounded-xl border-2 px-3 py-2.5 text-sm outline-none transition ${
    hasError
      ? 'border-red-300 bg-red-50 focus:border-red-500'
      : 'border-gray-100 focus:border-brand-green focus:ring-4 focus:ring-brand-green-light'
  }`;
}

const toFormValues = (user: UserProfileData | null): PersonalInfoData => ({
  name: user?.name ?? '',
  birthDate: user?.birthDate ?? '',
  gender: (user?.gender as Gender | null) ?? 'OTHER',
  phone: user?.phone ?? '',
});

const S2PersonalInfo: React.FC<S2PersonalInfoProps> = ({ user, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onChange',
    defaultValues: toFormValues(user),
  });

  const enterEdit = () => {
    reset(toFormValues(user));
    setEditing(true);
  };

  const cancelEdit = () => {
    reset(toFormValues(user));
    setEditing(false);
  };

  const onSubmit = async (data: PersonalInfoData) => {
    setSaving(true);
    try {
      await updateUserProfile({
        name: data.name.trim(),
        birthDate: data.birthDate,
        gender: data.gender,
        phone: data.phone ? data.phone : null,
      });
      await onUpdated();
      toast.success('Đã cập nhật thông tin');
      setEditing(false);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Có lỗi xảy ra, vui lòng thử lại'));
    } finally {
      setSaving(false);
    }
  };

  const age = user?.birthDate ? computeAge(user.birthDate) : null;
  const birthDateWatch = watch('birthDate');
  const editAge = birthDateWatch ? computeAge(birthDateWatch) : null;

  if (!editing) {
    return (
      <SectionCard
        title="Thông tin cá nhân"
        subtitle="Các thông tin cơ bản hệ thống dùng để tính chỉ số"
        rightSlot={<EditIconButton onClick={enterEdit} />}
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <FieldRow label="Họ và tên" value={user?.name} />
          <FieldRow
            label="Ngày sinh"
            value={formatVnDate(user?.birthDate)}
            help={age !== null && !Number.isNaN(age) ? `Bạn ${age} tuổi` : undefined}
          />
          <FieldRow
            label="Giới tính"
            value={user?.gender ? GENDER_LABEL[user.gender] : ''}
          />
          <FieldRow label="Số điện thoại" value={user?.phone} />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Thông tin cá nhân" subtitle="Cập nhật thông tin cá nhân của bạn">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Họ và tên *
            </label>
            <input
              type="text"
              {...register('name')}
              className={inputClass(!!errors.name)}
              disabled={saving}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Ngày sinh *
            </label>
            <input
              type="date"
              {...register('birthDate')}
              className={inputClass(!!errors.birthDate)}
              disabled={saving}
            />
            {editAge !== null && !Number.isNaN(editAge) && (
              <p className="mt-1 text-xs text-gray-500">Bạn {editAge} tuổi</p>
            )}
            {errors.birthDate && (
              <p className="mt-1 text-xs text-red-600">{errors.birthDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Giới tính *
            </label>
            <div className="mt-1">
              <Segmented<Gender>
                options={[
                  { value: 'MALE', label: 'Nam' },
                  { value: 'FEMALE', label: 'Nữ' },
                  { value: 'OTHER', label: 'Khác' },
                ]}
                value={watch('gender')}
                onChange={(value) => setValue('gender', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })}
                disabled={saving}
              />
            </div>
            {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Số điện thoại
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="0xxx xxx xxx"
              className={inputClass(!!errors.phone)}
              disabled={saving}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!isValid || saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-green to-brand-green-medium px-5 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
          >
            {saving && (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </SectionCard>
  );
};

export default S2PersonalInfo;
