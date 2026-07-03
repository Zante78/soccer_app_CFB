'use client';

import { useMemo, useState } from 'react';
import { WizardShell, WizardActions } from './wizard-shell';

type FeeMethod = 'PAYPAL' | 'CASH' | 'INVOICE';
type Rhythm = 'YEARLY' | 'HALF_YEARLY';

interface Step7PaymentProps {
  onNext: (data: {
    payment_method: FeeMethod;
    payment_id?: string;
    sepa_rhythm: Rhythm;
    iban: string;
    account_holder: string;
  }) => void;
  onBack: () => void;
  registrationId: string;
  teamId?: string;
  /** Jahresbeitrag in Euro (aus Beitragsordnung, Team-abhängig). Default 300 für Aktive. */
  annualFee?: number;
  /** Aufnahmegebühr in Euro. Default 20, ist bei Ballschule 0. */
  admissionFee?: number;
  playerName?: string;
}

interface FeeOption {
  value: FeeMethod;
  title: string;
  desc: string;
  time: string;
  recommended?: boolean;
  icon: React.ReactNode;
}

const FEE_OPTIONS: FeeOption[] = [
  {
    value: 'PAYPAL',
    title: 'PayPal',
    desc: 'Direkt über dein PayPal-Konto. Antrag geht sofort in Bearbeitung.',
    time: 'Sofort',
    recommended: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="6" y1="16" x2="10" y2="16" />
      </svg>
    ),
  },
  {
    value: 'CASH',
    title: 'Barzahlung beim Trainer',
    desc: 'QR-Code beim nächsten Training zeigen — Trainer scannt und bestätigt.',
    time: '2–5 Tage',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="7" y="7" width="4" height="4" />
        <rect x="13" y="7" width="4" height="4" />
        <rect x="7" y="13" width="4" height="4" />
        <line x1="13" y1="13" x2="13" y2="17" />
        <line x1="17" y1="13" x2="17" y2="17" />
        <line x1="13" y1="17" x2="17" y2="17" />
      </svg>
    ),
  },
  {
    value: 'INVOICE',
    title: 'Rechnung per Email',
    desc: 'Passwart schickt eine Rechnung mit Vereins-IBAN, du überweist innerhalb 14 Tagen.',
    time: 'Bis 14 Tage',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
];

