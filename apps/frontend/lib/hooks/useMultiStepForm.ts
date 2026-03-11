import { useState } from 'react';

export interface UseMultiStepFormProps<T extends Record<string, unknown> = Record<string, unknown>> {
  totalSteps: number;
  onComplete: () => void;
  initialData?: Partial<T>;
}

export function useMultiStepForm<T extends Record<string, unknown> = Record<string, unknown>>({ totalSteps, onComplete, initialData }: UseMultiStepFormProps<T>) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<T>>((initialData ?? {}) as Partial<T>);

  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const updateFormData = (stepData: Partial<T>) => {
    setFormData((prev) => ({
      ...prev,
      ...stepData,
    }));
  };

  return {
    currentStep,
    totalSteps,
    progress,
    formData,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
  };
}
