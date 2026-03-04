# CfB Pass-Automation System 2026

**RPA-gestütztes Automatisierungssystem für Spielerpass-Anträge beim DFBnet**

---

## 📋 Projekt-Übersicht

Das CfB Pass-Automation System transformiert den manuellen Prozess der Spielerpass-Anträge in einen hochautomatisierten Workflow mit "Human-in-the-Loop" Sicherheit.

### Kern-Features
- ✅ **8-Step Guided Story**: Intuitiver Registrierungs-Flow für Antragsteller
- ✅ **Sperrfristen-Engine**: Automatische Berechnung nach § 16 SpO / § 20 JSpO
- ✅ **RPA Draft-Modus**: Playwright-Bot erstellt DFBnet-Entwürfe (kein Auto-Submit)
- ✅ **Visual Regression**: Screenshot-Vergleich mit 0.2% Toleranz
- ✅ **DSGVO-Compliance**: Automatische Datenlöschung nach 48h
- ✅ **Magic Link**: Passwordless Status-Tracking
- ✅ **Admin Dashboard**: Visual Audit, Notfall-Export (PDF)

### Zeiteinsparung
- **Vorher:** ~15 Minuten pro Antrag
- **Nachher:** ~30 Sekunden (97% Reduktion)
- **Pro Saison:** ~25 Stunden Zeitersparnis

---

## 🏗️ Architektur

### Monorepo-Struktur
```
cfb-pass-automation/
├── apps/
│   ├── frontend/          # Next.js 14+ (Guided Story + Admin Dashboard)
│   └── rpa-bot/           # Playwright RPA Engine
├── packages/
│   ├── shared-logic/      # Sperrfristen-Engine, Validators
│   └── shared-types/      # TypeScript Type Definitions
├── n8n/
│   └── templates/         # Workflow JSON Exports
├── supabase/
│   ├── migrations/        # Database Schema
│   └── seed.sql           # Test Data
└── package.json           # Root Workspace Config
```

### Tech-Stack

| Layer | Technologie | Zweck |
|-------|-------------|-------|
| **Frontend** | Next.js 14 + React 19 | Server Components, App Router |
| **UI** | Tailwind CSS 4 | Utility-first Styling |
| **Database** | Supabase (PostgreSQL) | RLS, Auth, Storage |
| **Forms** | React Hook Form + Zod | Type-safe Validation |
| **State** | TanStack Query + Zustand | Server/Client State |
| **Workflow** | n8n (self-hosted) | Queue Management, Webhooks |
| **RPA** | Playwright | Browser Automation |
| **Payment** | PayPal + QR-Codes | Online + Cash Payments |
| **Email** | Resend | Transactional Mails |

---

## 🚀 Setup

### Voraussetzungen
- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase Account (oder lokales Supabase via Docker)
- Git

### Installation

1. **Repository klonen**
```bash
cd ~/Desktop
git clone https://github.com/cfb-niehl/pass-automation.git
cd pass-automation
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

## 📊 Database Schema

### Haupttabellen

| Tabelle | Beschreibung | Key Fields |
|---------|-------------|-----------|
| `registrations` | Spielerpass-Anträge | status, team_id, eligibility_date |
| `audit_logs` | Immutable Audit Trail | action, user_id, timestamp |
| `rpa_traces` | Bot Execution Logs | visual_diff_score, error_message |
| `finance_status` | Payment Tracking | is_paid, payment_method |
| `users` | User Accounts + Roles | role, team_id |
| `teams` | Mannschaften | dfbnet_id, season |

### Status Flow
```
DRAFT → SUBMITTED → READY_FOR_BOT → BOT_IN_PROGRESS → COMPLETED
                                                      ↘ ERROR
                                                      ↘ VISUAL_REGRESSION_ERROR
```

---

## 🔐 Row-Level Security (RLS)

| Rolle | Zugriff auf Registrations | Zugriff auf Finance | Zugriff auf RPA Traces |
|-------|--------------------------|---------------------|----------------------|
| **ANTRAGSTELLER** | Nur eigene | - | - |
| **TRAINER** | Nur eigenes Team | Update (Cash QR) | - |
| **PASSWART** | Alle | View All | View All + Edit |
| **SUPER_ADMIN** | Full Access | Full Access | Full Access |

---

## 🧪 Testing

### Unit Tests (Sperrfristen-Engine)
```bash
cd packages/shared-logic
npm test
```

### Integration Tests (E2E)
```bash
cd apps/frontend
npm run test:e2e
```

### RPA Bot Tests (Headed Mode)
```bash
cd apps/rpa-bot
PLAYWRIGHT_HEADED=true npm run test
```

---

## 📦 Deployment

### Frontend (Vercel)
```bash
# Automatisches Deployment via Git Push
git push origin main
```

### RPA Bot (Windows VPS)
```bash
# SSH auf VPS
ssh user@your-vps.com

# Repository klonen
git clone https://github.com/cfb-niehl/pass-automation.git
cd pass-automation

# Dependencies installieren
npm install --workspace=apps/rpa-bot

# PM2 Setup
pm2 start apps/rpa-bot/src/index.ts --name cfb-rpa-bot
pm2 save
pm2 startup
```

### n8n (Docker)
```bash
docker run -d --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Import Workflows from n8n/templates/*.json
```

---

## 📖 Dokumentation

- **Plan**: [Implementierungsplan](.claude/plans/drifting-twirling-lake.md)
- **User Manual**: `USER_MANUAL.md` (im CFB Projekt Ordner)
- **Project Plan**: `PROJECT_PLAN.md` (im CFB Projekt Ordner)
- **Initialization Guide**: `INITIALIZATION.md` (im CFB Projekt Ordner)

---

## 🛡️ Sicherheit & Compliance

### DSGVO
- ✅ Photos werden 48h nach Verarbeitung gelöscht
- ✅ Audit Logs für alle Zugriffe (IP-Adresse, Timestamp)
- ✅ DSGVO-Export-Funktion für Antragsteller
- ✅ Encryption at Rest (Supabase)

### RPA Safety
- ✅ Bot erstellt nur Drafts (nie Auto-Submit)
- ✅ Visual Regression stoppt bei UI-Änderungen
- ✅ Singleton Queue (max 1 Bot parallel)
- ✅ Heartbeat-Monitoring alle 4 Stunden

---

## 🐛 Troubleshooting

### Problem: Bot Login schlägt fehl
**Lösung**:
- Prüfe `DFBNET_USER` / `DFBNET_PASSWORD` in `.env`
- Prüfe IMAP-Credentials für 2FA OTP-Abruf
- Teste Login manuell im Browser

### Problem: Visual Regression Error
**Lösung**:
- Öffne Admin Dashboard → Visual Audit
- Vergleiche Baseline vs. Actual Screenshot
- Akzeptiere neue Baseline, wenn DFBnet UI geändert wurde

### Problem: Payment Webhook nicht empfangen
**Lösung**:
- Prüfe n8n Webhook URL Konfiguration
- Prüfe PayPal Webhook Settings
- Teste mit Postman/Insomnia

---

## 📞 Support

- **GitHub Issues**: https://github.com/cfb-niehl/pass-automation/issues
- **Email**: passwart@cfb-niehl.de

---

## 📄 License

MIT License - CfB Ford Niehl e.V.

---

## 🙏 Danksagung

Entwickelt für CfB Ford Niehl e.V. zur Entlastung der ehrenamtlichen Helfer.
