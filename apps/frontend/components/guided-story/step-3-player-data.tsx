'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { WizardShell, WizardActions } from './wizard-shell';

type RegistrationReason = 'NEW_PLAYER' | 'TRANSFER' | 'RE_REGISTRATION';

/* ============================================================
   TEAMS — vollständiger CFB-Katalog aus cfb-dfbnet-felder.md
   ============================================================ */
const TEAMS: { value: string; label: string }[] = [
  { value: '1-herren', label: '1. Mannschaft (Senioren)' },
  { value: '2-herren', label: '2. Mannschaft (Senioren)' },
  { value: 'ah', label: 'Alte Herren' },
  { value: 'u19', label: 'U19 A-Junioren' },
  { value: 'u17-1', label: 'U17-1 B1-Junioren' },
  { value: 'u17-2', label: 'U17-2 B2-Junioren' },
  { value: 'u15-1', label: 'U15-1 C1-Junioren' },
  { value: 'u15-2', label: 'U15-2 C3-Junioren' },
  { value: 'u14', label: 'U14 C2-Junioren' },
  { value: 'u13-1', label: 'U13-1 D1-Junioren' },
  { value: 'u13-2', label: 'U13-2 D2-Junioren' },
  { value: 'u12-1', label: 'U12-1 D3-Junioren' },
  { value: 'u12-2', label: 'U12-2 D4-Junioren' },
  { value: 'u12-3', label: 'U12-3 D5-Junioren' },
  { value: 'u10', label: 'U10-1 E3-Junioren' },
  { value: 'u9-1', label: 'U9-1 F1-Junioren' },
  { value: 'u9-2', label: 'U9-2 F2-Junioren' },
  { value: 'u8', label: 'U8-1 F3-Junioren' },
  { value: 'u7', label: 'U7-1 Bambini' },
  { value: 'ballschule', label: 'Ballschule (3-5 Jahre)' },
];

type PriorClubOrigin = 'CFB_RETURN' | 'OTHER_CLUB' | 'UNKNOWN';

const playerDataSchema = z.object({
  first_name: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  last_name: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datumsformat'),
  nationality: z.string().min(2, 'Bitte Nationalität angeben'),
  team_id: z.string().min(1, 'Bitte Mannschaft auswählen'),
  // Vereinswechsel-Felder (Pflicht bei TRANSFER, sonst optional)
  previous_club: z.string().optional(),
  previous_team_deregistration_date: z.string().optional(),
  previous_team_last_game: z.string().optional(),
  registration_number: z.string().optional(),
  // Wiederanmeldungs-Felder
  prior_origin: z.enum(['CFB_RETURN', 'OTHER_CLUB', 'UNKNOWN']).optional(),
  pause_since: z.string().optional(),
});

type PlayerDataForm = z.infer<typeof playerDataSchema>;

interface Step3PlayerDataProps {
  onNext: (data: PlayerDataForm) => void;
  onBack: () => void;
  initialData?: Partial<PlayerDataForm>;
  registrationReason?: RegistrationReason;
}

