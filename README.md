# CfB Pass-Automation System 2026

**RPA-gestütztes Automatisierungssystem für Spielerpass-Anträge beim DFBnet**

---

## Projekt-Übersicht

Das CfB Pass-Automation System transformiert den manuellen Prozess der Spielerpass-Anträge in einen hochautomatisierten Workflow mit "Human-in-the-Loop" Sicherheit.

### Kern-Features
- **8-Step Guided Story**: Intuitiver Registrierungs-Flow für Antragsteller
- **Sperrfristen-Engine**: Automatische Berechnung nach § 16 SpO / § 20 JSpO
- **RPA Draft-Modus**: Playwright-Bot erstellt DFBnet-Entwürfe (kein Auto-Submit)
- **Visual Regression**: Screenshot-Vergleich mit 0.2% Toleranz
- **DSGVO-Compliance**: Automatische Datenlöschung nach 48h
- **Magic Link**: Passwordless Status-Tracking
- **Admin Dashboard**: Visual Audit, Notfall-Export (PDF)
- **n8n Workflows**: PayPal/QR Payments, Bot Queue, DSGVO Purge, Heartbeat Monitor

### Zeiteinsparung
- **Vorher:** ~15 Minuten pro Antrag
- **Nachher:** ~30 Sekunden (97% Reduktion)
- **Pro Saison:** ~25 Stunden Zeitersparnis

---

## Architektur

### Monorepo-Struktur
```
cfb-pass-automation/
├── apps/
│   ├── frontend/          # Next.js 16 (Guided Story + Admin Dashboard)
│   └── rpa-bot/           # Playwright RPA Engine
├── packages/
│   ├── shared-logic/      # Sperrfristen-Engine, Validators
│   └── shared-types/      # TypeScript Type Definitions
├── n8n/
│   └── templates/         # 5 Workflow JSON Exports
├── supabase/
│   ├── migrations/        # 7 Database Migrations
│   └── seed.sql           # Test Data
└── package.json           # Root Workspace Config
```

### Tech-Stack

| Layer | Technologie | Zweck |
|-------|-------------|-------|
| **Frontend** | Next.js 16 + React 19 | Server Components, App Router, PPR |
| **UI** | Tailwind CSS v4 + Shadcn UI | Utility-first Styling, Accessible Components |
| **Database** | Supabase (PostgreSQL) | RLS, Auth, Storage |
| **Forms** | React Hook Form + Zod | Type-safe Validation |
| **Workflow** | n8n (self-hosted) | Queue Management, Webhooks |
| **RPA** | Playwright | Browser Automation (DFBnet) |
| **Payment** | PayPal + QR-Codes | Online + Cash Payments |
| **Email** | Resend | Transactional Mails + Alerts |
| **Testing** | Playwright (E2E) + Vitest | 30 E2E Tests |

---

## Setup

### Voraussetzungen
- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase Account (oder lokales Supabase via Docker)
- Git

### Installation

1. **Repository klonen**
```bash
cd ~/Desktop
git clone https://github.com/Zante78/soccer_app_CFB.git CFB-Pass-Automation
cd CFB-Pass-Automation
```

2. **Dependencies installieren**
```bash
npm install
```

3. **Environment Variables konfigurieren**
```bash
cp .env.example .env
# Bearbeite .env mit deinen Credentials
```

4. **Supabase Projekt setup**
```bash
# Option A: Lokales Supabase (Docker)
npx supabase start

# Option B: Cloud Supabase
# 1. Erstelle Projekt auf supabase.com
# 2. Kopiere URL + Keys in .env
# 3. Führe Migrations aus:
npx supabase db push
```

5. **Database seeden (Optional für Dev)**
```bash
npx supabase db reset --with-seed
```

6. **Frontend starten**
```bash
npm run dev:frontend
```

Frontend läuft nun auf `http://localhost:3000`

---

## Database Schema

### Haupttabellen

| Tabelle | Beschreibung | Key Fields |
|---------|-------------|-----------|
| `registrations` | Spielerpass-Anträge | status, team_id, eligibility_date |
| `audit_logs` | Immutable Audit Trail | action, user_id, timestamp |
| `rpa_traces` | Bot Execution Logs | visual_diff_score, error_message |
| `finance_status` | Payment Tracking | is_paid, payment_method |
| `users` | User Accounts + Roles | role, team_id, deleted_at |
| `teams` | Mannschaften | dfbnet_id, season |
| `bot_execution_lock` | Singleton Bot Lock | locked_at, locked_by |
| `system_health` | Heartbeat Status | status (GREEN/YELLOW/RED) |

### Status Flow
```
DRAFT → SUBMITTED → READY_FOR_BOT → BOT_IN_PROGRESS → COMPLETED
                                                      ↘ ERROR
                                                      ↘ VISUAL_REGRESSION_ERROR
```

---

## Row-Level Security (RLS)

| Rolle | Registrations | Finance | RPA Traces | Audit Logs |
|-------|--------------|---------|------------|------------|
| **ANTRAGSTELLER** | Nur eigene | - | - | Nur eigene |
| **TRAINER** | Nur eigenes Team | Update (Cash QR) | - | Team |
| **PASSWART** | Alle | View All | View All + Edit | Alle |
| **SUPER_ADMIN** | Full Access | Full Access | Full Access | Full Access |

---

## Sicherheit & Code-Qualität

