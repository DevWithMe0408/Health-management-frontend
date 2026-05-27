import React, { useState } from 'react';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ScaleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { updateCurrentGoal } from '../../../services/userGoals.service';
import type { GoalCode } from '../../../types/refactorUi.types';

interface GoalChangeModalProps {
  currentGoalCode?: GoalCode;
  onClose: () => void;
  onConfirmed: () => Promise<void>;
}

const OPTIONS: Array<{
  value: GoalCode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  desc: string;
}> = [
  {
    value: 'GIAM',
    icon: ArrowTrendingDownIcon,
    label: 'GIẢM CÂN',
    desc: 'Tạo deficit calo. Hệ thống đề xuất khẩu phần nhỏ hơn.',
  },
  {
    value: 'DUY_TRI',
    icon: ScaleIcon,
    label: 'DUY TRÌ',
    desc: 'Cân bằng năng lượng. Giữ trọng lượng hiện tại.',
  },
  {
    value: 'TANG',
    icon: ArrowTrendingUpIcon,
    label: 'TĂNG CÂN',
    desc: 'Surplus calo lành mạnh. Phù hợp xây cơ.',
  },
];

const GoalChangeModal: React.FC<GoalChangeModalProps> = ({
  currentGoalCode,
  onClose,
  onConfirmed,
}) => {
  const [selected, setSelected] = useState<GoalCode>(currentGoalCode ?? 'DUY_TRI');
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (selected === currentGoalCode) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      await updateCurrentGoal({ goalCode: selected, targetDurationMonths: 6 });
      toast.success('Đã đổi mục tiêu');
      await onConfirmed();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không đổi được mục tiêu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Đổi mục tiêu</h3>
              <p className="mt-1 text-sm text-gray-600">
                Chọn mục tiêu phù hợp với tình trạng hiện tại của bạn.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50"
              title="Đóng"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = option.value === selected;
              const isCurrent = option.value === currentGoalCode;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelected(option.value)}
                  disabled={saving}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? 'border-brand-green bg-brand-green-light'
                      : 'border-gray-100 bg-white hover:border-emerald-200'
                  }`}
                >
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white text-brand-green-dark shadow-sm">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`flex flex-wrap items-center gap-2 text-sm font-bold ${isSelected ? 'text-brand-green-darker' : 'text-gray-900'}`}>
                      {option.label}
                      {isCurrent && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Hiện tại
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-600">{option.desc}</span>
                  </span>
                  <span
                    className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full border-2 ${
                      isSelected ? 'border-brand-green bg-brand-green' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-green to-brand-green-medium px-5 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50"
          >
            {saving && (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {saving ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalChangeModal;
