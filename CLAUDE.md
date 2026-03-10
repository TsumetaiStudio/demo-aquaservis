# CLAUDE.md — CistimeBazeny.cz / AquaServis Demo

> **Znalostní báze projektu.** Statický demo web pro bazénový servis.
> **Klient:** Garden Servis JH s.r.o. (Jindřichův Hradec)
> **Brand:** CistimeBazeny.cz / AquaServis
> **Typ:** Statický web (HTML/CSS/JS, bez frameworku)

---

## Stack & Architektura

| Vrstva | Technologie |
|--------|-------------|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES5 kompatibilní) |
| Styling | Custom CSS s CSS proměnnými, fluid typography |
| Auth | localStorage-based demo auth (auth.js) |
| Data | localStorage (users, session, settings, newsletter, chat) |
| Icons | Inline SVG |
| Deploy | Netlify (statický hosting) |
| Repo | GitHub: TsumetaiStudio/demo-aquaservis |

## Klíčové soubory

```
├── index.html              # Homepage — hero, služby, recenze, CTA
├── sluzby.html             # Služby — grid s kartami služeb
├── cenik.html              # Ceník — porovnávací tabulka + balíčky
├── galerie.html            # Galerie — lightbox s 53 obrázky v 5 kategoriích
├── o-nas.html              # O nás — tým, mise, hodnoty
├── kontakt.html            # Kontakt — formulář + mapa + info
├── novinky.html            # Blog/Novinky — články
├── registrace.html         # Registrace zákazníka
├── prihlaseni.html         # Přihlášení
├── klientska-zona.html     # Dashboard zákazníka (objednávky, profil, zprávy)
├── admin.html              # Admin panel (stats, zákazníci, zprávy, faktury, galerie, nastavení)
├── reklamacni-rad.html     # Reklamační řád
├── smluvni-podminky.html   # Smluvní podmínky
├── 404.html                # Vlastní 404 stránka
├── favicon.svg             # SVG favicon (bazén s žebříkem)
├── sitemap.xml             # XML sitemap
├── netlify.toml            # Netlify konfigurace (redirects, headers)
│
├── css/
│   ├── style.css           # Hlavní styly (2800+ řádků)
│   ├── admin.css           # Admin panel + klientská zóna styly
│   ├── gallery.css         # Galerie lightbox styly
│   ├── pages.css           # Podstránky (ceník, služby, kontakt...)
│   └── ai-chat.css         # AI chat widget styly
│
├── js/
│   ├── main.js             # Hlavní JS (nav, scroll, animace, formuláře)
│   ├── auth.js             # Auth systém (localStorage, session, role)
│   ├── login.js            # Login page logika
│   ├── register.js         # Registrace s validací
│   ├── client-zone.js      # Klientská zóna (profil, objednávky, zprávy)
│   ├── admin.js            # Admin panel (2100+ řádků, CRUD, grafy)
│   ├── gallery.js          # Galerie lightbox + lazy loading
│   ├── ai-chat.js          # AI chat widget (pattern matching, CZ)
│   ├── form.js             # Kontaktní formulář
│   └── novinky.js          # Blog/novinky
│
├── images/
│   ├── gallery/            # 53 fotek (bazény, čištění, zastřešení, realizace, ČOV)
│   └── logos/              # Loga partnerů + firemní logo
│
└── .claude/
    └── launch.json         # Dev server konfigurace (port 8890)
```

## Dev příkazy

```bash
# Lokální dev server
npx serve . -l 8890 --no-clipboard --cors

# Nebo přes launch.json
# Server name: aquaservis-dev (port 8890)
```

## Auth systém

- **localStorage klíče:** `aquaservis_users`, `aquaservis_session`
- **Demo účty:**
  - Admin: `pekarna@webzitra.cz` / `321demo11`
  - Zákazník: `zakaznik@mail.cz` / `321demo11`
- **Role:** `admin` → admin.html, `customer` → klientska-zona.html
- **Globální API:** `window.AquaAuth.{init, register, login, logout, getSession, getUsers, findByEmail, isAdmin}`

## Design systém

- **Fonty:** Inter (body) — fluid typography s clamp()
- **Barvy:** `--primary: #2563eb` (modrá), `--accent: #06b6d4` (cyan), sekundární odstíny
- **Patterny:** Glassmorphic efekty, gradient pozadí, SVG vlny jako sekční přechody
- **Admin theme:** Dark mode (default) + light mode toggle, `[data-theme="dark/light"]`
- **Border-radius:** 1rem na kartách, 0.75rem na tlačítkách
- **Mobilní breakpointy:** 1024px, 768px, 480px, 375px

## Důležité vzory

1. **IIFE wrapper:** Každý JS soubor je zabalený v `(function() { 'use strict'; ... })();`
2. **escapeHTML():** Sanitizace uživatelských vstupů v admin panelu
3. **Accordion pattern:** `max-height` CSS transition pro expandovatelné detaily
4. **Tab navigace:** `.client-tab[data-panel]` → `.client-panel.active` SPA pattern
5. **Toast notifikace:** Dynamicky vytvořený `<div class="client-toast">` s auto-dismiss
6. **Galerie:** 5 kategorií (cisteni, bazeny, zastreseni, realizace, vodni-hospodarstvi)

## Netlify konfigurace

- **Site name:** GardenServisJH-Demo
- **Redirects:** `/* /index.html 200` (SPA fallback)
- **Headers:** Cache-Control, X-Frame-Options, CSP
