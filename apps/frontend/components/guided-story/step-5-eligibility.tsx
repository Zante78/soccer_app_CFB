'use client';

import { useEffect, useMemo, useState } from 'react';
import { calculateSeniorEligibility } from '@packages/shared-logic/src/eligibility/senior-calculator';
import { calculateJuniorEligibility } from '@packages/shared-logic/src/eligibility/junior-calculator';
import type { EligibilityResult } from '@packages/shared-types/src';
import { RegistrationReason } from '@packages/shared-types/src';
import { WizardShell, WizardActions } from './wizard-shell';

type ReasonString = 'NEW_PLAYER' | 'TRANSFER' | 'RE_REGISTRATION';

interface Step5EligibilityProps {
  onNext: (data: { eligibility_result: EligibilityResult }) => void;
  onBack: () => void;
  playerData: {
    birth_date: string;
    team_id: string;
    previous_club?: string;
    previous_team_deregistration_date?: string;
    previous_team_last_game?: string;
  };
  registrationReason?: ReasonString;
}

type VerdictVariant = 'sofort' | 'sperrfrist' | 'abgelaufen' | 'einzelfall';

function isJuniorTeam(teamId: string): boolean {
  return teamId.toLowerCase().includes('u') || teamId.toLowerCase().includes('bambini') || teamId.toLowerCase().includes('ballschule');
}

function formatGermanDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso);
  const b = new Date(toIso);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function Step5Eligibility({
  onNext,
  onBack,
  playerData,
  registrationReason,
}: Step5EligibilityProps) {
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const junior = isJuniorTeam(playerData.team_id);

  useEffect(() => {
    const reason =
      registrationReason === 'TRANSFER'
        ? RegistrationReason.TRANSFER
        : registrationReason === 'RE_REGISTRATION'
        ? RegistrationReason.RE_REGISTRATION
        : playerData.previous_club
        ? RegistrationReason.TRANSFER
        : RegistrationReason.NEW_PLAYER;

    const birth = playerData.birth_date || new Date().toISOString().split('T')[0];

    try {
      const result = junior
        ? calculateJuniorEligibility({
            player_birth_date: birth,
            previous_team_deregistration_date: playerData.previous_team_deregistration_date,
            previous_team_last_game: playerData.previous_team_last_game,
            registration_reason: reason,
          })
        : calculateSeniorEligibility({
            player_birth_date: birth,
            previous_team_deregistration_date: playerData.previous_team_deregistration_date,
            previous_team_last_game: playerData.previous_team_last_game,
            registration_reason: reason,
          });
      setEligibility(result);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Eligibility calculation error:', err);
      setEligibility({
        is_eligible: true,
        eligibility_date: new Date().toISOString().split('T')[0],
        sperrfrist_days: 0,
        sperrfrist_start: '',
        sperrfrist_end: '',
        calculation_reason: 'Fallback-Berechnung',
        applied_rule: junior ? 'JSpO §20' : 'SpO §16',
      });
    }
  }, [playerData, registrationReason, junior]);

  const variant: VerdictVariant = useMemo(() => {
    if (!eligibility) return 'sofort';
    if (registrationReason === 'RE_REGISTRATION') return 'einzelfall';
    if (!eligibility.is_eligible) return 'sperrfrist';
    // is_eligible === true — entweder Erstanmeldung ODER Sperrfrist abgelaufen
    const hasPreviousClub = Boolean(
      playerData.previous_club ||
        playerData.previous_team_deregistration_date ||
        playerData.previous_team_last_game
    );
    return hasPreviousClub ? 'abgelaufen' : 'sofort';
  }, [eligibility, registrationReason, playerData]);

  const handleContinue = () => {
    if (eligibility) onNext({ eligibility_result: eligibility });
  };

  if (!eligibility) {
    return (
      <WizardShell step={5}>
        <div className="animate-[fadeUp_400ms_100ms_both_ease-out] py-24 text-center">
          <div className="w-12 h-12 mx-auto mb-6 border-b-2 border-primary rounded-full animate-spin" />
          <p className="font-body text-ink-soft">Berechne Spielberechtigung...</p>
        </div>
      </WizardShell>
    );
  }

  return (
    <WizardShell step={5}>
      <section className="animate-[fadeUp_400ms_100ms_both_ease-out] mb-10">
        <span className="eyebrow">Spielberechtigung</span>
        <h1 className="headline">
          {variant === 'einzelfall' ? 'Kurze Prüfung nötig.' : 'Prüfung abgeschlossen.'}
        </h1>
        <p className="headline-sub">
          {variant === 'einzelfall'
            ? 'Bei Wiederanmeldungen hängt die Spielberechtigung davon ab, wie lange die Pause war und wo der Spieler zuletzt registriert war. Der Passwart prüft den Fall individuell — das dauert normalerweise ein paar Tage.'
            : variant === 'sperrfrist'
            ? 'Wir haben die Angaben gegen das DFB-Regelwerk gecheckt. Es läuft eine Sperrfrist — das ist bei Vereinswechseln normal. Ab einem festen Datum darf der Spieler auflaufen.'
            : 'Wir haben die Angaben gegen das DFB-Regelwerk gecheckt. Hier ist das Ergebnis — die genauen Daten kannst du gleich weiter unten nachlesen.'}
        </p>
      </section>

      {/* Kontext-Chips */}
      <div className="flex gap-2.5 flex-wrap mb-8 animate-[fadeUp_400ms_160ms_both_ease-out]">
        {registrationReason && <ChipReason reason={registrationReason} />}
        <span className="context-chip">{junior ? 'Junior' : 'Senior'} · {playerData.team_id.toUpperCase()}</span>
      </div>

      {/* Verdikt */}
      <article
        className="bg-white border border-surface-2 rounded-md overflow-hidden animate-[fadeUp_400ms_220ms_both_ease-out]"
        role="status"
        aria-live="polite"
      >
        <VerdictHead variant={variant} eligibility={eligibility} junior={junior} />
        <div className="p-7 sm:p-8">
          <VerdictBody
            variant={variant}
            eligibility={eligibility}
            junior={junior}
            playerData={playerData}
            registrationReason={registrationReason}
          />
        </div>
      </article>

      {/* Next-Steps */}
      <div
        className="mt-8 p-5 sm:p-6 bg-surface-1 border-l-[3px] border-primary rounded-sm animate-[fadeUp_400ms_340ms_both_ease-out]"
        role="note"
      >
        <strong className="block font-accent font-bold text-xs tracking-widest uppercase text-primary mb-1">
          Was jetzt kommt
        </strong>
        <p className="font-body text-sm text-ink leading-relaxed">
          {variant === 'sperrfrist'
            ? 'Der Antrag läuft trotzdem sofort durch — nur der Einsatz im Spiel wartet auf das Datum oben. Bis dahin kann der Spieler ganz normal am Training teilnehmen. Im nächsten Schritt bestätigst du die Erklärungen und unterschreibst digital.'
            : variant === 'einzelfall'
            ? 'Der Antrag läuft trotzdem sofort durch die restlichen Schritte — Erklärungen, Unterschrift, Zahlung. Sobald der Passwart die Prüfung fertig hat, wirst du per Email informiert. Bis dahin kann der Spieler ganz normal am Training teilnehmen.'
            : 'Im nächsten Schritt bestätigst du ein paar Erklärungen (Mitgliedschaft, Datenschutz, Fotoerlaubnis) und unterschreibst digital. Danach geht es zur Zahlung des Jahresbeitrags — und du bist fertig.'}
        </p>
      </div>

      <WizardActions
        onBack={onBack}
        onNext={handleContinue}
        nextLabel="Zu den Erklärungen"
      />
    </WizardShell>
  );
}

