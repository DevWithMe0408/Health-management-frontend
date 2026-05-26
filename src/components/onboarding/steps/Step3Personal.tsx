import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { computeAge, step3Schema } from '../../../types/onboarding.schemas';
import type { Step3Data } from '../../../types/onboarding.schemas';
import WizardCard from '../shared/WizardCard';
import WizardField from '../shared/WizardField';
import { inputClassName } from '../shared/formStyles';
import WizardNavRow from '../shared/WizardNavRow';
import WizardProgress from '../shared/WizardProgress';

interface Step3PersonalProps {
  onBack: () => void;
  onNext: () => void;
}

const goalCopy = {
  GIAM: 'giảm cân hiệu quả',
  DUY_TRI: 'duy trì thể trạng ổn định',
  TANG: 'tăng cân lành mạnh',
};

const Step3Personal: React.FC<Step3PersonalProps> = ({ onBack, onNext }) => {
  const { state, updateData } = useOnboarding();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    mode: 'onChange',
    defaultValues: {
      fullName: state.fullName,
      birthDate: state.birthDate,
      gender: state.gender || undefined,
      phone: state.phone,
    },
  });
  const birthDate = watch('birthDate');
  const age = birthDate ? computeAge(birthDate) : null;

  const onSubmit = (data: Step3Data) => {
    updateData(data);
    onNext();
  };

  return (
    <WizardCard>
      <WizardProgress current={2} />
      <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">Một chút về bạn</h1>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        Để {goalCopy[state.goalCode || 'DUY_TRI']}, chúng tôi cần biết một vài thông tin cơ bản.
      </p>

      <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <WizardField label="Họ và tên" required error={errors.fullName?.message} colSpan={2}>
            <input
              type="text"
              placeholder="VD. Nguyễn Minh Anh"
              className={inputClassName(!!errors.fullName)}
              {...register('fullName')}
            />
          </WizardField>

          <WizardField
            label="Ngày sinh"
            required
            error={errors.birthDate?.message}
            helper={age ? `Bạn ${age} tuổi` : undefined}
          >
            <input type="date" className={inputClassName(!!errors.birthDate)} {...register('birthDate')} />
          </WizardField>

          <WizardField label="Giới tính" required error={errors.gender?.message}>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'MALE', label: 'Nam' },
                { value: 'FEMALE', label: 'Nữ' },
                { value: 'OTHER', label: 'Khác' },
              ].map((option) => {
                const selected = watch('gender') === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setValue('gender', option.value as 'MALE' | 'FEMALE' | 'OTHER', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition ${
                      selected
                        ? 'border-brand-green bg-brand-green-light text-brand-green-darker'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </WizardField>

          <WizardField label="Số điện thoại" optional error={errors.phone?.message} colSpan={2}>
            <input
              type="tel"
              placeholder="VD. 0912345678"
              className={inputClassName(!!errors.phone)}
              {...register('phone')}
            />
          </WizardField>
        </div>

        <WizardNavRow onBack={onBack} nextDisabled={!isValid} />
      </form>
    </WizardCard>
  );
};

export default Step3Personal;
