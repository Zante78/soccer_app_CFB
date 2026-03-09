# n8n Workflow Templates - CFB Pass-Automation

**Version:** 2.0 (Opus 4.6 Security Audit)

## Ubersicht

Diese Templates implementieren die Workflow-Orchestrierung fur das CFB Pass-Automation System.

### v2.0 Security Improvements (Opus 4.6 Audit)
- PayPal: Idempotency Guard + Status Guard (verhindert doppelte Bot-Ausfuehrung)
- QR: Team-Zugehoerigkeits-Check (TRAINER nur eigenes Team) + PASSWART/ADMIN Support
- Bot Queue: **DB-basierter Lock** statt In-Memory (Cloud-safe, atomare Akquise via `acquire_bot_lock` RPC)
- DSGVO: Loescht jetzt **Photos UND Dokumente** + verwendet Supabase RPC
- Heartbeat: Alert-Cooldown (2 consecutive failures, 1h Cooldown via `upsert_system_health` RPC)
- Neue Migration: `000006_n8n_workflow_support.sql` (Lock-Tabelle + 5 RPC Functions)

## Workflows

| Workflow | Datei | Trigger | Beschreibung |
|----------|-------|---------|--------------|
| **PayPal Handler** | `paypal-handler.json` | Webhook | PayPal Zahlung -> READY_FOR_BOT |
| **QR Verification** | `qr-verification.json` | Webhook | Trainer bestatigt Barzahlung |
| **Bot Queue** | `bot-execution-queue.json` | Schedule (60s) | Singleton Bot-Ausfuhrung |
| **DSGVO Purge** | `dsgvo-purge.json` | Cron (02:00 UTC) | Photos nach 48h loschen |
| **Heartbeat** | `heartbeat-monitor.json` | Schedule (4h) | DFBnet Health Check |

## Import in n8n Cloud

### Schritt 1: Credentials einrichten

Bevor du die Workflows importierst, erstelle diese Credentials in n8n:

#### 1. Supabase API
- **Name:** `Supabase CFB`
- **Type:** Supabase
- **Host:** `https://[PROJECT_ID].supabase.co`
- **Service Role Key:** (aus Supabase Dashboard > Settings > API)

#### 2. SMTP (fur Email Alerts)
- **Name:** `CFB SMTP`
- **Type:** SMTP
- **Host:** z.B. `smtp.gmail.com` oder Resend
- **Port:** 587
- **User/Password:** Deine SMTP Credentials

#### 3. HTTP Header Auth (fur Bot Runner)
- **Name:** `CFB API Key`
- **Type:** Header Auth
- **Name:** `Authorization`
- **Value:** `Bearer [BOT_API_KEY]`

### Schritt 2: Environment Variables

Setze diese Environment Variables in n8n Cloud (Settings > Variables):

```
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_SERVICE_KEY=eyJ...
BOT_RUNNER_URL=http://[VPS_IP]:3001
BOT_API_KEY=your-secret-key
ADMIN_EMAIL=passwart@cfb-niehl.de
```

### Schritt 3: Import

1. Gehe zu n8n Cloud Dashboard
2. Klicke auf "Import from File"
3. Importiere jeden `.json` File einzeln
4. Ersetze die Credential-Referenzen mit deinen echten Credentials
5. Aktiviere die Workflows

## Workflow Details

### 1. PayPal Handler (`paypal-handler.json`)

**Flow:**
```
PayPal Webhook -> Parse Payload -> Update finance_status -> Set READY_FOR_BOT -> Audit Log
```

**Webhook URL:** `https://[n8n-instance]/webhook/paypal-webhook`

**PayPal Setup:**
1. Gehe zu PayPal Developer Dashboard
2. Erstelle Webhook fur PAYMENT.CAPTURE.COMPLETED
3. Trage die n8n Webhook URL ein

**Wichtig:** Das `custom_id` oder `invoice` Feld muss die `registration_id` enthalten!

---

### 2. QR Verification (`qr-verification.json`)

**Flow:**
```
Webhook -> Validate -> Check Trainer Role -> Update finance_status -> Set READY_FOR_BOT
```

**Webhook URL:** `https://[n8n-instance]/webhook/qr-verify`

**Request Body (vom Frontend):**
```json
{
  "registration_id": "uuid",
  "trainer_id": "uuid",
  "amount": 15.00
}
```

---

### 3. Bot Execution Queue (`bot-execution-queue.json`)

**Flow:**
```
Schedule (60s) -> Get READY_FOR_BOT -> Check Lock -> Trigger Bot -> Update Status
```

**Singleton Lock:** Verwendet n8n Static Data fur In-Memory Lock (10 Min Expiry)

**Bot Runner Endpoint:**
- `POST /execute` - Startet Bot fur Registration
- `POST /health-check` - Testet DFBnet Login

---

### 4. DSGVO Purge (`dsgvo-purge.json`)

**Flow:**
```
Cron (02:00) -> Find COMPLETED > 48h -> Delete Photos -> Clear DB -> Audit Log
```

**Compliance:**
- Loscht Fotos aus Supabase Storage
- Setzt `photo_path = NULL` in DB
- Schreibt Audit Log fur Nachweis

---

### 5. Heartbeat Monitor (`heartbeat-monitor.json`)

**Flow:**
```
Schedule (4h) -> Call Bot Health -> Update Status -> Alert if RED
```

**Status Ampel:**
- GREEN: DFBnet Login erfolgreich
- YELLOW: Timeout/Langsam
- RED: Login fehlgeschlagen

## Testen

### PayPal (mit Webhook.site)

1. Erstelle Webhook auf https://webhook.site
2. Ersetze temporar die Webhook URL im Workflow
3. Sende Test-Payload:

```bash
curl -X POST https://webhook.site/[your-id] \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "id": "TEST123",
      "custom_id": "[registration_uuid]",
      "amount": { "value": "15.00", "currency_code": "EUR" },
      "status": "COMPLETED"
    }
  }'
```

### QR Verification

```bash
curl -X POST https://[n8n]/webhook/qr-verify \
  -H "Authorization: Bearer [API_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "registration_id": "[uuid]",
    "trainer_id": "[uuid]",
    "amount": 15.00
  }'
```

### Bot Queue (Manual Test)

1. Setze eine Registration auf `READY_FOR_BOT` in Supabase
2. Warte auf nachsten Cron-Cycle (60s) oder triggere manuell
3. Prufe `rpa_traces` Tabelle

## Troubleshooting

### Workflow startet nicht
- Prufe ob Workflow aktiviert ist
- Prufe Credentials (Test Connection)
- Prufe Environment Variables

### PayPal Webhook kommt nicht an
- Prufe Webhook URL in PayPal Dashboard
- Prufe ob Events aktiviert sind
- Schaue in n8n Execution History

### Bot Lock hangt
- Lock expiry ist 10 Minuten
- Bei Bedarf: Workflow stoppen, Static Data zurucksetzen

### Email wird nicht gesendet
- Prufe SMTP Credentials
- Prufe ADMIN_EMAIL Variable
- Teste SMTP separat

## Maintenance

### Backup
Exportiere alle Workflows regelmassig als JSON.

### Updates
Bei Schema-Anderungen die Workflows entsprechend anpassen.

### Monitoring
- n8n Cloud: Executions Tab
- Supabase: audit_logs Tabelle
- Email Alerts bei Fehlern

---

**Version:** 1.0.0
**Erstellt:** 2026-03-08
**Autor:** CFB Development Team
