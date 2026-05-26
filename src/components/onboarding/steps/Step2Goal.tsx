import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { step2Schema } from '../../../types/onboarding.schemas';
import type { Step2Data } from '../../../types/onboarding.schemas';
import type { GoalCode } from '../../../types/refactorUi.types';
import WizardCard from '../shared/WizardCard';
import WizardNavRow from '../shared/WizardNavRow';
import WizardProgress from '../shared/WizardProgress';

interface Step2GoalProps {
  onNext: () => void;
}

const goals: Array<{ code: GoalCode; title: string; description: string }> = [
  {
    code: 'GIAM',
    title: 'Giảm cân',
    description: 'Tối ưu năng lượng nạp vào và theo dõi tiến độ giảm cân lành mạnh.',
  },
  {
    code: 'DUY_TRI',
    title: 'Duy trì',
    description: 'Giữ thể trạng ổn định, cân bằng vận động và dinh dưỡng hằng ngày.',
  },
  {
    code: 'TANG',
    title: 'Tăng cân',
    description: 'Tăng cân có kiểm soát dựa trên nhu cầu năng lượng và chỉ số cơ thể.',
  },
];

const Step2Goal: React.FC<Step2GoalProps> = ({ onNext }) => {
  const { state, updateData } = useOnboarding();
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      goalCode: state.goalCode || undefined,
    },
  });
  const selectedGoal = watch('goalCode');

  const onSubmit = (data: Step2Data) => {
    updateData(data);
    onNext();
  };

  return (
    <WizardCard>
      <WizardProgress current={1} />
      <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">Mục tiêu của bạn là gì?</h1>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        Mục tiêu giúp hệ thống cá nhân hóa dashboard và các nhắc nhở sau này.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-6 grid gap-3">
          {goals.map((goal) => {
            const selected = selectedGoal === goal.code;
            return (
              <button
                key={goal.code}
                type="button"
                onClick={() => {
                  setValue('goalCode', goal.code, { shouldDirty: true, shouldValidate: true });
                  updateData({ goalCode: goal.code });
                }}
                className={`rounded-md border p-4 text-left transition ${
                  selected
                    ? 'border-brand-green bg-brand-green-light ring-2 ring-brand-green/20'
                    : 'border-gray-200 bg-white hover:border-brand-green/50 hover:bg-emerald-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-gray-950">{goal.title}</div>
                    <div className="mt-1 text-sm leading-6 text-gray-600">{goal.description}</div>
                  </div>
                  <span
                    className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                      selected ? 'border-brand-green bg-brand-green text-white' : 'border-gray-300'
                    }`}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {errors.goalCode && (
          <p className="mt-2 text-sm font-medium text-red-600">{errors.goalCode.message}</p>
        )}
        <WizardNavRow showBack={false} nextDisabled={!isValid} />
      </form>
    </WizardCard>
  );
};

export default Step2Goal;
