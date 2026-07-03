/**
 * Wiederverwendbare Wizard-Komponenten für alle 8 Steps
 * — WizardNav: sticky Header mit Logo-Mark + Progress-Marker
 * — WizardFooter: Copyright + Legal-Links
 * — WizardShell: einheitliches Layout mit Grid rows
 */

interface WizardShellProps {
  step: number;
  totalSteps?: number;
  maxWidth?: 'default' | 'wide';
  children: React.ReactNode;
  progressLabel?: string; // Für Step 8 "Fertig · 08/08" statt "Schritt 08 von 08"
}

export function WizardShell({
  step,
  totalSteps = 8,
  maxWidth = 'default',
  children,
  progressLabel,
}: WizardShellProps) {
  const containerWidth = maxWidth === 'wide' ? 'max-w-[1200px]' : 'max-w-[780px]';

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-surface-0">
      <WizardNav step={step} totalSteps={totalSteps} progressLabel={progressLabel} />
      <main className={`${containerWidth} mx-auto w-full px-4 sm:px-8 lg:px-20 py-12 md:py-24`}>
        {children}
      </main>
      <WizardFooter maxWidth={maxWidth} />
    </div>
  );
}

export function WizardNav({
  step,
  totalSteps = 8,
  progressLabel,
}: {
  step: number;
  totalSteps?: number;
  progressLabel?: string;
}) {
  return (
    <nav
      className="h-[72px] bg-primary/95 backdrop-blur-md border-b border-white/10 flex items-center px-4 sm:px-8 lg:px-20 text-white"
      role="navigation"
      aria-label="Wizard-Navigation"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-white rounded-full grid place-items-center font-body font-bold text-[15px] text-primary tracking-tighter">
          CfB
        </div>
        <div className="font-accent font-bold text-[15px] tracking-wide leading-tight">
          CfB Ford Köln-Niehl 09/52
          <span className="block font-normal text-[11px] opacity-70 tracking-widest uppercase mt-0.5">
            Digitale Passstelle
          </span>
        </div>
      </div>
      <div className="ml-auto">
        {progressLabel ? (
          <span className="progress-marker inline-flex items-center gap-1.5">
            {progressLabel}
          </span>
        ) : (
          <span className="progress-marker">
            Schritt{' '}
            <strong>{String(step).padStart(2, '0')}</strong> von{' '}
            <strong>{String(totalSteps).padStart(2, '0')}</strong>
          </span>
        )}
      </div>
    </nav>
  );
}

export function WizardFooter({ maxWidth = 'default' }: { maxWidth?: 'default' | 'wide' }) {
  const containerWidth = maxWidth === 'wide' ? 'max-w-[1200px]' : 'max-w-[780px]';
  return (
    <footer
      className={`${containerWidth} mx-auto w-full px-4 sm:px-8 lg:px-20 py-6 pb-10 flex flex-wrap justify-between items-center border-t border-surface-2 font-body text-sm text-ink-soft gap-4`}
    >
      <div>© CfB Ford Köln-Niehl 09/52 e.V.</div>
      <div className="flex gap-3">
        <a
          href="#"
          className="text-ink-soft underline decoration-surface-2 underline-offset-2 hover:text-ink hover:decoration-current"
        >
          Datenschutz
        </a>
        <span>·</span>
        <a
          href="#"
          className="text-ink-soft underline decoration-surface-2 underline-offset-2 hover:text-ink hover:decoration-current"
        >
          Impressum
        </a>
        <span>·</span>
        <a
          href="mailto:michael.dobiat@cfbfordniehl.de"
          className="text-ink-soft underline decoration-surface-2 underline-offset-2 hover:text-ink hover:decoration-current"
        >
          Kontakt
        </a>
      </div>
    </footer>
  );
}

/**
 * Kontext-Chip: zeigt was in vorherigem Step gewählt wurde.
 * Wird in Steps 3-7 verwendet.
 */
export function ContextChip({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="context-chip">
      {icon}
      {children}
    </span>
  );
}

/**
 * Actions-Bar unten mit Zurück + Weiter Button.
 * Weiter-Text ist immer spezifisch, kein generisches "Weiter".
 */
interface WizardActionsProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}

export function WizardActions({ onBack, onNext, nextLabel, nextDisabled }: WizardActionsProps) {
  return (
    <div className="mt-10 flex justify-between items-center gap-4 flex-col-reverse sm:flex-row animate-[fadeUp_400ms_400ms_both_ease-out]">
      <button type="button" onClick={onBack} className="btn-back">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5"
        >
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Zurück
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="btn-primary w-full sm:w-auto justify-center"
      >
        {nextLabel}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
