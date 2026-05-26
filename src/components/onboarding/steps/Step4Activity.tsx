import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { step4Schema } from '../../../types/onboarding.schemas';
import type { Step4Data } from '../../../types/onboarding.schemas';
import WizardCard from '../shared/WizardCard';
import WizardField from '../shared/WizardField';
import { inputClassName } from '../shared/formStyles';
import WizardNavRow from '../shared/WizardNavRow';
import WizardProgress from '../shared/WizardProgress';

interface Step4ActivityProps {
  onBack: () => void;
  onNext: () => void;
}

const activityOptions = [
  { value: 1.2, title: 'Ít vận động', description: 'Làm việc văn phòng, ít tập luyện' },
  { value: 1.375, title: 'Nhẹ', description: 'Tập nhẹ 1-3 buổi mỗi tuần' },
  { value: 1.55, title: 'Vừa', description: 'Tập đều 3-5 buổi mỗi tuần' },
  { value: 1.725, title: 'Cao', description: 'Tập nặng 6-7 buổi mỗi tuần' },
  { value: 1.9, title: 'Rất cao', description: 'Vận động viên hoặc lao động nặng' },
];

const Step4Activity: React.FC<Step4ActivityProps> = ({ onBack, onNext }) => {
  const { state, updateData } = useOnboarding();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    mode: 'onChange',
    defaultValues: {
      heightCm: state.heightCm ?? undefined,
      weightKg: state.weightKg ?? undefined,
      activityFactor: state.activityFactor ?? undefined,
    },
  });
  const selectedActivity = watch('activityFactor');

  const onSubmit = (data: Step4Data) => {
    updateData(data);
    onNext();
  };

  return (
    <WizardCard>
      <WizardProgress current={3} />
      <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">Chỉ số cơ bản</h1>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        Chiều cao, cân nặng và mức vận động là dữ liệu nền để tính BMI, BMR và TDEE.
      </p>

      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <WizardField label="Chiều cao" required error={errors.heightCm?.message}>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="168"
                className={`${inputClassName(!!errors.heightCm)} pr-12`}
                {...register('heightCm', { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
            </div>
          </WizardField>

          <WizardField label="Cân nặng" required error={errors.weightKg?.message}>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="58.5"
                className={`${inputClassName(!!errors.weightKg)} pr-12`}
                {...register('weightKg', { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">kg</span>
            </div>
          </WizardField>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold text-gray-800">
            Mức vận động <span className="text-red-500">*</span>
          </div>
          <div className="grid gap-2">
            {activityOptions.map((option) => {
              const selected = selectedActivity === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setValue('activityFactor', option.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={`rounded-md border p-3 text-left transition ${
                    selected
                      ? 'border-brand-green bg-brand-green-light ring-2 ring-brand-green/20'
                      : 'border-gray-200 bg-white hover:border-brand-green/50 hover:bg-emerald-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-950">{option.title}</div>
                      <div className="mt-0.5 text-xs text-gray-500">{option.description}</div>
                    </div>
                    <span className="text-sm font-semibold text-brand-green-dark">{option.value}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.activityFactor && (
            <p className="mt-2 text-sm font-medium text-red-600">{errors.activityFactor.message}</p>
          )}
        </div>

        <WizardNavRow onBack={onBack} nextDisabled={!isValid} />
      </form>
    </WizardCard>
  );
};

export default Step4Activity;
