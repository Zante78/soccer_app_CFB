'use client';

import { QRCodeSVG } from 'qrcode.react';
import { WizardShell } from './wizard-shell';

interface Step8CompletionProps {
  magicLink: string;
  registrationId: string;
  playerName: string;
}

type TimelineState = 'done' | 'active' | 'future';

interface TimelineItem {
  state: TimelineState;
  title: string;
  desc: string;
  time: string;
  icon: React.ReactNode;
}

export function Step8Completion({ magicLink, registrationId, playerName }: Step8CompletionProps) {
  const copyToClipboard = (text: string, label = 'Link') => {
    void navigator.clipboard.writeText(text);
    // TODO: Toast statt alert — in Follow-up-Sprint
    alert(`${label} kopiert!`);
  };

  const timeline: TimelineItem[] = [
    {
      state: 'done',
      title: 'Antrag erfasst & verschlüsselt gespeichert',
      desc: 'Alle Daten sind bei uns angekommen. Du hast eine Kopie per Email erhalten.',
      time: 'Gerade eben',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      state: 'active',
      title: 'Automatische Prüfung & DFBnet-Eintrag',
      desc: 'Unser System übernimmt die Daten ins DFBnet und bereitet den offiziellen WDFV-Antrag vor.',
      time: 'Läuft · ca. 30 Sek.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      state: 'future',
      title: 'Passwart-Freigabe',
      desc: 'Der Passwart prüft den Antrag, stempelt vereinsseitig und leitet ihn an den WDFV weiter.',
      time: '1–3 Werktage',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      state: 'future',
      title: 'Verband bestätigt Spielberechtigung',
      desc: 'Sobald der WDFV die Freigabe erteilt hat, bist du offiziell spielberechtigt — du bekommst eine Email.',
      time: '1–2 Wochen',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      ),
    },
  ];

  return (
    <WizardShell step={8} progressLabel="Fertig · 08 / 08">
      {/* Success Hero */}
      <section className="animate-[fadeUp_400ms_100ms_both_ease-out] mb-10">
        <div
          className="w-[88px] h-[88px] rounded-full bg-accent text-white grid place-items-center mb-6"
          style={{ animation: 'pop 500ms 200ms both cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className="w-[50px] h-[50px]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="eyebrow" style={{ color: 'var(--accent-green-d)' }}>Antrag eingereicht</span>
        <h1
          className="font-display font-normal leading-[0.92] tracking-[1px] text-primary mb-5"
          style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}
        >
          Willkommen im Team.
          <span className="block" style={{ color: 'var(--accent-green-d)' }}>Wir kümmern uns.</span>
        </h1>
        <p className="headline-sub">
          Dein Antrag für <strong className="text-primary-dark font-semibold">{playerName}</strong> ist bei uns
          angekommen. Alle Angaben werden jetzt automatisch verarbeitet — du brauchst nichts weiter zu tun.{' '}
          <strong className="text-primary-dark font-semibold">Eine Bestätigungs-Email ist unterwegs</strong> an
          die angegebene Adresse.
        </p>
      </section>

      {/* Antragsnummer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 p-6 sm:p-7 bg-white border border-surface-2 rounded-md mb-8 animate-[fadeUp_400ms_260ms_both_ease-out]">
        <div className="flex flex-col gap-1">
          <span className="font-accent font-semibold text-xs tracking-widest uppercase text-ink-soft">
            Antragsnummer
          </span>
          <span
            className="font-display font-normal leading-none text-primary tabular-nums"
            style={{ fontSize: 'clamp(28px, 4vw, 36px)' }}
          >
            {registrationId}
          </span>
        </div>
        <button
          type="button"
          onClick={() => copyToClipboard(registrationId, 'Antragsnummer')}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface-1 border border-surface-2 rounded-sm font-accent font-semibold text-xs tracking-widest uppercase text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
          aria-label="Antragsnummer kopieren"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Kopieren
        </button>
      </div>

      {/* Timeline */}
      <p className="section-title">So geht es weiter</p>
      <ol className="list-none p-0 mb-10 animate-[fadeUp_400ms_340ms_both_ease-out]">
        {timeline.map((item, i) => (
          <TimelineRow key={i} item={item} isLast={i === timeline.length - 1} />
        ))}
      </ol>

      {/* Magic-Link */}
      <p className="section-title">Status jederzeit einsehen</p>
      <section className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-7 p-7 sm:p-8 bg-white border border-surface-2 rounded-md mb-10 items-center animate-[fadeUp_400ms_420ms_both_ease-out]">
        <div className="justify-self-start">
          <QRCodeSVG
            value={magicLink}
            size={140}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#111820"
            aria-label="QR-Code zum Magic-Link"
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="font-body font-semibold text-[17px] text-ink tracking-tight">
            Speichere dir den Magic-Link.
          </span>
          <span className="font-body text-sm text-ink-soft leading-relaxed">
            Mit dem Link siehst du jederzeit den aktuellen Status deines Antrags — ohne Passwort,
            ohne Login. Scan den QR-Code oder speichere den Link in deinen Favoriten.
          </span>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="flex-1 min-w-[200px] px-3.5 py-2.5 bg-surface-0 border border-surface-2 rounded-sm font-body text-[13px] text-primary-dark whitespace-nowrap overflow-hidden text-ellipsis">
              {magicLink}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(magicLink, 'Link')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-sm font-accent font-bold text-xs tracking-widest uppercase transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
              aria-label="Magic-Link kopieren"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Kopieren
            </button>
          </div>
        </div>
      </section>

      {/* Reassurance-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 animate-[fadeUp_400ms_500ms_both_ease-out]">
        <div className="flex gap-3.5 p-5 bg-surface-1 rounded-sm font-body text-[13px] text-ink leading-relaxed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-[18px] h-[18px] text-primary mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <div>
            <strong className="block font-accent font-bold text-[11px] tracking-widest uppercase text-primary-dark mb-1">
              Deine Dokumente sind sicher
            </strong>
            Foto und Nachweise werden 48 Stunden nach der Verbandsfreigabe automatisch gelöscht.
          </div>
        </div>
        <div className="flex gap-3.5 p-5 bg-surface-1 rounded-sm font-body text-[13px] text-ink leading-relaxed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 w-[18px] h-[18px] text-primary mt-0.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22 6 12 13 2 6" />
          </svg>
          <div>
            <strong className="block font-accent font-bold text-[11px] tracking-widest uppercase text-primary-dark mb-1">
              Alles per Email
            </strong>
            Jeder wichtige Schritt kommt zusätzlich als Nachricht — du musst hier nichts weiter machen.
          </div>
        </div>
      </div>

      {/* Final Actions */}
      <div className="flex justify-center gap-4 flex-wrap animate-[fadeUp_400ms_580ms_both_ease-out]">
        <a href={magicLink} className="btn-primary">
          Status öffnen
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
        <a
          href="https://cfb-fordniehl.de"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 border-[1.5px] border-primary text-primary rounded-sm font-accent font-bold text-[15px] tracking-widest uppercase transition-all hover:bg-primary hover:text-white hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
        >
          Zurück zur Vereinsseite
        </a>
      </div>
    </WizardShell>
  );
}

