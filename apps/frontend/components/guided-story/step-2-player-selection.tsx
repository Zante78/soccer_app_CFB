'use client';

import { useState } from 'react';
import { WizardShell, WizardActions } from './wizard-shell';

type RegistrationReason = 'NEW_PLAYER' | 'TRANSFER' | 'RE_REGISTRATION';

interface Step2AnmeldegrundProps {
  onNext: (data: { registration_reason: RegistrationReason }) => void;
  onBack: () => void;
  initialValue?: RegistrationReason;
}

interface Option {
  value: RegistrationReason;
  meta: string;
  title: string;
  desc: string;
  consequence: string;
  consequenceOk?: boolean;
}

const OPTIONS: Option[] = [
  {
    value: 'NEW_PLAYER',
    meta: 'Erstanmeldung',
    title: 'Der Spieler hat vorher noch nie in einem Verein gespielt',
    desc: 'Erstmal-Registrierung beim DFB. Nur Stammdaten und Passfoto nötig — keine Nachweise vom Vorverein.',
    consequence: 'Sofort spielberechtigt',
    consequenceOk: true,
  },
  {
    value: 'TRANSFER',
    meta: 'Vereinswechsel',
    title: 'Der Spieler kommt von einem anderen Verein',
    desc: 'Wir brauchen den Namen des Vorvereins, das Abmeldedatum und wann das letzte Spiel dort war. Wir prüfen automatisch, ab wann er beim CfB spielen darf.',
    consequence: 'Sperrfrist möglich · 1-6 Monate je nach Alter',
  },
  {
    value: 'RE_REGISTRATION',
    meta: 'Wiederanmeldung',
    title: 'Der Spieler war schon einmal in einem Verein — mit Pause',
    desc: 'Für Rückkehrer, die eine Zeit lang nicht angemeldet waren und jetzt wieder einsteigen. Falls die alte Passnummer noch bekannt ist, bring sie mit — hilft uns bei der Prüfung.',
    consequence: 'Prüfung im Einzelfall',
  },
];

export function Step2Anmeldegrund({ onNext, onBack, initialValue }: Step2AnmeldegrundProps) {
  const [selected, setSelected] = useState<RegistrationReason | null>(initialValue ?? null);

  const handleContinue = () => {
    if (selected) onNext({ registration_reason: selected });
  };

  return (
    <WizardShell step={2}>
      <section className="animate-[fadeUp_400ms_100ms_both_ease-out] mb-12">
        <span className="eyebrow">Anmeldegrund</span>
        <h1 className="headline">Wie ist die Situation?</h1>
        <p className="headline-sub">
          Wir stellen ein paar Fragen abhängig davon, ob der Spieler zum ersten Mal in einem Verein
          spielt oder vorher schon woanders war. Das entscheidet, welche Nachweise wir brauchen und
          ob eine Sperrfrist läuft.
        </p>
      </section>

      <div
        className="flex flex-col gap-3.5 animate-[fadeUp_400ms_220ms_both_ease-out]"
        role="radiogroup"
        aria-label="Anmeldegrund"
      >
        {OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            option={opt}
            isSelected={selected === opt.value}
            onSelect={() => setSelected(opt.value)}
          />
        ))}
      </div>

      <p className="mt-8 pt-6 border-t border-surface-2 font-body text-sm text-ink-soft leading-relaxed animate-[fadeUp_400ms_320ms_both_ease-out]">
        Sonderfall: Der Spieler kommt aus dem Ausland?{' '}
        <a
          href="mailto:michael.dobiat@cfbfordniehl.de?subject=Internationaler%20Transfer"
          className="text-primary font-medium underline decoration-primary-light underline-offset-2 hover:text-primary-dark hover:decoration-primary"
        >
          Melde dich direkt beim Passwart
        </a>{' '}
        — das läuft über einen anderen DFB-Prozess.
      </p>

      <WizardActions
        onBack={onBack}
        onNext={handleContinue}
        nextDisabled={!selected}
        nextLabel="Weiter zu den Spielerdaten"
      />
    </WizardShell>
  );
}

function OptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: Option;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={`grid grid-cols-[44px_1fr] gap-5 p-6 md:p-7 bg-white rounded-md text-left cursor-pointer transition-all items-start ${
        isSelected
          ? 'border-2 border-primary'
          : 'border-2 border-surface-2 hover:border-primary-light'
      } focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40`}
    >
      <span
        className={`w-6 h-6 mt-1 rounded-full border-2 grid place-items-center bg-white transition-colors ${
          isSelected ? 'border-primary bg-primary' : 'border-surface-2'
        }`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-3.5 h-3.5 text-white transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <span className="flex flex-col gap-1.5">
        <span
          className={`font-accent font-semibold text-xs tracking-widest uppercase ${
            isSelected ? 'text-primary-dark' : 'text-primary'
          }`}
        >
          {option.meta}
        </span>
        <span className="font-body text-lg font-semibold text-ink tracking-tight">
          {option.title}
        </span>
        <span className="font-body text-[15px] text-ink-soft leading-relaxed mt-1">
          {option.desc}
        </span>
        <span className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-sm font-accent font-semibold text-xs tracking-wide uppercase self-start bg-surface-1 text-primary-dark">
          {option.consequenceOk ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-accent"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
          {option.consequence}
        </span>
      </span>
    </button>
  );
}

// Legacy-Alias — die register/page.tsx nutzt noch den alten Namen.
// Wird beim komplett-Refactor der register/page.tsx entfernt.
export { Step2Anmeldegrund as Step2PlayerSelection };

