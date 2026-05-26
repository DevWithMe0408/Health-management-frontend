import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
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

const stepVariants: Variants = {
  initial: (direction: number) => ({ opacity: 0, x: direction > 0 ? 24 : -24 }),
  animate: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -24 : 24 }),
};

const OnboardingWizard: React.FC = () => {
  const { state, setStep } = useOnboarding();
  const [searchParams, setSearchParams] = useSearchParams();
  const [direction, setDirection] = useState(1);
  const { currentStep } = state;

  useEffect(() => {
    const stepFromUrl = Number(searchParams.get('step'));
    if (Number.isInteger(stepFromUrl) && stepFromUrl >= 1 && stepFromUrl <= 5) {
      const targetStep = Math.min(stepFromUrl, getAllowedStep(state));
      setDirection(targetStep >= currentStep ? 1 : -1);
      setStep(targetStep);
    }
    // Run once on first load so the URL can restore the visible step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSearchParams({ step: String(currentStep) }, { replace: true });
  }, [currentStep, setSearchParams]);

  const goToStep = (step: number) => {
    const targetStep = Math.min(step, getAllowedStep(state));
    setDirection(targetStep >= currentStep ? 1 : -1);
    setStep(targetStep);
  };
  const goNext = () => goToStep(currentStep + 1);
  const goBack = () => goToStep(currentStep - 1);

  return (
    <OnboardingShell>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={stepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {currentStep === 1 && <Step1Welcome onNext={goNext} />}
          {currentStep === 2 && <Step2Goal onNext={goNext} />}
          {currentStep === 3 && <Step3Personal onBack={goBack} onNext={goNext} />}
          {currentStep === 4 && <Step4Activity onBack={goBack} onNext={goNext} />}
          {currentStep === 5 && <Step5Review onBack={goBack} goToStep={goToStep} />}
        </motion.div>
      </AnimatePresence>
    </OnboardingShell>
  );
};

export default OnboardingWizard;
