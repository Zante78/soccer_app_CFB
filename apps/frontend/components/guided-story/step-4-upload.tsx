'use client';

import { useCallback, useState } from 'react';
import { WizardShell, WizardActions } from './wizard-shell';

type RegistrationReason = 'NEW_PLAYER' | 'TRANSFER' | 'RE_REGISTRATION';

interface Step4UploadProps {
  onNext: (data: {
    photo_file: File | null;
    birth_proof_file?: File | null;
    deregistration_file?: File | null;
    document_files: File[]; // Legacy — Aggregat aus benannten Slots
  }) => void;
  onBack: () => void;
  registrationReason?: RegistrationReason;
  birthDate?: string; // ISO YYYY-MM-DD — bestimmt Junior-Status
  teamId?: string;
}

interface SlotState {
  file: File | null;
  preview: string | null;
  error: string | null;
}

const emptySlot: SlotState = { file: null, preview: null, error: null };

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const IMAGE_MIN_WIDTH = 600;
const IMAGE_MIN_HEIGHT = 800;

function isJunior(birthDateIso?: string): boolean {
  if (!birthDateIso) return true; // fail-safe: bei unbekanntem Alter Junior annehmen (mehr Nachweise)
  const bd = new Date(birthDateIso);
  if (Number.isNaN(bd.getTime())) return true;
  const now = new Date();
  let age = now.getFullYear() - bd.getFullYear();
  const m = now.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) age--;
  return age < 18;
}

