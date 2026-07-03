'use client';

import { useMemo, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { WizardShell, WizardActions } from './wizard-shell';

interface Step6ConsentProps {
  onNext: (data: { consents: Record<string, boolean>; signature_data: string }) => void;
  onBack: () => void;
  playerData: {
    first_name: string;
    last_name: string;
    birth_date: string;
    team_id: string;
  };
  registrationReason?: 'NEW_PLAYER' | 'TRANSFER' | 'RE_REGISTRATION';
}

type ConsentKey = 'membership' | 'dsgvo' | 'playing' | 'photo';
type ConsentState = Record<ConsentKey, boolean>;

interface ConsentDef {
  key: ConsentKey;
  title: string;
  required: boolean;
  desc: React.ReactNode;
  link?: { href: string; label: string };
}

const CONSENTS: ConsentDef[] = [
  {
    key: 'membership',
    title: 'Aufnahme in den Verein & Vereinssatzung',
    required: true,
    desc: 'Ich beantrage die Aufnahme in den CfB Ford Köln-Niehl 09/52 e.V. und erkenne die Vereinssatzung und Beitragsordnung an.',
    link: { href: 'https://cfb-fordniehl.de/j/satzung', label: 'Satzung & Beitragsordnung ansehen' },
  },
  {
    key: 'dsgvo',
    title: 'Datenschutz (DSGVO)',
    required: true,
    desc: 'Ich stimme der Verarbeitung der personenbezogenen Daten für die Spielerpass-Beantragung zu. Sensible Dokumente (Foto, Geburtsurkunde) werden 48 Stunden nach der DFBnet-Freigabe automatisch gelöscht.',
    link: { href: 'https://cfb-fordniehl.de/j/datenschutz', label: 'Datenschutzerklärung ansehen' },
  },
  {
    key: 'playing',
    title: 'Einverständnis Spielbetrieb',
    required: true,
    desc: 'Der Spieler darf am offiziellen Trainings- und Spielbetrieb des Vereins sowie an Freundschaftsspielen, Turnieren und Punktspielen teilnehmen.',
  },
  {
    key: 'photo',
    title: 'Fotoerlaubnis',
    required: false,
    desc: 'Ich bin damit einverstanden, dass Fotos und Videos aus dem Trainings- und Spielbetrieb zu Vereinszwecken (Website, Instagram, Vereinszeitung) verwendet werden dürfen. Kann jederzeit widerrufen werden.',
  },
];

function isJunior(birthDateIso: string): boolean {
  if (!birthDateIso) return false;
  const bd = new Date(birthDateIso);
  if (Number.isNaN(bd.getTime())) return false;
  const now = new Date();
  let age = now.getFullYear() - bd.getFullYear();
  const m = now.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
  return age < 18;
}

export function Step6Consent({
  onNext,
  onBack,
  playerData,
  registrationReason,
}: Step6ConsentProps) {
  const junior = isJunior(playerData.birth_date);
  const [consents, setConsents] = useState<ConsentState>({
    membership: false,
    dsgvo: false,
    playing: false,
    photo: false,
  });
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const sigRef = useRef<SignatureCanvas | null>(null);

  const requiredAllChecked = useMemo(() => {
    return CONSENTS.filter((c) => c.required).every((c) => consents[c.key]);
  }, [consents]);

  const toggleConsent = (key: ConsentKey) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearSignature = () => {
    sigRef.current?.clear();
    setHasSignature(false);
    setSignatureError(null);
  };

  const handleContinue = () => {
    if (!requiredAllChecked) return;
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setSignatureError('Bitte digital unterschreiben.');
      return;
    }
    const signature_data = sigRef.current.toDataURL('image/png');
    onNext({
      consents: consents as Record<string, boolean>,
      signature_data,
    });
  };

  const canContinue = requiredAllChecked && hasSignature;

  const contextChips: React.ReactNode[] = [];
  if (registrationReason === 'TRANSFER') {
    contextChips.push(
      <span key="reason" className="context-chip">Vereinswechsel</span>
    );
  } else if (registrationReason === 'RE_REGISTRATION') {
    contextChips.push(
      <span key="reason" className="context-chip">Wiederanmeldung</span>
    );
  } else if (registrationReason === 'NEW_PLAYER') {
    contextChips.push(
      <span key="reason" className="context-chip">Erstanmeldung</span>
    );
  }
  if (playerData.team_id) {
    contextChips.push(
      <span key="team" className="context-chip">
        {junior ? 'Junior' : 'Senior'} · {playerData.team_id.toUpperCase()}
      </span>
    );
  }

  return (
    <WizardShell step={6}>
      <section className="animate-[fadeUp_400ms_100ms_both_ease-out] mb-10">
        <span className="eyebrow">Erklärungen &amp; Unterschrift</span>
        <h1 className="headline">Erklärungen &amp; Unterschrift.</h1>
        <p className="headline-sub">
          Vier Erklärungen, ohne die keine Vereinsmitgliedschaft läuft. Bitte einmal lesen und
          bestätigen — danach digital unterschreiben.
        </p>
      </section>

      {contextChips.length > 0 && (
        <div className="flex gap-2.5 flex-wrap mb-8 animate-[fadeUp_400ms_160ms_both_ease-out]">
          {contextChips}
        </div>
      )}

      {/* Consents */}
      <div className="animate-[fadeUp_400ms_220ms_both_ease-out]">
        <p className="section-title">Erklärungen</p>
        <ul className="list-none p-0 mb-10 flex flex-col gap-3" role="group">
          {CONSENTS.map((consent) => (
            <ConsentItem
              key={consent.key}
              consent={consent}
              checked={consents[consent.key]}
              onToggle={() => toggleConsent(consent.key)}
            />
          ))}
        </ul>
      </div>

      {/* Signature */}
      <div className="animate-[fadeUp_400ms_320ms_both_ease-out]">
        <p className="section-title">Unterschrift</p>

        <div className="flex gap-3 p-3.5 px-4 bg-primary/[0.06] rounded-sm mb-4 font-body text-[13px] text-primary-dark leading-relaxed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-4 h-4 text-primary mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div>
            <strong className="font-semibold">Rechtsgültige digitale Unterschrift.</strong>{' '}
            Deine digitale Unterschrift ist verbindlich — keine zusätzliche Papier-Unterschrift nötig.
            Wir speichern sie zusammen mit dem Antrag und einem Zeitstempel als Nachweis.
          </div>
        </div>

        <div
          className={`relative w-full h-[180px] bg-white rounded-md overflow-hidden cursor-crosshair transition-colors ${
            hasSignature ? 'border-[1.5px] border-primary' : 'border-[1.5px] border-surface-2 hover:border-primary-light'
          }`}
        >
          <SignatureCanvas
            ref={(ref) => {
              sigRef.current = ref;
            }}
            penColor="#003479"
            canvasProps={{
              className: 'w-full h-full block',
              'aria-label': 'Unterschriftfeld',
            }}
            onBegin={() => {
              setHasSignature(true);
              setSignatureError(null);
            }}
          />
          {!hasSignature && (
            <div className="absolute bottom-10 left-8 right-8 flex items-center gap-3 pointer-events-none">
              <div className="flex-1 h-px bg-surface-2" />
              <span className="font-body text-[13px] text-ink-soft italic whitespace-nowrap">
                hier unterschreiben
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-3 gap-3 flex-wrap">
          <span className="font-body text-xs text-ink-soft leading-tight">
            Unterschrift {junior && <strong className="font-semibold">des Erziehungsberechtigten</strong>} — mit Maus oder Finger.
          </span>
          <button
            type="button"
            onClick={clearSignature}
            className="cursor-pointer font-accent font-semibold text-xs tracking-widest uppercase text-ink-soft px-3 py-2 rounded-sm transition-colors hover:text-[var(--error)] hover:bg-surface-1 inline-flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            </svg>
            Neu unterschreiben
          </button>
        </div>

        {signatureError && (
          <p className="mt-2 text-[13px] font-medium text-[var(--error)]">{signatureError}</p>
        )}

        {junior && (
          <div className="info-box mt-6" role="note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-[18px] h-[18px] text-primary mt-0.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <strong className="block font-accent font-bold text-xs tracking-widest uppercase text-primary mb-1">
                Warum Erziehungsberechtigte/r?
              </strong>
              Der WDFV verlangt bei Junioren unter 18 Jahren die Unterschrift eines Erziehungsberechtigten —
              damit wird auch die sportgesundheitliche Eignung des Spielers bestätigt.
            </div>
          </div>
        )}
      </div>

      <WizardActions
        onBack={onBack}
        onNext={handleContinue}
        nextDisabled={!canContinue}
        nextLabel="Zur Zahlung"
      />
    </WizardShell>
  );
}

function ConsentItem({
  consent,
  checked,
  onToggle,
}: {
  consent: ConsentDef;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className={`w-full grid grid-cols-[28px_1fr] gap-4 p-5 md:p-6 bg-white text-left rounded-md cursor-pointer transition-all items-start ${
          checked ? 'border-[1.5px] border-primary' : 'border-[1.5px] border-surface-2 hover:border-primary-light'
        } focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40`}
      >
        <span
          className={`w-6 h-6 mt-0.5 rounded-sm border-2 grid place-items-center bg-white transition-colors ${
            checked ? 'bg-primary border-primary' : 'border-surface-2'
          }`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-3.5 h-3.5 text-white transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span className="flex flex-col gap-1 min-w-0">
          <span className="font-body font-semibold text-base text-ink tracking-tight flex items-center gap-2 flex-wrap">
            {consent.title}
            {consent.required ? (
              <span className="font-accent text-[11px] font-semibold tracking-wider uppercase text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                Pflicht
              </span>
            ) : (
              <span className="font-accent text-[11px] font-semibold tracking-wider uppercase text-ink-soft px-2 py-0.5 bg-surface-1 rounded-full">
                Optional
              </span>
            )}
          </span>
          <span className="font-body text-sm text-ink-soft leading-relaxed">{consent.desc}</span>
          {consent.link && (
            <a
              href={consent.link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 mt-1.5 font-body text-[13px] font-medium text-primary underline decoration-primary-light underline-offset-2 hover:text-primary-dark hover:decoration-primary self-start"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <path d="M14 3h7v7M10 14L21 3M21 14v7H3V3h7" />
              </svg>
              {consent.link.label}
            </a>
          )}
        </span>
      </button>
    </li>
  );
}
