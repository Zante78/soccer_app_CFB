import { useState } from 'react';

export interface UseMultiStepFormProps {
  totalSteps: number;
  onComplete: () => void;
}

export function useMultiStepForm({ totalSteps, onComplete }: UseMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});

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

  const updateFormData = (stepData: Record<string, any>) => {
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
