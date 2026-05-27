import React, { useState } from 'react';
import { BeakerIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../../../services/apiResponse';
import { updatePreference } from '../../../services/userPreferences.service';
import type { PreferenceResponse } from '../../../services/userPreferences.service';
import type { PbfMethod } from '../../../types/refactorUi.types';
import SectionCard from '../shared/SectionCard';

interface S4HealthSettingsProps {
  preferences: PreferenceResponse[];
  onPreferenceChanged: () => Promise<void>;
}

interface PbfMethodCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

const PbfMethodCard: React.FC<PbfMethodCardProps> = ({
  icon: Icon,
  title,
  desc,
  selected,
  onClick,
  disabled,
  badge,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 rounded-2xl border-2 p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
      selected
        ? 'border-brand-green bg-brand-green-light'
        : 'border-gray-100 bg-white hover:border-emerald-200'
    }`}
  >
    <div className="mb-3 flex items-start justify-between gap-3">
      <div
        className={`grid h-11 w-11 place-items-center rounded-xl ${
          selected ? 'bg-white text-brand-green-dark' : 'bg-gray-50 text-gray-500'
        }`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
          selected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </div>
    <div className={`flex flex-wrap items-center gap-2 text-sm font-bold ${selected ? 'text-brand-green-darker' : 'text-gray-900'}`}>
      {title}
      {badge && (
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {badge}
        </span>
      )}
    </div>
    <p className="mt-1 text-xs leading-5 text-gray-600">{desc}</p>
  </button>
);

const S4HealthSettings: React.FC<S4HealthSettingsProps> = ({
  preferences,
  onPreferenceChanged,
}) => {
  const pbfPref = preferences.find((item) => item.prefKey === 'pbf_method');
  const currentMethod = (pbfPref?.prefValue as PbfMethod | undefined) ?? 'FORMULA';
  const [saving, setSaving] = useState(false);

  const handleToggle = async (newMethod: PbfMethod) => {
    if (newMethod === currentMethod) return;

    setSaving(true);
    try {
      await updatePreference('pbf_method', { prefValue: newMethod, valueType: 'STRING' });
      toast.success(
        `Đã đổi phương pháp tính PBF sang ${newMethod === 'FORMULA' ? 'Công thức Navy' : 'Model AI'}`,
      );
      await onPreferenceChanged();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Không đổi được cài đặt, vui lòng thử lại'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title="Cài đặt sức khỏe"
      subtitle="Tinh chỉnh cách hệ thống tính các chỉ số của bạn"
    >
      <div className="mb-3">
        <h4 className="text-sm font-bold text-gray-900">
          Phương pháp tính % mỡ cơ thể
        </h4>
        <p className="mt-0.5 text-xs text-gray-500">
          Chọn cách hệ thống tính chỉ số PBF của bạn
        </p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:gap-4">
        <PbfMethodCard
          icon={BeakerIcon}
          title="Công thức Navy"
          badge="Mặc định"
          desc="Tính từ chiều cao, vòng eo, vòng cổ và vòng hông cho nữ. Nhanh, không cần thiết bị."
          selected={currentMethod === 'FORMULA'}
          onClick={() => handleToggle('FORMULA')}
          disabled={saving}
        />
        <PbfMethodCard
          icon={CpuChipIcon}
          title="Model AI"
          badge="Beta"
          desc="Sử dụng machine learning để dự đoán chính xác hơn. Cần ít nhất 30 ngày dữ liệu."
          selected={currentMethod === 'MODEL_1'}
          onClick={() => handleToggle('MODEL_1')}
          disabled={saving}
        />
      </div>
    </SectionCard>
  );
};

export default S4HealthSettings;