export function Step4Upload({
  onNext,
  onBack,
  registrationReason,
  birthDate,
  teamId,
}: Step4UploadProps) {
  const junior = isJunior(birthDate);
  const showBirthProof = junior;
  const showDeregistration = registrationReason === 'TRANSFER';

  const [photo, setPhoto] = useState<SlotState>(emptySlot);
  const [birthProof, setBirthProof] = useState<SlotState>(emptySlot);
  const [deregistration, setDeregistration] = useState<SlotState>(emptySlot);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhoto({ ...emptySlot, error: 'Bitte nur Bilddateien (JPG, PNG, WebP) hochladen.' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setPhoto({ ...emptySlot, error: 'Datei zu groß (max. 10 MB).' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.width < IMAGE_MIN_WIDTH || img.height < IMAGE_MIN_HEIGHT) {
        URL.revokeObjectURL(objectUrl);
        setPhoto({ ...emptySlot, error: `Bild zu klein (min. ${IMAGE_MIN_WIDTH}×${IMAGE_MIN_HEIGHT} px).` });
        return;
      }
      setPhoto({ file, preview: objectUrl, error: null });
    };
    img.src = objectUrl;
  }, []);

  const handleDocumentUpload =
    (setter: React.Dispatch<React.SetStateAction<SlotState>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        setter({ ...emptySlot, error: 'Datei zu groß (max. 10 MB).' });
        return;
      }
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      if (!isImg && !isPdf) {
        setter({ ...emptySlot, error: 'Bitte nur JPG, PNG, WebP oder PDF hochladen.' });
        return;
      }
      setter({ file, preview: null, error: null });
    };

  const removeSlot = (setter: React.Dispatch<React.SetStateAction<SlotState>>, current: SlotState) => {
    if (current.preview) URL.revokeObjectURL(current.preview);
    setter(emptySlot);
  };

  const canContinue = Boolean(photo.file) && (!showBirthProof || Boolean(birthProof.file));

  const handleContinue = () => {
    if (!canContinue) return;
    const document_files: File[] = [];
    if (birthProof.file) document_files.push(birthProof.file);
    if (deregistration.file) document_files.push(deregistration.file);
    onNext({
      photo_file: photo.file,
      birth_proof_file: birthProof.file,
      deregistration_file: deregistration.file,
      document_files,
    });
  };

  const contextChips: React.ReactNode[] = [];
  if (registrationReason === 'TRANSFER') {
    contextChips.push(
      <span key="reason" className="context-chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
        </svg>
        Vereinswechsel
      </span>
    );
  } else if (registrationReason === 'RE_REGISTRATION') {
    contextChips.push(
      <span key="reason" className="context-chip">
        Wiederanmeldung
      </span>
    );
  } else if (registrationReason === 'NEW_PLAYER') {
    contextChips.push(
      <span key="reason" className="context-chip">
        Erstanmeldung
      </span>
    );
  }
  if (teamId) {
    contextChips.push(
      <span key="team" className="context-chip">
        {junior ? 'Junior' : 'Senior'} · {teamId.toUpperCase()}
      </span>
    );
  }

  return (
    <WizardShell step={4}>
      <section className="animate-[fadeUp_400ms_100ms_both_ease-out] mb-10">
        <span className="eyebrow">Foto &amp; Dokumente</span>
        <h1 className="headline">Ein Foto, ein Nachweis.</h1>
        <p className="headline-sub">
          Wir brauchen ein aktuelles Passfoto für den Spielerpass{showBirthProof && ' und — wenn der Spieler unter 18 ist — einen Nachweis des Geburtsdatums'}.
          Alles vom Handy fotografiert reicht, keine Original-Post nötig.
        </p>
      </section>

      {contextChips.length > 0 && (
        <div className="flex gap-2.5 flex-wrap mb-8 animate-[fadeUp_400ms_160ms_both_ease-out]">
          {contextChips}
        </div>
      )}

      <div className="animate-[fadeUp_400ms_220ms_both_ease-out]">
        {/* Slot 1: Photo (immer Pflicht) */}
        <PhotoSlot state={photo} onUpload={handlePhotoUpload} onRemove={() => removeSlot(setPhoto, photo)} />

        {/* Slot 2: Geburtsnachweis (Pflicht bei Junior) */}
        {showBirthProof && (
          <DocumentSlot
            title="Nachweis des Geburtsdatums"
            required
            tagLabel="Pflicht bei Junioren"
            description={
              <>
                Foto oder Scan der <strong className="text-primary-dark font-semibold">Geburtsurkunde</strong> oder
                einer <strong className="text-primary-dark font-semibold">Meldebescheinigung</strong>. Der WDFV verlangt
                den Nachweis für die Altersklasse.
              </>
            }
            state={birthProof}
            onUpload={handleDocumentUpload(setBirthProof)}
            onRemove={() => removeSlot(setBirthProof, birthProof)}
            inputId="upload-birth"
          >
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 pt-3 border-t border-surface-2 font-body text-[13px] text-ink-soft">
              <SlotOk>Geburtsurkunde</SlotOk>
              <SlotOk>Meldebescheinigung</SlotOk>
              <SlotOk>beides ist gleichwertig</SlotOk>
            </div>
          </DocumentSlot>
        )}

        {/* Slot 3: Abmeldebestätigung (Optional bei Vereinswechsel) */}
        {showDeregistration && (
          <DocumentSlot
            title="Abmeldebestätigung vom Vorverein"
            tagLabel="Optional"
            tagIsOptional
            description={
              <>
                Falls dir die Bestätigung vom alten Verein vorliegt, lade sie hoch — das beschleunigt die
                Prüfung. Wenn nicht: kein Problem, wir arbeiten mit den Angaben aus dem letzten Schritt.
              </>
            }
            state={deregistration}
            onUpload={handleDocumentUpload(setDeregistration)}
            onRemove={() => removeSlot(setDeregistration, deregistration)}
            inputId="upload-deregistration"
          />
        )}

        {/* Vertrauens-Note */}
        <div className="info-box mt-8" role="note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-4 h-4 text-primary mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div>
            <strong>Was passiert mit den Dokumenten?</strong>
            <br />
            Alles landet verschlüsselt bei uns und wird <strong>48 Stunden nach der DFBnet-Freigabe automatisch gelöscht</strong>.
            Der Passwart nutzt sie nur zur Vorbereitung des offiziellen Papier-Antrags.
          </div>
        </div>
      </div>

      <WizardActions
        onBack={onBack}
        onNext={handleContinue}
        nextDisabled={!canContinue}
        nextLabel="Zur Spielberechtigung"
      />
    </WizardShell>
  );
}

/* ============================================================
   SLOTS
   ============================================================ */

