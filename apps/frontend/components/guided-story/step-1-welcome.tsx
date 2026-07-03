'use client';

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
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-surface-0">
      {/* NAV */}
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
        <div className="ml-auto flex items-center gap-5">
          <span className="progress-marker">
            Schritt <strong>01</strong> von <strong>08</strong>
          </span>
          <span className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 border border-white/15 rounded-sm font-accent text-xs font-semibold tracking-widest uppercase text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-accent-light">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            DSGVO-konform
          </span>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-[1200px] mx-auto w-full px-4 sm:px-8 lg:px-20 py-12 md:py-24 grid gap-16 md:gap-24 md:grid-cols-[1.15fr_1fr] md:items-start content-start">
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
          <p className="font-body text-ink max-w-[520px] leading-relaxed mb-10" style={{ fontSize: 'clamp(15px, 1.8vw, 19px)' }}>
            Du wurdest von <strong className="text-primary font-semibold">{senderLabel}</strong> eingeladen,
            dich beim Verein anzumelden. Wir führen dich in wenigen Schritten durch alles, was der DFB dafür braucht.
          </p>
          <button type="button" onClick={onNext} className="btn-primary">
            Anmeldung starten
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] transition-transform group-hover:translate-x-1">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <span className="block mt-4 font-body text-sm text-ink-soft">
            Dauert etwa 8 Minuten · Du kannst jederzeit pausieren
          </span>
        </section>

        {/* EXPECTATIONS */}
        <aside className="animate-[fadeUp_400ms_220ms_both_ease-out]" aria-label="Was dich erwartet">
          <h2 className="section-title">Was dich erwartet</h2>
          <ol className="list-none m-0 p-0 border-t border-surface-2">
            <li className="grid grid-cols-[56px_1fr_auto] items-baseline py-6 border-b border-surface-2 gap-4">
              <span className="font-display text-[32px] leading-none text-primary tracking-tight">01</span>
              <div>
                <strong className="block font-body text-[17px] font-semibold text-ink mb-1 tracking-tight">
                  Deine Angaben
                </strong>
                <span className="font-body text-sm text-ink-soft leading-relaxed">
                  Name, Geburtsdatum, Mannschaft. Wir prüfen die Sperrfrist automatisch.
                </span>
              </div>
              <span className="font-accent font-semibold text-xs tracking-widest uppercase text-ink-soft whitespace-nowrap tabular-nums">
                2 min
              </span>
            </li>
            <li className="grid grid-cols-[56px_1fr_auto] items-baseline py-6 border-b border-surface-2 gap-4">
              <span className="font-display text-[32px] leading-none text-primary tracking-tight">02</span>
              <div>
                <strong className="block font-body text-[17px] font-semibold text-ink mb-1 tracking-tight">
                  Foto &amp; Dokumente
                </strong>
                <span className="font-body text-sm text-ink-soft leading-relaxed">
                  Ein Passfoto vom Handy. Bei Vereinswechsel zusätzlich die Abmeldung.
                </span>
              </div>
              <span className="font-accent font-semibold text-xs tracking-widest uppercase text-ink-soft whitespace-nowrap tabular-nums">
                3 min
              </span>
            </li>
            <li className="grid grid-cols-[56px_1fr_auto] items-baseline py-6 border-b border-surface-2 gap-4">
              <span className="font-display text-[32px] leading-none text-primary tracking-tight">03</span>
              <div>
                <strong className="block font-body text-[17px] font-semibold text-ink mb-1 tracking-tight">
                  Unterschrift &amp; Beitrag
                </strong>
                <span className="font-body text-sm text-ink-soft leading-relaxed">
                  Digital unterschreiben, Beitrag per PayPal oder QR-Code beim Trainer.
                </span>
              </div>
              <span className="font-accent font-semibold text-xs tracking-widest uppercase text-ink-soft whitespace-nowrap tabular-nums">
                3 min
              </span>
            </li>
          </ol>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="max-w-[1200px] mx-auto w-full px-4 sm:px-8 lg:px-20 py-6 pb-10 flex flex-wrap justify-between items-center border-t border-surface-2 font-body text-sm text-ink-soft gap-4">
        <div>© CfB Ford Köln-Niehl 09/52 e.V.</div>
        <div className="flex gap-3">
          <a href="#" className="text-ink-soft underline decoration-surface-2 underline-offset-2 hover:text-ink hover:decoration-current">
            Datenschutz
          </a>
          <span>·</span>
          <a href="#" className="text-ink-soft underline decoration-surface-2 underline-offset-2 hover:text-ink hover:decoration-current">
            Impressum
          </a>
          <span>·</span>
          <a href="mailto:michael.dobiat@cfbfordniehl.de" className="text-ink-soft underline decoration-surface-2 underline-offset-2 hover:text-ink hover:decoration-current">
            Kontakt
          </a>
        </div>
      </footer>
    </div>
  );
}
