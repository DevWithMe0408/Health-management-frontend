import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { submitOnboarding } from '../../../services/onboarding.service';
import type { OnboardingResult } from '../../../services/onboarding.service';
import { step5Schema } from '../../../types/onboarding.schemas';
import type { Step5Data } from '../../../types/onboarding.schemas';
import type { GoalCode } from '../../../types/refactorUi.types';
import GoalRecommendationModal from '../GoalRecommendationModal';
import WizardCard from '../shared/WizardCard';
import WizardField from '../shared/WizardField';
import { inputClassName } from '../shared/formStyles';
import WizardNavRow from '../shared/WizardNavRow';
import WizardProgress from '../shared/WizardProgress';

interface Step5ReviewProps {
  onBack: () => void;
  goToStep: (step: number) => void;
}

const goalLabels: Record<GoalCode, string> = {
  GIAM: 'Giảm cân',
  DUY_TRI: 'Duy trì',
  TANG: 'Tăng cân',
};

const genderLabels = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

const ReviewRow: React.FC<{ label: string; value: string; onEdit: () => void }> = ({
  label,
  value,
  onEdit,
}) => (
  <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-3 last:border-b-0">
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-gray-900">{value}</div>
    </div>
    <button
      type="button"
      onClick={onEdit}
      className="rounded-md px-2 py-1 text-sm font-medium text-brand-green-dark transition hover:bg-brand-green-light"
    >
      Sửa
    </button>
  </div>
);

const measurementRegisterOptions = {
  setValueAs: (value: string) => (value === '' ? null : Number(value)),
};

const Step5Review: React.FC<Step5ReviewProps> = ({ onBack, goToStep }) => {
  const { state, updateData, reset } = useOnboarding();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OnboardingResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    mode: 'onChange',
    defaultValues: {
      waistCm: state.waistCm,
      hipCm: state.hipCm,
      neckCm: state.neckCm,
      bustCm: state.bustCm,
    },
  });

  const completeAndGoDashboard = () => {
    reset();
    navigate('/dashboard', { replace: true });
  };

  const onSubmit = async (data: Step5Data) => {
    if (!state.goalCode || !state.gender || !state.heightCm || !state.weightKg || !state.activityFactor) {
      toast.error('Thiếu thông tin onboarding. Vui lòng kiểm tra lại các bước trước.');
      return;
    }

    updateData(data);
    setLoading(true);
    try {
      const submitResult = await submitOnboarding({
        fullName: state.fullName,
        birthDate: state.birthDate,
        gender: state.gender,
        phone: state.phone,
        goalCode: state.goalCode,
        heightCm: state.heightCm,
        weightKg: state.weightKg,
        activityFactor: state.activityFactor,
        waistCm: data.waistCm,
        hipCm: data.hipCm,
        neckCm: data.neckCm,
        bustCm: data.bustCm,
      });

      await refreshUser();

      if (submitResult.constitutionError) {
        toast.warning(submitResult.constitutionError);
      }

      if (submitResult.goalMismatch && submitResult.constitution && submitResult.suggestedGoal) {
        setResult(submitResult);
      } else {
        toast.success('Hoàn tất onboarding.');
        completeAndGoDashboard();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <WizardCard>
        <WizardProgress current={4} />
        <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">Số đo và xác nhận</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Số đo là tùy chọn, nhưng sẽ giúp hệ thống phân loại thể trạng chính xác hơn.
        </p>

        <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <WizardField label="Vòng eo" optional error={errors.waistCm?.message}>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="72"
                  className={`${inputClassName(!!errors.waistCm)} pr-12`}
                  {...register('waistCm', measurementRegisterOptions)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
              </div>
            </WizardField>

            <WizardField label="Vòng hông" optional error={errors.hipCm?.message}>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="92"
                  className={`${inputClassName(!!errors.hipCm)} pr-12`}
                  {...register('hipCm', measurementRegisterOptions)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
              </div>
            </WizardField>

            <WizardField label="Vòng cổ" optional error={errors.neckCm?.message}>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="34"
                  className={`${inputClassName(!!errors.neckCm)} pr-12`}
                  {...register('neckCm', measurementRegisterOptions)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
              </div>
            </WizardField>

            <WizardField label="Vòng ngực" optional error={errors.bustCm?.message}>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="86"
                  className={`${inputClassName(!!errors.bustCm)} pr-12`}
                  {...register('bustCm', measurementRegisterOptions)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
              </div>
            </WizardField>
          </div>

          <div className="mt-7 rounded-md border border-gray-100 bg-gray-50 px-4">
            <ReviewRow
              label="Mục tiêu"
              value={state.goalCode ? goalLabels[state.goalCode] : 'Chưa chọn'}
              onEdit={() => goToStep(2)}
            />
            <ReviewRow
              label="Thông tin cá nhân"
              value={`${state.fullName || 'Chưa nhập'} · ${state.gender ? genderLabels[state.gender] : 'Chưa chọn'}`}
              onEdit={() => goToStep(3)}
            />
            <ReviewRow
              label="Chỉ số cơ bản"
              value={`${state.heightCm ?? '--'} cm · ${state.weightKg ?? '--'} kg · vận động ${state.activityFactor ?? '--'}`}
              onEdit={() => goToStep(4)}
            />
          </div>

          <WizardNavRow onBack={onBack} nextLabel="Hoàn tất" nextDisabled={!isValid} loading={loading} />
        </form>
      </WizardCard>

      {result?.goalMismatch && result.constitution && result.suggestedGoal && (
        <GoalRecommendationModal
          constitution={result.constitution.constitution}
          userGoal={result.userGoal}
          suggestedGoal={result.suggestedGoal}
          onComplete={completeAndGoDashboard}
        />
      )}
    </>
  );
};

export default Step5Review;
