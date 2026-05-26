import React from 'react';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';

const OnboardingWizardPage: React.FC = () => (
  <OnboardingProvider>
    <OnboardingWizard />
  </OnboardingProvider>
);

export default OnboardingWizardPage;
