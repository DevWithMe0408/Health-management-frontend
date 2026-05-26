import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';
import OnboardingShell from './shared/OnboardingShell';
import Step1Welcome from './steps/Step1Welcome';
import Step2Goal from './steps/Step2Goal';
import Step3Personal from './steps/Step3Personal';
import Step4Activity from './steps/Step4Activity';
import Step5Review from './steps/Step5Review';

const getAllowedStep = (state: ReturnType<typeof useOnboarding>['state']) => {
  if (!state.goalCode) return 2;
  if (!state.fullName || !state.birthDate || !state.gender) return 3;
  if (!state.heightCm || !state.weightKg || !state.activityFactor) return 4;
  return 5;
};

const OnboardingWizard: React.FC = () => {
  const { state, setStep } = useOnboarding();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentStep } = state;

  useEffect(() => {
    const stepFromUrl = Number(searchParams.get('step'));
    if (Number.isInteger(stepFromUrl) && stepFromUrl >= 1 && stepFromUrl <= 5) {
      setStep(Math.min(stepFromUrl, getAllowedStep(state)));
    }
    // Run once on first load so the URL can restore the visible step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSearchParams({ step: String(currentStep) }, { replace: true });
  }, [currentStep, setSearchParams]);

  const goToStep = (step: number) => setStep(Math.min(step, getAllowedStep(state)));
  const goNext = () => goToStep(currentStep + 1);
  const goBack = () => goToStep(currentStep - 1);

  return (
    <OnboardingShell>
      {currentStep === 1 && <Step1Welcome onNext={goNext} />}
      {currentStep === 2 && <Step2Goal onNext={goNext} />}
      {currentStep === 3 && <Step3Personal onBack={goBack} onNext={goNext} />}
      {currentStep === 4 && <Step4Activity onBack={goBack} onNext={goNext} />}
      {currentStep === 5 && <Step5Review onBack={goBack} goToStep={goToStep} />}
    </OnboardingShell>
  );
};

export default OnboardingWizard;
