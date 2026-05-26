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
  { value: 1.2, emoji: '🪑', title: 'Ít vận động', description: 'Làm văn phòng cả ngày, hầu như không tập' },
  { value: 1.375, emoji: '🚶', title: 'Vận động nhẹ', description: 'Đi bộ thường xuyên, tập 1-3 buổi/tuần' },
  { value: 1.55, emoji: '🏃', title: 'Vận động vừa', description: 'Tập đều 3-5 buổi/tuần' },
  { value: 1.725, emoji: '💪', title: 'Vận động nhiều', description: 'Tập 6-7 buổi/tuần' },
  { value: 1.9, emoji: '🔥', title: 'Rất vận động', description: 'Lao động chân tay nặng + tập gym' },
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
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                    selected
                      ? 'border-brand-green bg-brand-green-light'
                      : 'border-gray-100 bg-white hover:border-emerald-200'
                  }`}
                >
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-white text-2xl">
                    {option.emoji}
                  </span>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${selected ? 'text-brand-green-darker' : 'text-gray-900'}`}>
                      {option.title}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">{option.description}</div>
                  </div>
                  <span
                    className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full transition-all duration-200 ${
                      selected
                        ? 'bg-brand-green text-white shadow-md shadow-brand-green/40'
                        : 'border-2 border-gray-200 bg-white'
                    }`}
                    style={selected ? { animation: 'wizardPop 200ms ease-out' } : undefined}
                  >
                    {selected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12l5 5L20 7"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
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