/* ============================================================
   VERDICT HEAD (farbige Zone mit Icon + Kern-Aussage)
   ============================================================ */

function VerdictHead({
  variant,
  eligibility,
  junior,
}: {
  variant: VerdictVariant;
  eligibility: EligibilityResult;
  junior: boolean;
}) {
  const config = getVariantConfig(variant, eligibility, junior);
  return (
    <div
      className="p-8 sm:p-9 grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr] gap-5 items-center border-b"
      style={{ background: config.headBg, borderColor: config.headBorder }}
    >
      <div
        className="w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-full grid place-items-center text-white"
        style={{ background: config.iconBg }}
        aria-hidden="true"
      >
        <span className="w-8 h-8 sm:w-10 sm:h-10">{config.icon}</span>
      </div>
      <div>
        <h2
          className="font-display font-normal leading-none tracking-wide mb-1"
          style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: config.titleColor }}
        >
          {config.title}
        </h2>
        <p
          className="font-body text-[15px] font-medium opacity-90"
          style={{ color: config.titleColor }}
        >
          {config.subtitle}
        </p>
      </div>
    </div>
  );
}

function getVariantConfig(variant: VerdictVariant, eligibility: EligibilityResult, junior: boolean) {
  if (variant === 'sofort') {
    return {
      headBg: 'linear-gradient(135deg, rgba(45, 155, 90, 0.08), rgba(45, 155, 90, 0.02))',
      headBorder: 'rgba(45, 155, 90, 0.15)',
      iconBg: 'var(--accent-green)',
      titleColor: 'var(--accent-green-d)',
      title: 'Sofort spielberechtigt.',
      subtitle: 'Erstanmeldung ohne Vorverein — keine Sperrfrist.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    };
  }
  if (variant === 'abgelaufen') {
    return {
      headBg: 'linear-gradient(135deg, rgba(45, 155, 90, 0.08), rgba(45, 155, 90, 0.02))',
      headBorder: 'rgba(45, 155, 90, 0.15)',
      iconBg: 'var(--accent-green)',
      titleColor: 'var(--accent-green-d)',
      title: 'Sofort spielberechtigt.',
      subtitle: 'Vereinswechsel — Sperrfrist bereits abgelaufen.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    };
  }
  if (variant === 'sperrfrist') {
    return {
      headBg: 'linear-gradient(135deg, var(--amber-bg), rgba(255, 251, 235, 0.4))',
      headBorder: 'rgba(217, 119, 6, 0.2)',
      iconBg: 'var(--amber)',
      titleColor: 'var(--amber-d)',
      title: 'Sperrfrist läuft.',
      subtitle: `Vereinswechsel bei ${junior ? 'Junior' : 'Senior'} · ${eligibility.sperrfrist_days} Tage Wartezeit nach ${eligibility.applied_rule}.`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    };
  }
  // einzelfall
  return {
    headBg: 'linear-gradient(135deg, rgba(0, 74, 159, 0.06), rgba(0, 74, 159, 0.02))',
    headBorder: 'rgba(0, 74, 159, 0.15)',
    iconBg: 'var(--primary)',
    titleColor: 'var(--primary-d)',
    title: 'Prüfung im Einzelfall.',
    subtitle: 'Wiederanmeldung — der Passwart schaut sich den Fall an.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };
}

/* ============================================================
   VERDICT BODY (Summary + Rechenweg + Regelwerk)
   ============================================================ */

function VerdictBody({
  variant,
  eligibility,
  junior,
  playerData,
  registrationReason,
}: {
  variant: VerdictVariant;
  eligibility: EligibilityResult;
  junior: boolean;
  playerData: Step5EligibilityProps['playerData'];
  registrationReason?: ReasonString;
}) {
  if (variant === 'einzelfall') {
    return <EinzelfallBody />;
  }

  const antragsart =
    registrationReason === 'TRANSFER' || playerData.previous_club
      ? 'Vereinswechsel'
      : registrationReason === 'RE_REGISTRATION'
      ? 'Wiederanmeldung'
      : 'Erstanmeldung';

  const showCountdown = variant === 'sperrfrist';
  const showCalc = variant === 'sperrfrist' || variant === 'abgelaufen';
  const remaining = eligibility.eligibility_date
    ? daysBetween(new Date().toISOString().split('T')[0], eligibility.eligibility_date)
    : 0;

  return (
    <>
      {showCountdown && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 sm:gap-8 p-6 bg-surface-0 rounded-md mb-7 items-center">
          <div className="flex flex-col gap-1">
            <span className="font-accent font-semibold text-[11px] tracking-widest uppercase text-ink-soft">
              Spielberechtigt ab
            </span>
            <span
              className="font-display font-normal leading-none tracking-wide text-primary mt-1"
              style={{ fontSize: 'clamp(32px, 6vw, 56px)' }}
            >
              {formatGermanDate(eligibility.eligibility_date)}
            </span>
            <span className="font-body text-[13px] text-ink-soft mt-1.5">
              {remaining > 0 ? `In ${remaining} Tagen` : 'Datum steht fest'}
            </span>
          </div>
          {remaining > 0 && (
            <div className="flex flex-col gap-1 p-4 px-5 bg-white border-[1.5px] border-surface-2 rounded-sm text-center min-w-[140px]">
              <span
                className="font-display font-normal leading-none tracking-wide tabular-nums"
                style={{ color: 'var(--amber-d)', fontSize: '40px' }}
              >
                {remaining}
              </span>
              <span className="font-accent font-semibold text-xs tracking-widest uppercase text-ink-soft">
                Tage übrig
              </span>
            </div>
          )}
        </div>
      )}

      {/* Summary-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 pb-6 border-b border-surface-2">
        <SummaryItem label="Antragsart" value={antragsart} />
        <SummaryItem label="Altersklasse" value={junior ? `${playerData.team_id.toUpperCase()} · Junior` : `Senior · ${playerData.team_id.toUpperCase()}`} />
        <SummaryItem
          label="Spielberechtigt ab"
          value={variant === 'sofort' || variant === 'abgelaufen' ? 'heute · sofort' : formatGermanDate(eligibility.eligibility_date)}
          accent={variant === 'sofort' || variant === 'abgelaufen'}
        />
      </div>

      {/* Rechenweg */}
      {showCalc && playerData.previous_team_deregistration_date && (
        <div className="mt-6 p-5 sm:p-6 bg-surface-1 rounded-sm">
          <div className="font-accent font-bold text-xs tracking-widest uppercase text-primary mb-2">
            So haben wir gerechnet
          </div>
          <CalcLine label="Abmeldedatum Vorverein" value={formatGermanDate(playerData.previous_team_deregistration_date)} />
          {playerData.previous_team_last_game && (
            <CalcLine
              label="Letztes Spiel Vorverein"
              value={formatGermanDate(playerData.previous_team_last_game)}
              highlight
            />
          )}
          <CalcLine
            label={`+ Sperrfrist (${eligibility.applied_rule})`}
            value={formatGermanDate(eligibility.eligibility_date)}
          />
          {variant === 'abgelaufen' && (
            <CalcLine
              label="Heute"
              value={`${formatGermanDate(new Date().toISOString().split('T')[0])} · Sperrfrist abgelaufen`}
              passed
            />
          )}
        </div>
      )}

      {/* Regelwerk-Zitat */}
      <div className="flex gap-3 pt-6 font-body text-[13px] text-ink-soft leading-relaxed">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-4 h-4 text-primary mt-0.5">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
        <div>
          <strong className="text-primary-dark font-semibold">Rechtliche Grundlage:</strong>{' '}
          {eligibility.calculation_reason || `Berechnung nach ${eligibility.applied_rule}.`}
        </div>
      </div>
    </>
  );
}

function EinzelfallBody() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 pb-6 border-b border-surface-2">
        <SummaryItem label="Antragsart" value="Wiederanmeldung" />
        <SummaryItem label="Herkunft" value="Wird geprüft" />
        <SummaryItem label="Nächster Schritt" value="Passwart-Check" />
      </div>

      <div className="mt-6 p-5 sm:p-6 bg-surface-1 rounded-sm">
        <div className="font-accent font-bold text-xs tracking-widest uppercase text-primary mb-3">
          So läuft die Prüfung
        </div>
        <ol className="list-none p-0 flex flex-col gap-2.5">
          <ProcessStep num="01">
            <strong className="text-primary-dark font-semibold">Passwart bekommt deinen Antrag</strong> mit allen Angaben aus diesem Wizard.
          </ProcessStep>
          <ProcessStep num="02">
            <strong className="text-primary-dark font-semibold">Er checkt beim DFB</strong>, ob und wo der Spieler zuletzt registriert war und ob eine Sperrfrist noch relevant ist.
          </ProcessStep>
          <ProcessStep num="03">
            <strong className="text-primary-dark font-semibold">Du bekommst eine Email</strong> mit dem Ergebnis — meistens innerhalb weniger Tage: entweder sofort spielberechtigt oder mit Sperrfrist wie bei einem Wechsel.
          </ProcessStep>
        </ol>
      </div>

      <div className="flex gap-3 pt-6 font-body text-[13px] text-ink-soft leading-relaxed">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-4 h-4 text-primary mt-0.5">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
        <div>
          <strong className="text-primary-dark font-semibold">Warum keine automatische Antwort?</strong>{' '}
          Die DFB-Passordnung behandelt lange Pausen unterschiedlich — je nachdem, ob der letzte Verein noch existiert,
          ob eine Freigabe vorliegt oder ob die alten Daten überhaupt noch abrufbar sind. Automatik funktioniert hier
          nicht sauber — deshalb Mensch statt Rechner.
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function SummaryItem({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-accent font-semibold text-[11px] tracking-widest uppercase text-ink-soft">
        {label}
      </span>
      <span
        className={`font-body font-semibold text-base tracking-tight ${
          accent ? 'text-accent-dark' : 'text-ink'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function CalcLine({
  label,
  value,
  highlight,
  passed,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  passed?: boolean;
}) {
  return (
    <div className="flex justify-between py-1 gap-3 border-b border-dashed border-surface-2 last:border-b-0 font-body text-sm">
      <span className="text-ink-soft">{label}</span>
      <span
        className={`font-medium ${
          highlight ? 'text-primary-dark font-semibold' : passed ? 'text-accent-dark font-semibold' : 'text-ink'
        }`}
      >
        {value}
        {highlight && ' ← späteres Datum'}
      </span>
    </div>
  );
}

function ProcessStep({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[28px_1fr] gap-3 items-baseline">
      <span className="font-display text-xl leading-none text-primary tracking-tight">{num}</span>
      <span className="font-body text-sm text-ink leading-relaxed">{children}</span>
    </li>
  );
}

function ChipReason({ reason }: { reason: ReasonString }) {
  if (reason === 'TRANSFER') {
    return (
      <span className="context-chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
        </svg>
        Vereinswechsel
      </span>
    );
  }
  if (reason === 'RE_REGISTRATION') {
    return (
      <span className="context-chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
        </svg>
        Wiederanmeldung
      </span>
    );
  }
  return (
    <span className="context-chip">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Erstanmeldung
    </span>
  );
}
