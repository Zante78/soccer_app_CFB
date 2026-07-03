'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMultiStepForm } from '@/lib/hooks/useMultiStepForm';
import { Step1Welcome } from '@/components/guided-story/step-1-welcome';
import { Step2Anmeldegrund } from '@/components/guided-story/step-2-player-selection';
import { Step3PlayerData } from '@/components/guided-story/step-3-player-data';
import { Step4Upload } from '@/components/guided-story/step-4-upload';
import { Step5Eligibility } from '@/components/guided-story/step-5-eligibility';
import { Step6Consent } from '@/components/guided-story/step-6-consent';
import { Step7Payment } from '@/components/guided-story/step-7-payment';
import { Step8Completion } from '@/components/guided-story/step-8-completion';

type RegistrationReason = 'NEW_PLAYER' | 'TRANSFER' | 'RE_REGISTRATION';

/**
 * URL-Parameter parsen für personalisierten Einstieg:
 * `?ref=trainer:abate&team=u17-1` → { trainerRef: "abate", team: "u17-1" }
 *
 * Format-Grammatik: `ref=<role>:<slug>`. Roles: "trainer" | "passwart".
 * Aktuell wird nur "trainer" für die Sender-Zeile in Step 1 verwendet.
 */
function parseInvite(params: URLSearchParams): { senderName?: string; senderTeam?: string } {
  const ref = params.get('ref') ?? '';
  const team = params.get('team') ?? '';

  // Trainer-Slug → Anzeigename (siehe cfb-dfbnet-felder.md, Mannschaftswunsch-Liste)
  const TRAINER_NAMES: Record<string, string> = {
    'zierden': 'Yannick Zierden',
    'ates': 'Orhan Sabri Ates',
    'abate': 'Salvatore Abate',
    'schueler': 'Raphael Schüler',
    'hasanovic': 'Rasim Hasanovic',
    'saupper': 'Claudio Giuseppe Saupper',
    'dueren': 'Guido Düren',
    'scholz': 'Patrick Scholz',
    'schaetzle': 'Frank Schätzle',
    'scheer': 'Patrick Scheer',
    'araia': 'Mubi Araia',
    'kraemer': 'Henry Kraemer',
    'inci': 'Serdar Inci',
    'hummelt': 'Stefan Hummelt',
    'ketzer': 'Kevin Ketzer',
    'helm': 'Lukas Helm',
    'schenk': 'Karl Heinz Schenk',
    'arman': 'Can Arman',
    'oeztuerk': 'Sabri Öztürk',
    'bering': 'Vanessa Bering',
  };

  const TEAM_LABELS: Record<string, string> = {
    'u19': 'U19',
    'u17-1': 'U17-1',
    'u17-2': 'U17-2',
    'u15-1': 'U15-1',
    'u15-2': 'U15-2',
    'u14': 'U14',
    'u13-1': 'U13-1',
    'u13-2': 'U13-2',
    'u12-1': 'U12-1',
    'u12-2': 'U12-2',
    'u12-3': 'U12-3',
    'u10': 'U10-1',
    'u9-1': 'U9-1',
    'u9-2': 'U9-2',
    'u8': 'U8-1',
    'u7': 'U7-1 Bambini',
    '1-herren': '1. Mannschaft',
    '2-herren': '2. Mannschaft',
    'ah': 'Alte Herren',
    'ballschule': 'Ballschule',
  };

  const [role, slug] = ref.split(':');
  if (role === 'trainer' && slug && TRAINER_NAMES[slug]) {
    return {
      senderName: TRAINER_NAMES[slug],
      senderTeam: team && TEAM_LABELS[team] ? TEAM_LABELS[team] : undefined,
    };
  }

  return {}; // Fallback: Step 1 nutzt Default "CfB Ford Niehl"
}