function formatEuro(v: number): string {
  return v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function Step7Payment({
  onNext,
  onBack,
  teamId,
  annualFee = 300,
  admissionFee = 20,
  playerName,
}: Step7PaymentProps) {
  const [method, setMethod] = useState<FeeMethod>('PAYPAL');
  const [rhythm, setRhythm] = useState<Rhythm>('HALF_YEARLY');
  const [iban, setIban] = useState('');
  const [accountHolder, setAccountHolder] = useState(playerName ?? '');

  const showAdmission = admissionFee > 0;
  const halfYearlyAmount = annualFee / 2;

  const ctaLabel = useMemo(() => {
    const feeStr = `${formatEuro(admissionFee)} €`;
    if (!showAdmission) return `Weiter · SEPA einrichten`;
    if (method === 'PAYPAL') return `Aufnahmegebühr bezahlen · ${feeStr}`;
    if (method === 'CASH') return `QR-Code erzeugen · ${feeStr}`;
    return `Rechnung anfordern · ${feeStr}`;
  }, [method, admissionFee, showAdmission]);

  const canContinue = iban.trim().length >= 15 && accountHolder.trim().length >= 3;

  const handleContinue = () => {
    if (!canContinue) return;
    onNext({
      payment_method: method,
      sepa_rhythm: rhythm,
      iban: iban.trim(),
      account_holder: accountHolder.trim(),
    });
  };

  const contextChips: React.ReactNode[] = [];
  if (teamId) {
    contextChips.push(
      <span key="team" className="context-chip">{teamId.toUpperCase()}</span>
    );
    contextChips.push(
      <span key="type" className="context-chip">Aktives Mitglied</span>
    );
  }

  return (
    <WizardShell step={7}>
      <section className="animate-[fadeUp_400ms_100ms_both_ease-out] mb-10">
        <span className="eyebrow">Zahlung</span>
        <h1 className="headline">Beitrag &amp; Aufnahme.</h1>
        <p className="headline-sub">
          {showAdmission
            ? 'Zwei getrennte Positionen: die einmalige Aufnahmegebühr und der laufende Jahresbeitrag. Der Jahresbeitrag wird über SEPA-Lastschrift eingezogen — einmalig oder halbjährlich, wie du magst.'
            : 'Der Jahresbeitrag wird über SEPA-Lastschrift eingezogen — einmalig oder halbjährlich, wie du magst.'}
        </p>
      </section>

      {contextChips.length > 0 && (
        <div className="flex gap-2.5 flex-wrap mb-8 animate-[fadeUp_400ms_160ms_both_ease-out]">
          {contextChips}
        </div>
      )}

      {/* Sektion 1 — Aufnahmegebühr */}
      {showAdmission && (
        <section className="bg-white border border-surface-2 rounded-md p-7 sm:p-8 mb-6 animate-[fadeUp_400ms_220ms_both_ease-out]">
          <div className="flex items-baseline justify-between gap-4 flex-wrap mb-1.5">
            <h2 className="font-display font-normal leading-none tracking-wide text-primary" style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}>
              Aufnahmegebühr
            </h2>
            <span
              className="font-display font-normal leading-none tracking-wide text-primary-dark tabular-nums"
              style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
            >
              {formatEuro(admissionFee)} €
            </span>
          </div>
          <p className="font-body text-sm text-ink-soft leading-relaxed mb-5 max-w-[560px]">
            Einmaliger Betrag bei der Vereinsaufnahme. Wähle wie du zahlen möchtest.
          </p>

          <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Zahlungsart Aufnahmegebühr">
            {FEE_OPTIONS.map((opt) => (
              <FeeOptionCard
                key={opt.value}
                option={opt}
                isSelected={method === opt.value}
                onSelect={() => setMethod(opt.value)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sektion 2 — Jahresbeitrag SEPA */}
      <section className="bg-white border border-surface-2 rounded-md p-7 sm:p-8 mb-6 animate-[fadeUp_400ms_280ms_both_ease-out]">
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-1.5">
          <h2 className="font-display font-normal leading-none tracking-wide text-primary" style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}>
            Jahresbeitrag
          </h2>
          <span
            className="font-display font-normal leading-none tracking-wide text-primary-dark tabular-nums"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            {formatEuro(annualFee)} € / Jahr
          </span>
        </div>
        <p className="font-body text-sm text-ink-soft leading-relaxed mb-5 max-w-[560px]">
          Einzug per <strong className="text-primary-dark font-semibold">SEPA-Lastschrift</strong> vom
          angegebenen Konto. Du kannst zwischen jährlichem und halbjährlichem Rhythmus wählen.
        </p>

        {/* Rhythmus-Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6" role="radiogroup" aria-label="Zahlungs-Rhythmus">
          <RhythmOption
            selected={rhythm === 'YEARLY'}
            label="Jährlich"
            amount={`${formatEuro(annualFee)} €`}
            hint="einmal im Sommer"
            onSelect={() => setRhythm('YEARLY')}
          />
          <RhythmOption
            selected={rhythm === 'HALF_YEARLY'}
            label="Halbjährlich"
            amount={`2× ${formatEuro(halfYearlyAmount)} €`}
            hint="Juli & Januar"
            onSelect={() => setRhythm('HALF_YEARLY')}
          />
        </div>

        {/* IBAN + Kontoinhaber */}
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="iban" className="form-label">
              IBAN <span className="form-label-req">*</span>
            </label>
            <input
              id="iban"
              type="text"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              className="input tabular-nums"
              style={{ letterSpacing: '1px' }}
              placeholder="DE00 0000 0000 0000 0000 00"
              autoComplete="off"
              inputMode="text"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="account_holder" className="form-label">
              Kontoinhaber <span className="form-label-req">*</span>
            </label>
            <input
              id="account_holder"
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="input"
              placeholder="Vor- und Nachname"
              autoComplete="cc-name"
              required
            />
          </div>
        </div>

        <div className="info-box mt-5" role="note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-4 h-4 text-primary mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div>
            <strong>SEPA-Lastschriftmandat.</strong>{' '}
            Mit dem Absenden erteilst du dem CfB Ford Köln-Niehl 09/52 e.V. die Ermächtigung, den
            Jahresbeitrag per SEPA-Lastschrift einzuziehen. Widerruf jederzeit per Email an den Passwart.
            Bankverbindung wird ausschließlich im DFBnet hinterlegt.
          </div>
        </div>
      </section>

      {/* Summary-Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-4 p-5 sm:p-6 bg-white border border-surface-2 rounded-md mt-2 animate-[fadeUp_400ms_380ms_both_ease-out]" style={{ background: 'linear-gradient(0deg, rgba(0, 74, 159, 0.04), rgba(0, 74, 159, 0.04)), var(--white)' }}>
        <div className="flex flex-col gap-1.5">
          <span className="font-accent font-bold text-[11px] tracking-widest uppercase text-ink-soft">
            Deine Auswahl
          </span>
          <span className="font-body text-sm text-ink tabular-nums">
            {showAdmission && (
              <>
                <strong className="text-primary-dark font-semibold">{FEE_OPTIONS.find((o) => o.value === method)?.title}</strong>{' '}
                für die Aufnahmegebühr ·{' '}
              </>
            )}
            <strong className="text-primary-dark font-semibold">
              SEPA {rhythm === 'YEARLY' ? 'jährlich' : 'halbjährlich'}
            </strong>{' '}
            für den Beitrag
          </span>
        </div>
        {showAdmission && (
          <span
            className="font-display font-normal leading-none tracking-wide text-primary tabular-nums"
            style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}
          >
            {formatEuro(admissionFee)} €
          </span>
        )}
      </div>

      <WizardActions
        onBack={onBack}
        onNext={handleContinue}
        nextDisabled={!canContinue}
        nextLabel={ctaLabel}
      />
    </WizardShell>
  );
}

function FeeOptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: FeeOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={`grid grid-cols-[22px_40px_1fr_auto] gap-3.5 px-4 py-3.5 rounded-sm text-left cursor-pointer transition-all items-center ${
        isSelected ? 'bg-white border-[1.5px] border-primary' : 'bg-surface-0 border-[1.5px] border-surface-2 hover:border-primary-light'
      } focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40`}
    >
      <span
        className={`w-5 h-5 rounded-full border-2 grid place-items-center bg-white transition-colors ${
          isSelected ? 'border-primary' : 'border-surface-2'
        }`}
        aria-hidden="true"
      >
        <span
          className={`w-2 h-2 rounded-full bg-primary transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </span>
      <span className="w-10 h-10 rounded-sm grid place-items-center bg-surface-1 text-primary">
        {option.icon}
      </span>
      <span className="min-w-0 flex flex-col">
        <span className="font-body font-semibold text-[15px] text-ink flex items-center gap-2 flex-wrap">
          {option.title}
          {option.recommended && (
            <span className="font-accent font-semibold text-[10px] tracking-wider uppercase text-accent px-2 py-0.5 bg-accent/10 rounded-full">
              Empfohlen
            </span>
          )}
        </span>
        <span className="font-body text-[13px] text-ink-soft leading-tight mt-0.5">{option.desc}</span>
      </span>
      <span className="font-accent font-semibold text-[11px] tracking-widest uppercase text-ink-soft whitespace-nowrap">
        {option.time}
      </span>
    </button>
  );
}

function RhythmOption({
  selected,
  label,
  amount,
  hint,
  onSelect,
}: {
  selected: boolean;
  label: string;
  amount: string;
  hint: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex flex-col items-start gap-1 p-4 px-5 rounded-sm text-left cursor-pointer transition-all ${
        selected ? 'bg-white border-[1.5px] border-primary' : 'bg-surface-0 border-[1.5px] border-surface-2 hover:border-primary-light'
      } focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40`}
    >
      <span
        className={`font-accent font-semibold text-xs tracking-widest uppercase ${
          selected ? 'text-primary' : 'text-ink-soft'
        }`}
      >
        {label}
      </span>
      <span className="font-body font-semibold text-[17px] text-ink tabular-nums">
        {amount}
        <span className="font-normal text-[13px] text-ink-soft ml-1">· {hint}</span>
      </span>
    </button>
  );
}
