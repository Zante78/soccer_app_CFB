'use client';

import { WizardShell } from './wizard-shell';

interface Step1WelcomeProps {
  onNext: () => void;
  senderName?: string;
  senderTeam?: string;
}

export function Step1Welcome({
  onNext,
  senderName = 'CfB Ford Niehl',
  senderTeam,
}: Step1WelcomeProps) {
  const senderLabel = senderTeam ? `${senderName} (${senderTeam})` : senderName;

  return (
    <WizardShell step={1} maxWidth="wide">
      <div className="grid gap-16 md:gap-24 md:grid-cols-[1.15fr_1fr] md:items-start">
        {/* HERO */}
        <section className="animate-[fadeUp_400ms_100ms_both_ease-out]">
          <span className="eyebrow">Willkommen</span>
          <h1
            className="font-display font-normal leading-[0.92] tracking-[1px] text-primary mb-8"
            style={{ fontSize: 'clamp(52px, 9vw, 112px)' }}
          >
            Hallo.
            <span className="block text-primary-light">Los geht&apos;s.</span>
          </h1>
          <p
            className="font-body text-ink max-w-[520px] leading-relaxed mb-10"
            style={{ fontSize: 'clamp(15px, 1.8vw, 19px)' }}
          >
            Du wurdest von <strong className="text-primary font-semibold">{senderLabel}</strong>{' '}
            eingeladen, dich beim Verein anzumelden. Wir führen dich in wenigen Schritten durch
            alles, was der DFB dafür braucht.
          </p>
          <button type="button" onClick={onNext} className="btn-primary group">
            Anmeldung starten
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <span className="block mt-4 font-body text-sm text-ink-soft">
            Dauert etwa 8 Minuten · Du kannst jederzeit pausieren
          </span>
        </section>

        {/* EXPECTATIONS */}
        <aside
          className="animate-[fadeUp_400ms_220ms_both_ease-out]"
          aria-label="Was dich erwartet"
        >
          <h2 className="section-title">Was dich erwartet</h2>
          <ol className="list-none m-0 p-0 border-t border-surface-2">
            <ExpectRow num="01" title="Deine Angaben" time="2 min">
              Name, Geburtsdatum, Mannschaft. Wir prüfen die Sperrfrist automatisch.
            </ExpectRow>
            <ExpectRow num="02" title="Foto & Dokumente" time="3 min">
              Ein Passfoto vom Handy. Bei Vereinswechsel zusätzlich die Abmeldung.
            </ExpectRow>
            <ExpectRow num="03" title="Unterschrift & Beitrag" time="3 min">
              Digital unterschreiben, Beitrag per PayPal oder QR-Code beim Trainer.
            </ExpectRow>
          </ol>
        </aside>
      </div>
    </WizardShell>
  );
}

function ExpectRow({
  num,
  title,
  time,
  children,
}: {
  num: string;
  title: string;
  time: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[56px_1fr_auto] items-baseline py-6 border-b border-surface-2 gap-4">
      <span className="font-display text-[32px] leading-none text-primary tracking-tight">
        {num}
      </span>
      <div>
        <strong className="block font-body text-[17px] font-semibold text-ink mb-1 tracking-tight">
          {title}
        </strong>
        <span className="font-body text-sm text-ink-soft leading-relaxed">{children}</span>
      </div>
      <span className="font-accent font-semibold text-xs tracking-widest uppercase text-ink-soft whitespace-nowrap tabular-nums">
        {time}
      </span>
    </li>
  );
}