function BeitragCalculator(teamId?: string): { annualFee: number; admissionFee: number } {
  // Beitragsordnung aus cfb-dfbnet-felder.md (Stand 07/2026, PREISERHOEHT)
  if (!teamId) return { annualFee: 300, admissionFee: 20 };
  const id = teamId.toLowerCase();
  if (id === 'ah') return { annualFee: 150, admissionFee: 20 };
  if (id === 'ballschule') return { annualFee: 220, admissionFee: 0 };
  // Alle U-Teams + Herren = "Aktives Mitglied" 300 EUR + 20 Aufnahmegebühr
  return { annualFee: 300, admissionFee: 20 };
}

function RegisterPageInner() {
  const searchParams = useSearchParams();
  const invite = parseInvite(searchParams);

  const { currentStep, formData, nextStep, prevStep, updateFormData } = useMultiStepForm({
    totalSteps: 8,
    onComplete: () => {
      // TODO: Submit to Supabase (Follow-up-Sprint)
      // eslint-disable-next-line no-console
      console.log('Registration completed!', formData);
    },
  });

  const handleStepData = (data: Record<string, unknown>) => {
    updateFormData(data);
    nextStep();
  };

  // Magic-Link + Registration-ID (dev-preview, in production von Supabase)
  const registrationId =
    (formData.registration_id as string) ||
    `REG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
  const magicLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/status/${registrationId}`
      : `/status/${registrationId}`;

  const registrationReason = formData.registration_reason as RegistrationReason | undefined;
  const teamId = formData.team_id as string | undefined;
  const birthDate = formData.birth_date as string | undefined;
  const playerName = `${formData.first_name ?? ''} ${formData.last_name ?? ''}`.trim() || 'Spieler';

  const { annualFee, admissionFee } = BeitragCalculator(teamId);

  switch (currentStep) {
    case 1:
      return (
        <Step1Welcome
          onNext={nextStep}
          senderName={invite.senderName}
          senderTeam={invite.senderTeam}
        />
      );

    case 2:
      return (
        <Step2Anmeldegrund
          onNext={handleStepData}
          onBack={prevStep}
          initialValue={registrationReason}
        />
      );

    case 3:
      return (
        <Step3PlayerData
          onNext={handleStepData}
          onBack={prevStep}
          initialData={formData}
          registrationReason={registrationReason}
        />
      );

    case 4:
      return (
        <Step4Upload
          onNext={handleStepData}
          onBack={prevStep}
          registrationReason={registrationReason}
          birthDate={birthDate}
          teamId={teamId}
        />
      );

    case 5:
      return (
        <Step5Eligibility
          onNext={handleStepData}
          onBack={prevStep}
          playerData={{
            birth_date: birthDate || '2000-01-01',
            team_id: teamId || '1-herren',
            previous_club: formData.previous_club as string | undefined,
            previous_team_deregistration_date: formData.previous_team_deregistration_date as string | undefined,
            previous_team_last_game: formData.previous_team_last_game as string | undefined,
          }}
          registrationReason={registrationReason}
        />
      );

    case 6:
      return (
        <Step6Consent
          onNext={handleStepData}
          onBack={prevStep}
          playerData={{
            first_name: (formData.first_name as string) || '',
            last_name: (formData.last_name as string) || '',
            birth_date: birthDate || '',
            team_id: teamId || '',
          }}
          registrationReason={registrationReason}
        />
      );

    case 7:
      return (
        <Step7Payment
          onNext={(data) => {
            updateFormData({ ...data, registration_id: registrationId });
            nextStep();
          }}
          onBack={prevStep}
          registrationId={registrationId}
          teamId={teamId}
          annualFee={annualFee}
          admissionFee={admissionFee}
          playerName={playerName}
        />
      );

    case 8:
      return (
        <Step8Completion
          magicLink={magicLink}
          registrationId={registrationId}
          playerName={playerName}
        />
      );

    default:
      return null;
  }
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-surface-0">
          <div className="w-12 h-12 border-b-2 border-primary rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterPageInner />
    </Suspense>
  );
}
