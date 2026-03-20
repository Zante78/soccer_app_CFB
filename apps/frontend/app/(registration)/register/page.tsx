'use client';

import { useMultiStepForm } from '@/lib/hooks/useMultiStepForm';
import { Step1Welcome } from '@/components/guided-story/step-1-welcome';
import { Step2PlayerSelection } from '@/components/guided-story/step-2-player-selection';
import { Step3PlayerData } from '@/components/guided-story/step-3-player-data';
import { Step4Upload } from '@/components/guided-story/step-4-upload';
import { Step5Eligibility } from '@/components/guided-story/step-5-eligibility';
import { Step6Consent } from '@/components/guided-story/step-6-consent';
import { Step7Payment } from '@/components/guided-story/step-7-payment';
import { Step8Completion } from '@/components/guided-story/step-8-completion';
import type { EligibilityResult } from '@packages/shared-types';

type RegistrationFormData = {
  is_new_player: boolean;
  selected_player_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  nationality: string;
  registration_number: string;
  team_id: string;
  previous_club: string;
  previous_team_deregistration_date: string;
  previous_team_last_game: string;
  photo_file: File | null;
  document_files: File[];
  eligibility_result: EligibilityResult;
  consents: Record<string, boolean>;
  signature_data: string;
  payment_method: string;
  payment_id: string;
  registration_id: string;
};

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
  } = useMultiStepForm<RegistrationFormData>({
    totalSteps: 8,
    onComplete: () => {
      console.log('Registration completed!', formData);
      // TODO: Submit to Supabase
    },
  });

  const handleStepData = (data: Partial<RegistrationFormData>) => {
    updateFormData(data);
    nextStep();
  };

  // Generate demo magic link (in production: from Supabase)
  const registrationId = formData.registration_id ?? 'REG-' + Date.now();
  const magicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/status/${registrationId}`;

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Progress Bar */}
      {!isFirstStep && currentStep < 8 && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Schritt {currentStep} von {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Fortschritt"
          >
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
          <Step3PlayerData
            onNext={handleStepData}
            onBack={prevStep}
            initialData={formData}
          />
        )}

        {currentStep === 4 && (
          <Step4Upload
            onNext={handleStepData}
            onBack={prevStep}
          />
        )}

        {currentStep === 5 && (
          <Step5Eligibility
            onNext={handleStepData}
            onBack={prevStep}
            playerData={{
              birth_date: formData.birth_date || '2000-01-01',
              team_id: formData.team_id || 'team-1-herren',
              previous_club: formData.previous_club,
              previous_team_deregistration_date: formData.previous_team_deregistration_date,
              previous_team_last_game: formData.previous_team_last_game,
            }}
          />
        )}

        {currentStep === 6 && (
          <Step6Consent
            onNext={handleStepData}
            onBack={prevStep}
            playerData={{
              first_name: formData.first_name || '',
              last_name: formData.last_name || '',
              birth_date: formData.birth_date || '',
              team_id: formData.team_id || '',
            }}
          />
        )}

        {currentStep === 7 && (
          <Step7Payment
            onNext={(data) => {
              updateFormData({ ...data, registration_id: registrationId });
              nextStep();
            }}
            onBack={prevStep}
            registrationId={registrationId}
          />
        )}

        {currentStep === 8 && (
          <Step8Completion
            magicLink={magicLink}
            registrationId={registrationId}
            playerName={`${formData.first_name || ''} ${formData.last_name || ''}`.trim() || 'Spieler'}
          />
        )}
      </div>

      {/* Debug Info (nur Development) */}
      {process.env.NODE_ENV === 'development' && currentStep < 8 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
          <p className="text-xs font-mono text-gray-700">
            <strong>Debug:</strong> Step {currentStep}/{totalSteps}
          </p>
          <pre className="text-xs font-mono text-gray-700 mt-2 max-h-40 overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
