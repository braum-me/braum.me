# braum.me

Digitale Visitenkarte als **Routing-Karte**. Identity-Block + drei Link-Gruppen (Arbeiten · Lesen · Vernetzen). Ein Viewport, kein Scroll auf Desktop. Mail-Reveal hinter leichtem Name-Gate (personal / consulting getrennt).

## Stack

- Astro 5 · SSR via Node-Adapter
- TypeScript strict · Tailwind 4 · Biome
- Self-hosted Fonts (Geist, Inter, JetBrains Mono) via `@fontsource-variable`
- Umami Analytics (self-hosted, optional via env)
- Docker multi-stage · Node 22 Alpine

## Setup

```bash
pnpm install
cp .env.example .env   # Kontakt-Mails, Routing-URLs und optional Umami eintragen
pnpm dev                # http://localhost:4321
```

## Scripts

| Kommando | Zweck |
|---|---|
| `pnpm dev` | Lokaler Dev-Server |
| `pnpm build` | Astro-Check + Production-Build |
| `pnpm preview` | Production-Build lokal prüfen |
| `pnpm check` | TypeScript- und Astro-Diagnosen |
| `pnpm lint` | Biome-Checks |
| `pnpm format` | Biome-Format write |
| `pnpm og:build` | OG-Bilder neu rendern (`public/og/*.png` aus `src/lib/og.ts`) |

## Environment

Siehe `.env.example`. Zusammenfassung:

| Variable | Pflicht | Zweck |
|---|---|---|
| `CONTACT_NAME` | ja | Anzeigename |
| `CONTACT_EMAIL` | ja | Persönliche Mail (Mail-Gate, Typ "personal") |
| `CONTACT_EMAIL_CONSULTING` | ja | Consulting-Mail (Mail-Gate, Typ "consulting") |
| `CONTACT_ORG`, `CONTACT_TITLE` | ja | Anzeige-Daten |
| `CONTACT_URL` | ja | "Hub" · Ziel für `stefanbraum.de`-Link |
| `CONTACT_URL_CONSULTING` | ja | Ziel für Consulting-Link |
| `CONTACT_URL_ABOUTEXPORT` | ja | Ziel für SaaS-Link |
| `CONTACT_URL_BRAUMDEV` | ja | Ziel für Labs-Link |
| `CONTACT_URL_LINKEDIN` | ja | Ziel für LinkedIn-Link |
| `CONTACT_URL_GITHUB` | ja | Ziel für GitHub-Link |
| `UMAMI_SCRIPT_URL`, `UMAMI_WEBSITE_ID` | nein | Analytics wenn beide gesetzt |
| `HOST`, `PORT` | nein | Defaults `0.0.0.0` / `4321` |
| `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS` | nein | Kontakt-API-Limit (Default 5/15min) |

**`.env` nie committen.**

## API-Routes

| Route | Zweck |
|---|---|
| `POST /api/contact` | Body `{ name, type?: "personal" \| "consulting" }`, liefert Mail aus env. Rate-limited |
| `GET /api/health` | Healthcheck für Coolify |

## URL-Parameter

Für gezielte Shares und Audience-Targeting:

| Param | Effekt |
|---|---|
| `?focus=consulting` | Highlight auf den `braum.consulting`-Link (Pulse-Ring) |
| `?focus=aboutexport` | Highlight auf den `aboutexport.com`-Link |
| `?focus=hiring` / `?focus=cv` / `?focus=writing` | Highlight auf `stefanbraum.de` |

## Umami-Events (wenn aktiviert)

- `Link · {label}` bei jedem Klick auf eine Anlaufstelle (LinkedIn, GitHub, stefanbraum.de, braum.consulting, aboutexport.com, braum.dev)
- `Link · E-Mail` beim Öffnen des Mail-Panels
- `Kontakt · {name}` / `Consulting · {name}` bei erfolgreichem Mail-Reveal (Property `{ name, type }`)

## Deploy · Coolify

1. **Repo in Coolify anlegen** · Source: Git-Remote deiner Wahl · Branch `main`
2. **Build-Pack:** Dockerfile (auto-detected)
3. **Port:** `4321`
4. **Environment-Variablen** im Coolify-UI setzen (Platzhalter, echte Werte im Coolify-UI ergänzen):
   ```
   CONTACT_NAME=Your Name
   CONTACT_EMAIL=you@example.com
   CONTACT_EMAIL_CONSULTING=you@consulting.example
   CONTACT_ORG=Your Org
   CONTACT_TITLE=Your Title
   CONTACT_URL=https://your-hub.example
   CONTACT_URL_CONSULTING=https://your-consulting.example
   CONTACT_URL_ABOUTEXPORT=https://your-saas.example
   CONTACT_URL_BRAUMDEV=https://your-labs.example
   CONTACT_URL_LINKEDIN=https://www.linkedin.com/in/your-handle
   CONTACT_URL_GITHUB=https://github.com/your-handle
   UMAMI_SCRIPT_URL=https://umami.example.com/script.js
   UMAMI_WEBSITE_ID=00000000-0000-0000-0000-000000000000
   ```
5. **Domain** `braum.me` mit Let's-Encrypt-Zertifikat
6. **Healthcheck-Pfad:** `/api/health`
7. **Deploy** · Git-Webhook triggert auto-redeploy bei push auf `main`

## Lokal mit Docker testen

```bash
docker build -t braum-me .
docker run --rm -p 4321:4321 --env-file .env braum-me
```

## Struktur

```
src/
├── components/
│   ├── LinkCard.astro           # Single routing-link card (icon + title + sub + reveal)
│   ├── MailGate.astro           # Name-Gate + Captcha → reveals email
│   └── RoutingCard.astro        # Identity + 3 Link-Gruppen + Mail-Trigger
├── layouts/BaseLayout.astro     # Umami-Script, OG, JSON-LD, Ambient-Layers
├── lib/
│   ├── captcha.ts               # HMAC-signed math captcha (stateless)
│   ├── contact.ts               # Env → typed Contact (Mails + Routing-URLs)
│   ├── env.ts                   # Env-Helper (process.env + import.meta.env fallback)
│   ├── og.ts                    # OG-Card SVG renderer + card definitions
│   └── rate-limit.ts            # In-memory Rate-Limiter
├── pages/
│   ├── index.astro              # Homepage
│   ├── mail.astro               # /mail standalone Kontakt-Seite
│   └── api/
│       ├── captcha.ts           # GET issues challenge
│       ├── contact.ts           # Name-Gate → Mail
│       └── health.ts            # Coolify-Healthcheck
└── styles/global.css            # Tokens, Ambient, Routing-Card, Mobile

scripts/
└── build-og.ts                  # Renders src/lib/og.ts cards → public/og/*.png

assets/fonts-og/                 # TTFs für OG-Rendering (Inter, Geist, JetBrains Mono)

public/
├── logo-sb.png                  # Stefan Braum Brand (Favicon, stefanbraum.de-Link)
├── logo-cb.png                  # Braum Consulting Brand (braum.consulting-Link)
├── s-clean.png                  # Portrait (Schema.org image)
├── og/
│   ├── default.png              # 1200×630 Share-Preview Homepage
│   └── mail.png                 # 1200×630 Share-Preview /mail
├── robots.txt
└── sitemap.xml
```