function TimelineRow({ item, isLast }: { item: TimelineItem; isLast: boolean }) {
  const dotClasses = {
    done: 'bg-accent border-accent text-white',
    active: 'bg-primary border-primary text-white',
    future: 'bg-white border-surface-2 text-ink-soft',
  }[item.state];

  const timeClasses = {
    done: 'text-accent-dark',
    active: 'text-primary',
    future: 'text-ink-soft',
  }[item.state];

  const titleClasses =
    item.state === 'future' ? 'text-ink-soft' : 'text-ink';

  const connectorClasses = item.state === 'done' ? 'bg-accent' : 'bg-surface-2';

  return (
    <li className="grid grid-cols-[32px_1fr_auto] gap-4 py-4 relative items-start">
      {!isLast && (
        <span
          className={`absolute left-[15px] top-[46px] bottom-[-8px] w-0.5 ${connectorClasses}`}
          aria-hidden="true"
        />
      )}
      <span
        className={`w-8 h-8 rounded-full grid place-items-center border-2 relative z-10 ${dotClasses} ${
          item.state === 'active' ? 'animate-[pulse_2s_infinite]' : ''
        }`}
        aria-hidden="true"
      >
        <span className="w-4 h-4">{item.icon}</span>
      </span>
      <div className="flex flex-col gap-0.5 pt-1">
        <span className={`font-body font-semibold text-[15px] tracking-tight ${titleClasses}`}>
          {item.title}
        </span>
        <span className="font-body text-[13px] text-ink-soft leading-relaxed">{item.desc}</span>
      </div>
      <span
        className={`font-accent font-semibold text-[11px] tracking-widest uppercase pt-1.5 whitespace-nowrap ${timeClasses}`}
      >
        {item.time}
      </span>
    </li>
  );
}