export function Step3PlayerData({
  onNext,
  onBack,
  initialData,
  registrationReason = 'NEW_PLAYER',
}: Step3PlayerDataProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlayerDataForm>({
    resolver: zodResolver(playerDataSchema),
    defaultValues: {
      nationality: 'Deutschland',
      ...initialData,
    },
  });

  const variantConfig = useMemo(() => {
    if (registrationReason === 'TRANSFER') {
      return {
        headline: 'Wer wechselt zu uns?',
        sub: 'Die Stammdaten des Spielers und die Info zum bisherigen Verein. Aus dem Abmeldedatum und dem letzten Spiel berechnen wir automatisch, ab wann er beim CfB auflaufen darf.',
        chipLabel: 'Vereinswechsel',
        showPriorClub: true,
        showOrigin: false,
        showDfbNr: true,
        teamLabel: 'Neue Mannschaft beim CfB',
      };
    }
    if (registrationReason === 'RE_REGISTRATION') {
      return {
        headline: 'Wer meldet sich zurück?',
        sub: 'Wiederanmeldungen laufen individuell — abhängig davon, wie lange die Pause war und wo der Spieler zuletzt registriert war. Wir sammeln erstmal die Basis, den Rest klärt der Passwart.',
        chipLabel: 'Wiederanmeldung',
        showPriorClub: false,
        showOrigin: true,
        showDfbNr: false,
        teamLabel: 'Neue Mannschaft beim CfB',
      };
    }
    return {
      headline: 'Wer wird angemeldet?',
      sub: 'Die wichtigsten Daten des neuen Spielers. Wir übernehmen sie 1:1 ins DFBnet — bitte prüfe die Schreibweise (spätere Änderungen sind aufwendig).',
      chipLabel: 'Erstanmeldung',
      showPriorClub: false,
      showOrigin: false,
      showDfbNr: false,
      teamLabel: 'Mannschaft',
    };
  }, [registrationReason]);

  return (
    <WizardShell step={3}>
      <section className="animate-[fadeUp_400ms_100ms_both_ease-out] mb-8">
        <span className="eyebrow">Spielerdaten</span>
        <h1 className="headline">{variantConfig.headline}</h1>
        <p className="headline-sub">{variantConfig.sub}</p>
      </section>

      <div className="flex gap-2.5 flex-wrap mb-6 animate-[fadeUp_400ms_160ms_both_ease-out]">
        <span className="context-chip">{variantConfig.chipLabel}</span>
      </div>

      <form onSubmit={handleSubmit(onNext)} className="animate-[fadeUp_400ms_220ms_both_ease-out]" noValidate>
        {/* Stammdaten */}
        {variantConfig.showPriorClub && <SectionTitle first>Stammdaten</SectionTitle>}

        <FieldRow>
          <Field label="Vorname" required error={errors.first_name?.message}>
            <input {...register('first_name')} type="text" className="input" placeholder="Wie im Ausweis" autoComplete="given-name" />
          </Field>
          <Field label="Nachname" required error={errors.last_name?.message}>
            <input {...register('last_name')} type="text" className="input" placeholder="Wie im Ausweis" autoComplete="family-name" />
          </Field>
        </FieldRow>

        <FieldRow>
          <Field label="Geburtsdatum" required error={errors.birth_date?.message} hint="Wichtig für die Altersklasse — U11, U13, U15, ...">
            <input {...register('birth_date')} type="date" className="input" />
          </Field>
          <Field label="Nationalität" required error={errors.nationality?.message}>
            <input {...register('nationality')} type="text" className="input" defaultValue="Deutschland" autoComplete="country-name" />
          </Field>
        </FieldRow>

        {variantConfig.showDfbNr && (
          <Field
            label="DFB-Passnummer"
            labelOpt="— falls bekannt"
            error={errors.registration_number?.message}
            hint="Steht auf dem alten Spielerpass. Erleichtert die Zuordnung — ist aber nicht Pflicht."
          >
            <input {...register('registration_number')} type="text" className="input tabular-nums" placeholder="z. B. 12345678" inputMode="numeric" />
          </Field>
        )}

        <Field label={variantConfig.teamLabel} required error={errors.team_id?.message} hint="Wenn du unsicher bist, sag uns Bescheid — der Passwart hilft.">
          <select {...register('team_id')} className="input appearance-none pr-11" style={{
            backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23004A9F' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 16px center',
          }}>
            <option value="">Bitte wählen</option>
            {TEAMS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        {/* Vorverein-Sektion (nur bei TRANSFER) */}
        {variantConfig.showPriorClub && (
          <>
            <SectionTitle>Bisheriger Verein</SectionTitle>
            <p className="font-body text-sm text-ink-soft leading-relaxed mb-6 max-w-[520px]">
              Diese Angaben brauchen wir zwingend für den Vereinswechsel. Der DFB rechnet mit ihnen die{' '}
              <strong className="text-primary-dark font-semibold">Sperrfrist</strong> aus — die Zeit,
              in der ein Spieler nach dem Wechsel noch nicht antreten darf.
            </p>

            <Field label="Name des Vorvereins" required error={errors.previous_club?.message} hint="Genau so wie er beim DFB registriert ist — im Zweifel prüfen wir das nach.">
              <input {...register('previous_club')} type="text" className="input" placeholder="z. B. SV Rot-Weiß Köln" />
            </Field>

            <FieldRow>
              <Field
                label="Abmeldedatum"
                required
                error={errors.previous_team_deregistration_date?.message}
                hint="Datum der offiziellen Abmeldung beim Vorverein."
              >
                <input {...register('previous_team_deregistration_date')} type="date" className="input" />
              </Field>
              <Field
                label="Letztes Spiel"
                required
                error={errors.previous_team_last_game?.message}
                hint="Datum des letzten Pflichtspiels für den Vorverein."
              >
                <input {...register('previous_team_last_game')} type="date" className="input" />
              </Field>
            </FieldRow>

            <div className="info-box mt-2 mb-2" role="note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-5 h-5 text-primary mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div>
                <strong className="block font-accent font-bold text-xs tracking-widest uppercase text-primary mb-1">
                  Wie die Sperrfrist läuft
                </strong>
                Die Frist beginnt am <em>späteren</em> Datum von Abmeldung oder letztem Spiel. Je nach Altersklasse
                dauert sie 1 bis 6 Monate. Wir zeigen dir das Ergebnis im nächsten Schritt.
              </div>
            </div>
          </>
        )}

        {/* Wiederanmeldung — Herkunfts-Radio */}
        {variantConfig.showOrigin && (
          <>
            <SectionTitle>Vorgeschichte</SectionTitle>
            <p className="font-body text-sm text-ink-soft leading-relaxed mb-6 max-w-[520px]">
              Woher kommt der Spieler? Das hilft dem Passwart bei der Einordnung.
            </p>

            <div className="flex flex-col gap-2.5 mb-6" role="radiogroup" aria-label="Vorherige Registrierung">
              {(
                [
                  { value: 'CFB_RETURN', title: 'Vorher schon beim CfB', desc: 'Rückkehrer, war schon mal in einer unserer Mannschaften.' },
                  { value: 'OTHER_CLUB', title: 'Bei einem anderen Verein', desc: 'Zuletzt bei einem anderen Verein — mit Pause dazwischen.' },
                  { value: 'UNKNOWN', title: 'Nicht mehr sicher', desc: 'Ist lange her — der Passwart schaut sich das an.' },
                ] as { value: PriorClubOrigin; title: string; desc: string }[]
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="grid grid-cols-[22px_1fr] gap-3.5 p-4 px-5 bg-white rounded-sm cursor-pointer transition-all items-start border-[1.5px] border-surface-2 hover:border-primary-light focus-within:outline focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-primary/40 has-[input:checked]:border-primary"
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register('prior_origin')}
                    className="peer sr-only"
                  />
                  <span className="w-5 h-5 mt-0.5 rounded-full border-2 border-surface-2 bg-white grid place-items-center peer-checked:border-primary transition-colors">
                    <span className="w-2 h-2 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-body font-semibold text-[15px] text-ink tracking-tight">{opt.title}</span>
                    <span className="font-body text-[13px] text-ink-soft leading-tight">{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>

            <Field label="Alte DFB-Passnummer" labelOpt="— falls bekannt" hint="Steht auf dem alten Spielerpass. Beschleunigt die Prüfung erheblich.">
              <input {...register('registration_number')} type="text" className="input tabular-nums" placeholder="z. B. 12345678" inputMode="numeric" />
            </Field>

            <Field label="Ungefähr seit wann pausiert" labelOpt="— optional" hint="Reicht ungefähr — hilft bei der Einschätzung, ob eine Sperrfrist noch relevant ist.">
              <input {...register('pause_since')} type="text" className="input" placeholder="z. B. Sommer 2022 oder Saison 20/21" />
            </Field>

            <div className="info-box mt-2 mb-2" role="note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-5 h-5 text-primary mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong className="block font-accent font-bold text-xs tracking-widest uppercase text-primary mb-1">
                  Prüfung im Einzelfall
                </strong>
                Der Passwart checkt beim DFB, wie der Fall behandelt wird. Bei kurzer Pause meistens sofort
                spielberechtigt, bei längerer Pause manchmal mit Sperrfrist wie bei einem Wechsel. Wir melden uns
                per Email sobald das geklärt ist — üblicherweise innerhalb weniger Tage.
              </div>
            </div>
          </>
        )}

        {/* Info-Box unten (nur bei NEW_PLAYER) */}
        {!variantConfig.showPriorClub && !variantConfig.showOrigin && (
          <div className="info-box mt-4" role="note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-4 h-4 text-primary mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <strong>Warum diese Daten?</strong> Vorname, Nachname und Geburtsdatum landen 1:1 im DFB-Spielerpass.
              Die Mannschaft entscheidet über die Altersklasse und den Beitrag.
            </div>
          </div>
        )}

        <WizardActions
          onBack={onBack}
          onNext={() => {
            // handleSubmit wird via form onSubmit ausgelöst; hier klicken wir Submit
            (document.activeElement as HTMLElement | null)?.blur();
            const form = document.querySelector('form');
            form?.requestSubmit();
          }}
          nextLabel="Weiter zum Upload"
        />
      </form>
    </WizardShell>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function SectionTitle({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <h2
      className={`font-display font-normal leading-none tracking-wide text-primary mb-2 ${
        first ? 'mt-0 pt-0 border-t-0' : 'mt-12 pt-8 border-t border-surface-2'
      }`}
      style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}
    >
      {children}
    </h2>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
      {children}
    </div>
  );
}

function Field({
  label,
  labelOpt,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  labelOpt?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 mb-6 last:mb-0 [&:has(+.mb-6)]:mb-0">
      <label className="form-label">
        {label}
        {required && <span className="form-label-req">*</span>}
        {labelOpt && (
          <span className="ml-1 font-body text-[13px] font-normal text-ink-soft normal-case tracking-normal">
            {labelOpt}
          </span>
        )}
      </label>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="text-[13px] font-medium text-[var(--error)] mt-0.5">{error}</span>}
    </div>
  );
}
