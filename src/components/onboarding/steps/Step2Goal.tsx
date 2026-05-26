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

const goals: Array<{
  code: GoalCode;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    code: 'GIAM',
    title: 'Giảm cân',
    description: 'Phù hợp khi bạn muốn xuống cân an toàn (~0.5kg/tuần).',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    ),
  },
  {
    code: 'DUY_TRI',
    title: 'Duy trì cân nặng',
    description: 'Giữ ổn định thể trạng, xây dựng thói quen ăn lành mạnh.',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
      </svg>
    ),
  },
  {
    code: 'TANG',
    title: 'Tăng cân',
    description: 'Tăng cân lành mạnh, ưu tiên cơ và năng lượng.',
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ),
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
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
        Bạn muốn đạt mục tiêu gì?
      </h1>
      <p className="mt-2 text-sm leading-6 text-gray-600 md:text-base">
        Chúng tôi sẽ tùy chỉnh thực đơn theo mục tiêu này. Bạn có thể đổi sau.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-7 grid gap-3 md:grid-cols-3 md:gap-4">
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
                className={`group relative flex flex-col items-start gap-3 rounded-2xl border-2 p-5 text-left transition ${
                  selected
                    ? 'border-brand-green bg-brand-green-light'
                    : 'border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
                }`}
              >
                {selected && (
                  <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-green text-white">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12l5 5L20 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl ${
                    selected ? 'bg-white text-brand-green-dark' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {goal.icon}
                </div>
                <div>
                  <div className={`text-base font-bold ${selected ? 'text-brand-green-darker' : 'text-gray-900'}`}>
                    {goal.title}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-gray-600">{goal.description}</div>
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