### Security Hardening
- **Auth:** `getUser()` (server-validated) statt `getSession()` (JWT-only)
- **Server Actions:** Zod validation → Auth check → dann Mutation
- **Storage:** TypeScript `AllowedBucket` Type + Runtime Whitelist
- **Path Traversal:** URL-decoded, Null-Byte, Control-Character Schutz
- **Search:** Input Sanitization (100 Char Limit, Semicolon/Wildcard Escaping)
- **Soft-Delete:** `deleted_at IS NULL` auf allen User-Queries enforced

### Accessibility (WCAG AA)
- WCAG AA Kontrast (6.4:1 Ratio auf allen Texten)
- 44px Minimum Touch Targets
- `prefers-reduced-motion` respektiert
- ARIA Roles auf Error States + Loading States
- sr-only Labels auf allen Filter-Inputs
- Konsistente `focus-visible:ring-2` Ringe

### Performance
- PPR (Partial Prerendering) incremental aktiviert
- `useTransition` für nicht-blockierende Filter-Updates
- Dynamic Imports mit Suspense Fallback Skeletons
- Dashboard: 4 Queries → 2 konsolidiert
- `optimizePackageImports`: lucide-react, date-fns

### Code Audit (16 Runden, ~190+ Fixes)
- 12 Runden General Audit (5 parallele Agenten)
- V-PERF Audit (6 Fixes)
- V-UX Audit (8 Fixes, 37+ Dateien)
- V-DATA Audit (5 Fixes)
- Zero `any`/`as` TypeScript Casts
- Zod validation auf allen Server Actions

---

## Testing

### E2E Tests (30 Tests)
```bash
cd apps/frontend
npm run test:e2e          # Headless
npm run test:e2e:headed   # Mit Browser
npm run test:e2e:debug    # Debug-Modus
npm run test:e2e:report   # Report öffnen
```

### Unit Tests (Sperrfristen-Engine)
```bash
cd packages/shared-logic
npm test
```

### RPA Bot Tests (Headed Mode)
```bash
cd apps/rpa-bot
PLAYWRIGHT_HEADED=true npm run test
```

---

## Deployment

### Frontend (Vercel) — LIVE
- **URL:** https://soccer-app-cfb-frontend.vercel.app
- Automatisches Deployment via `git push origin master`

### RPA Bot (Windows VPS) — Phase 7
```bash
# SSH auf VPS
ssh user@your-vps.com

# Repository klonen
git clone https://github.com/Zante78/soccer_app_CFB.git
cd soccer_app_CFB

# Dependencies installieren
npm install --workspace=apps/rpa-bot

# PM2 Setup
pm2 start apps/rpa-bot/src/index.ts --name cfb-rpa-bot
pm2 save
pm2 startup
```

### n8n (Docker auf VPS) — Phase 7
```bash
docker run -d --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Import: n8n/templates/*.json (5 Workflows)
# Credentials: Supabase Service Role, Bot API Key, Resend SMTP
```

---

## n8n Workflows

| # | Workflow | Trigger | Funktion |
|---|----------|---------|----------|
| 1 | PayPal Payment Handler | Webhook | PayPal IPN → finance_status → READY_FOR_BOT |
| 2 | QR Payment Verification | Webhook | Trainer Cash-Bestätigung → READY_FOR_BOT |
| 3 | Bot Execution Queue | Schedule 60s | Singleton Bot Runner + Error Alerts |
| 4 | Heartbeat Monitor | Manual/Schedule 4h | DFBnet Health Check → Ampel |
| 5 | DSGVO Purge | Cron 02:00 UTC | 48h Photo-Löschung + Bericht |

---

## Dokumentation

- **Project Status:** `PROJECT_STATUS.md`
- **Phase 4 Guide:** `docs/PHASE_4_IMPLEMENTATION_GUIDE.md`
- **Bot Quick Ref:** `docs/RPA_BOT_QUICK_REFERENCE.md`
- **n8n Templates:** `n8n/templates/` (5 JSON Files)
- **Implementierungsplan:** `.claude/plans/drifting-twirling-lake.md`

---

## DSGVO & Compliance

- Photos werden 48h nach Verarbeitung automatisch gelöscht (n8n Cron)
- Audit Logs für alle Zugriffe (IP-Adresse, Timestamp, User)
- Soft-Delete Pattern (keine harten Löschungen)
- Encryption at Rest (Supabase)
- Bot erstellt nur Drafts (nie Auto-Submit)
- Visual Regression stoppt bei UI-Änderungen

---

## Troubleshooting

### Problem: Bot Login schlägt fehl
- Prüfe `DFBNET_USER` / `DFBNET_PASSWORD` in `.env`
- Teste Login manuell im Browser unter https://verein.dfbnet.org/login/
- 3-Feld-Formular: Username, Passwort, Kundennummer

### Problem: Visual Regression Error
- Öffne Admin Dashboard → Visual Audit
- Vergleiche Baseline vs. Actual Screenshot
- Akzeptiere neue Baseline, wenn DFBnet UI geändert wurde

### Problem: Payment Webhook nicht empfangen
- Prüfe n8n Webhook URL Konfiguration
- Prüfe PayPal Webhook Settings
- Teste mit Postman/Insomnia

### Problem: Vercel Deployment fehlschlägt
- Prüfe Anon-Key in Vercel Env-Vars (keine Zeilenumbrüche!)
- `next/dynamic` + react-signature-canvas: Explizites Typing nötig

---

## Support

- **GitHub Issues:** https://github.com/Zante78/soccer_app_CFB/issues
- **Email:** passwart@cfb-niehl.de

---

## License

MIT License - CfB Ford Niehl e.V.

---

Entwickelt für CfB Ford Niehl e.V. zur Entlastung der ehrenamtlichen Helfer.
