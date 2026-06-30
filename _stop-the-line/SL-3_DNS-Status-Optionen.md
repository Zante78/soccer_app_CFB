# SL-3: DNS-Owner für passstelle.cfb-fordniehl.de — Status & Optionen

**Stand:** 2026-06-30 (Live-Check via nslookup)

## Aktueller IST-Zustand (verifiziert heute)

| Item | Wert |
|---|---|
| Domain | `cfb-fordniehl.de` |
| Aktuelle Nameserver | `ns13.jimdo.com`, `ns14.jimdo.com` |
| A-Record Root-Domain | `162.159.128.70`, `162.159.129.70` (Cloudflare-IPs — Jimdo proxied via Cloudflare) |
| Subdomain `passstelle.cfb-fordniehl.de` | **Existiert NICHT** (NXDOMAIN) |
| Jimdo-Tarif | Business (Stand März 2026, nicht erneut verifiziert) |

## Bestätigung des Problems
Jimdo verwaltet die DNS-Zone und erlaubt **keine eigenen CNAME-Records** für Subdomains zu externen Services. Nur die Haupt-Domain kann auf `web.jimdo.com` zeigen.

Die Subdomain `passstelle.cfb-fordniehl.de` muss also entweder via Workaround oder durch DNS-Migration zu Cloudflare erstellt werden.

---

## DREI OPTIONEN — Entscheidung erforderlich

### Option A — DNS-Migration zu Cloudflare (empfohlen)
**Aufwand:** 1-2h Setup, 1-24h DNS-Propagation
**Kosten:** 0€ (Cloudflare Free Tier)
**Risiko:** Niedrig
**Reversibilität:** Vollständig (Nameserver zurücksetzbar)

**Pro:**
- Volle DNS-Kontrolle für Verein
- Beliebige Subdomains für künftige Services
- Cloudflare-DDoS-Schutz inklusive
- Free Tier reicht permanent

**Contra:**
- Jimdo-Website bleibt erreichbar, aber DNS muss bei Cloudflare gepflegt werden (nicht mehr in Jimdo)
- Person mit Domain-Registrar-Zugriff muss Nameserver-Wechsel durchführen

**Setup-Schritte (aus Memory cfb-dns-situation.md):**
1. Cloudflare-Account erstellen
2. Site `cfb-fordniehl.de` hinzufügen → Free Plan
3. Existierende DNS-Records importieren lassen
4. CNAME `passstelle → cname.vercel-dns.com` anlegen (Proxy: DNS only, graue Wolke)
5. Nameserver beim Domain-Registrar auf Cloudflare ändern
6. 1-24h warten
7. Vercel-Domain validieren

**Wer macht das?** Person mit Zugriff auf Domain-Registrar.
**Wo wurde die Domain registriert?** **Unklar — muss noch geklärt werden.** Optionen: Jimdo selbst, IONOS, Strato, GoDaddy. Im Vereinsarchiv prüfen oder bei Vorstand erfragen.

---

### Option B — Jimdo-Tarif-Upgrade prüfen (falls Cloudflare-Wechsel blockt)
**Aufwand:** Recherche 30min + ggf. Upgrade-Kosten
**Kosten:** ggf. höherer Jimdo-Tarif (Pro/VIP/Business+)
**Risiko:** Mittel — Jimdo Dokus widersprüchlich

**Status laut Memory:** Jimdo Business bietet **keine** eigenen DNS-Records. Höherer Tarif vielleicht? Unklar.

**Action:** Bei Jimdo-Support nachfragen: "Können wir auf Tarif XY upgraden, um einen CNAME-Record für `passstelle` zu Vercel zu setzen?"

**Pro:** DNS bleibt bei Jimdo, kein Wechsel-Risiko
**Contra:** Vermutlich keine Lösung; Jimdo ist konzeptionell als Closed-System gebaut

---

### Option C — Workaround: Bot auf Vercel-Subdomain bleiben lassen
**Aufwand:** 0h
**Kosten:** 0€
**Risiko:** Vertrauensbruch ("warum cfb-app.vercel.app statt cfb-fordniehl.de?")

**Verwendung:** Bis Cloudflare-Migration steht, läuft die App unter `soccer-app-cfb-frontend.vercel.app` (laut Memory).

**Pro:** Sofort einsatzbereit
**Contra:** Eltern sehen Domain die nicht zum Verein gehört → Vertrauensproblem; nicht Production-Ready

---

## Klärungs-Fragen für den Verein

### F1: Wo ist die Domain `cfb-fordniehl.de` registriert?
- [ ] Bei Jimdo selbst (über Jimdo-Account gekauft)
- [ ] Bei externem Registrar (IONOS, Strato, GoDaddy, etc.)
- [ ] Unbekannt — muss recherchiert werden

**Verifizieren via:** `whois cfb-fordniehl.de` (Registrar-Info), Vereins-Abrechnungen, Vereins-Email-Archiv durchsuchen nach "domain renewal"

### F2: Wer hat aktuell Login-Zugriff auf den Domain-Registrar?
- Name: ___________________
- Letzter Login bekannt: ___________________

### F3: Wer im Verein darf DNS-Änderungen autorisieren?
- Vorstand kollektiv?
- Tech-Lead allein?
- IT-Beauftragter wenn vorhanden?

### F4: Welche Risiken bei Nameserver-Wechsel?
- Falls Vereins-Email `@cfb-niehl.de` auch über Jimdo läuft → MX-Records sichern!
- Falls Vereins-Subdomains existieren → alle prüfen vor Wechsel

---

## Empfehlung

**Option A (Cloudflare-Migration)** für langfristige Lösung.
**Option C (Workaround)** für unmittelbaren Bot-Test, parallel Option A vorbereiten.

**Reihenfolge:**
1. F1 klären (Domain-Registrar identifizieren)
2. F2 klären (Wer hat Zugriff?)
3. F3 + F4 klären (Autorisierung + Email-Risiko)
4. Wenn F1-F4 sauber: Option A durchführen
5. Vercel-Domain `passstelle.cfb-fordniehl.de` validieren

**Zeitschätzung gesamt:** 30min Recherche + 2h Setup + 1-24h Wartezeit = ~1 Tag bis Live.

---

## Nach DNS-Migration zu prüfen
- [ ] Vereins-Website `cfb-fordniehl.de` weiter erreichbar (Jimdo)
- [ ] Vereins-Email `info@cfb-niehl.de` weiter funktional (MX-Records)
- [ ] `www.cfb-fordniehl.de` weiter zur Jimdo-Website
- [ ] `passstelle.cfb-fordniehl.de` zeigt CFB-Pass-Automation-App
- [ ] SSL-Zertifikat von Vercel automatisch ausgestellt