function PhotoSlot({
  state,
  onUpload,
  onRemove,
}: {
  state: SlotState;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const hasFile = Boolean(state.file);
  return (
    <div className={`bg-white rounded-md p-6 md:p-7 mb-5 transition-colors ${
      hasFile ? 'border-[1.5px] border-solid border-surface-2' : 'border-[1.5px] border-dashed border-surface-2 hover:border-primary-light'
    }`}>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="font-body font-semibold text-[17px] text-ink tracking-tight">
          Passfoto <span className="text-primary ml-0.5">*</span>
        </span>
        {hasFile ? (
          <SlotTag variant="done">Hochgeladen</SlotTag>
        ) : (
          <SlotTag variant="required">Pflicht</SlotTag>
        )}
      </div>
      <p className="font-body text-sm text-ink-soft leading-relaxed mb-5">
        Ein aktuelles Foto vom Gesicht, geradeaus, heller Hintergrund. Kein Selfie mit Sonnenbrille.
        Landet direkt auf dem späteren Spielerpass.
      </p>

      {hasFile && state.file ? (
        <UploadedFileRow
          file={state.file}
          preview={state.preview}
          onRemove={onRemove}
          isImage
        />
      ) : (
        <label htmlFor="upload-photo" className="flex items-center gap-4.5 p-4.5 bg-surface-0 rounded-sm cursor-pointer transition-colors hover:bg-surface-1">
          <span className="flex-shrink-0 w-12 h-12 grid place-items-center bg-surface-1 rounded-full text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="font-body font-semibold text-[15px] text-primary">Foto auswählen</span>
            <span className="font-body text-[13px] text-ink-soft">Foto vom Handy · max 10 MB</span>
          </span>
          <input
            id="upload-photo"
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={onUpload}
          />
        </label>
      )}

      {state.error && <p className="mt-2 text-[13px] font-medium text-[var(--error)]">{state.error}</p>}
    </div>
  );
}

function DocumentSlot({
  title,
  required,
  tagLabel,
  tagIsOptional,
  description,
  state,
  onUpload,
  onRemove,
  inputId,
  children,
}: {
  title: string;
  required?: boolean;
  tagLabel: string;
  tagIsOptional?: boolean;
  description: React.ReactNode;
  state: SlotState;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  inputId: string;
  children?: React.ReactNode;
}) {
  const hasFile = Boolean(state.file);
  return (
    <div className={`bg-white rounded-md p-6 md:p-7 mb-5 transition-colors ${
      hasFile ? 'border-[1.5px] border-solid border-surface-2' : 'border-[1.5px] border-dashed border-surface-2 hover:border-primary-light'
    }`}>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="font-body font-semibold text-[17px] text-ink tracking-tight">
          {title}
          {required && <span className="text-primary ml-0.5">*</span>}
        </span>
        {hasFile ? (
          <SlotTag variant="done">Hochgeladen</SlotTag>
        ) : tagIsOptional ? (
          <SlotTag variant="optional">{tagLabel}</SlotTag>
        ) : (
          <SlotTag variant="required">{tagLabel}</SlotTag>
        )}
      </div>
      <p className="font-body text-sm text-ink-soft leading-relaxed mb-5">{description}</p>

      {hasFile && state.file ? (
        <UploadedFileRow file={state.file} preview={null} onRemove={onRemove} />
      ) : (
        <label
          htmlFor={inputId}
          className="flex items-center gap-4.5 p-4.5 bg-surface-0 rounded-sm cursor-pointer transition-colors hover:bg-surface-1"
        >
          <span className="flex-shrink-0 w-12 h-12 grid place-items-center bg-surface-1 rounded-full text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="font-body font-semibold text-[15px] text-primary">Datei auswählen</span>
            <span className="font-body text-[13px] text-ink-soft">JPG, PNG, WebP oder PDF · max 10 MB</span>
          </span>
          <input
            id={inputId}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={onUpload}
          />
        </label>
      )}

      {state.error && <p className="mt-2 text-[13px] font-medium text-[var(--error)]">{state.error}</p>}
      {children}
    </div>
  );
}

function UploadedFileRow({
  file,
  preview,
  onRemove,
  isImage,
}: {
  file: File;
  preview: string | null;
  onRemove: () => void;
  isImage?: boolean;
}) {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  return (
    <div className="grid grid-cols-[56px_1fr_auto] gap-4 items-center p-3.5 px-4 bg-surface-0 rounded-sm">
      <div className="w-14 h-[72px] rounded-sm bg-surface-2 grid place-items-center overflow-hidden text-primary">
        {preview && isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vorschau" className="w-full h-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        )}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-body font-medium text-sm text-ink whitespace-nowrap overflow-hidden text-ellipsis">
          {file.name}
        </span>
        <span className="font-body text-xs text-ink-soft">{sizeMB} MB</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Datei entfernen"
        className="p-2 text-ink-soft rounded-sm transition-colors hover:text-[var(--error)] hover:bg-surface-1 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] block">
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        </svg>
      </button>
    </div>
  );
}

function SlotTag({
  variant,
  children,
}: {
  variant: 'required' | 'optional' | 'done';
  children: React.ReactNode;
}) {
  const classes = {
    required: 'bg-primary/10 text-primary',
    optional: 'bg-surface-1 text-ink-soft',
    done: 'text-accent inline-flex items-center gap-1.5',
  }[variant];

  return (
    <span
      className={`font-accent font-semibold text-[11px] tracking-widest uppercase px-2.5 py-0.5 rounded-full ${classes} ${
        variant === 'done' ? 'bg-accent/10' : ''
      }`}
    >
      {variant === 'done' && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {children}
    </span>
  );
}

function SlotOk({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-accent">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {children}
    </span>
  );
}
