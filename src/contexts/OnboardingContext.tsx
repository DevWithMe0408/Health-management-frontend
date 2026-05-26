import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Gender, GoalCode } from '../types/refactorUi.types';

export interface OnboardingState {
  currentStep: number;
  goalCode: GoalCode | null;
  fullName: string;
  birthDate: string;
  gender: Gender | null;
  phone: string;
  heightCm: number | null;
  weightKg: number | null;
  activityFactor: number | null;
  waistCm: number | null;
  hipCm: number | null;
  neckCm: number | null;
  bustCm: number | null;
}

interface OnboardingContextType {
  state: OnboardingState;
  setStep: (step: number) => void;
  updateData: (data: Partial<OnboardingState>) => void;
  reset: () => void;
}

const STORAGE_KEY = 'onboarding-state';

const initialState: OnboardingState = {
  currentStep: 1,
  goalCode: null,
  fullName: '',
  birthDate: '',
  gender: null,
  phone: '',
  heightCm: null,
  weightKg: null,
  activityFactor: null,
  waistCm: null,
  hipCm: null,
  neckCm: null,
  bustCm: null,
};

const clampStep = (step: number) => Math.min(5, Math.max(1, step));

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<OnboardingState>;
        return {
          ...initialState,
          ...parsed,
          currentStep: clampStep(Number(parsed.currentStep) || 1),
        };
      }
    } catch (error) {
      console.warn('Failed to restore onboarding state:', error);
    }
    return initialState;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to persist onboarding state:', error);
    }
  }, [state]);

  const value = useMemo<OnboardingContextType>(
    () => ({
      state,
      setStep: (step) => setState((current) => ({ ...current, currentStep: clampStep(step) })),
      updateData: (data) => setState((current) => ({ ...current, ...data })),
      reset: () => {
        sessionStorage.removeItem(STORAGE_KEY);
        setState(initialState);
      },
    }),
    [state]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
