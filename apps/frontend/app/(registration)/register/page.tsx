'use client';

import { useMultiStepForm } from '@/lib/hooks/useMultiStepForm';
import { Step1Welcome } from '@/components/guided-story/step-1-welcome';
import { Step2PlayerSelection } from '@/components/guided-story/step-2-player-selection';

export default function RegisterPage() {
  const {
    currentStep,
    totalSteps,
    progress,
    formData,
    nextStep,
    prevStep,
    updateFormData,
    isFirstStep,
  } = useMultiStepForm({
    totalSteps: 8,
    onComplete: () => {
      console.log('Registration completed!', formData);
      // TODO: Submit to Supabase
    },
  });

  const handleStepData = (data: Record<string, any>) => {
    updateFormData(data);
    nextStep();
  };

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Progress Bar */}
      {!isFirstStep && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Schritt {currentStep} von {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-2xl mx-auto">
        {currentStep === 1 && <Step1Welcome onNext={nextStep} />}

        {currentStep === 2 && (
          <Step2PlayerSelection
            onNext={handleStepData}
            onBack={prevStep}
          />
        )}

        {currentStep === 3 && (
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-4">Step 3: Data Input</h2>
            <p className="text-gray-600 mb-6">Coming soon...</p>
            <div className="flex gap-4">
              <button onClick={prevStep} className="btn-secondary flex-1">
                Zurück
              </button>
              <button onClick={() => handleStepData({})} className="btn-primary flex-1">
                Weiter
              </button>
            </div>
          </div>
        )}

        {currentStep > 3 && (
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-4">Step {currentStep}</h2>
            <p className="text-gray-600 mb-6">
              Weitere Steps werden in Phase 2 implementiert
            </p>
            <div className="flex gap-4">
              <button onClick={prevStep} className="btn-secondary flex-1">
                Zurück
              </button>
              <button onClick={nextStep} className="btn-primary flex-1">
                Weiter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Debug Info (nur Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
          <p className="text-xs font-mono text-gray-600">
            <strong>Debug:</strong> Step {currentStep}/{totalSteps}
          </p>
          <pre className="text-xs font-mono text-gray-500 mt-2 max-h-40 overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
