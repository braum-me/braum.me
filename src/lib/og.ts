/**
 * OG-image cards for braum.me. Pure-SVG, brand-locked, 1200×630.
 * Rendered to PNG via @resvg/resvg-js at build time (scripts/build-og.ts).
 *
 * Why static PNG: Twitter/X and a few crawlers don't render SVG og:image.
 */

export interface OgCard {
  /** Mono eyebrow line: BRAUM · ME · ROUTING */
  eyebrow: string;
  /** Headline (≤ 28 chars renders cleanly). */
  title: string;
  /** Tagline under the title (≤ 80 chars). */
  tagline: string;
  /** Status badge label. */
  status: "LIVE" | "WIP" | "COMING SOON";
  /** Footer-mark line at bottom-left. */
  footer: string;
}

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};
const escapeXml = (s: string): string => s.replace(/[&<>"']/g, (c) => ESC[c] ?? c);

// Coarse char-class advance widths for Inter Bold, in em. Used to position the
// trailing mint dot after the title — resvg won't give us a real bbox at
// build time, so we approximate. Calibrated visually against braum.dev's PNGs.
const interBoldEmAdvance = (c: string): number => {
  if (/[ijl1!|.,:; \-']/.test(c)) return 0.27;
  if (/[frt]/.test(c)) return 0.42;
  if (/[mwMW]/.test(c)) return 0.78;
  return 0.55;
};
const measureInterBold = (s: string, fontSize: number): number =>
  Array.from(s).reduce((sum, c) => sum + interBoldEmAdvance(c) * fontSize, 0);

export function renderOgSvg(card: OgCard): string {
  const eyebrow = escapeXml(card.eyebrow);
  const title = escapeXml(card.title);
  const tagline = escapeXml(card.tagline);
  const status = escapeXml(card.status);
  const footer = escapeXml(card.footer);
  const statusFill = card.status === "LIVE" ? "#00C896" : "#F2EFE4";
  const statusOpacity = card.status === "LIVE" ? 1 : 0.45;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D3D2E"/>
      <stop offset="55%" stop-color="#051E16"/>
      <stop offset="100%" stop-color="#020E0A"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#00C896" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#00C896" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#2F8264" stroke-width="1" stroke-opacity="0.08"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- crosshair corners -->
  <g stroke="#F2EFE4" stroke-opacity="0.18" stroke-width="1" fill="none">
    <path d="M40 40 L40 64 M40 40 L64 40"/>
    <path d="M1160 40 L1160 64 M1160 40 L1136 40"/>
    <path d="M40 590 L40 566 M40 590 L64 590"/>
    <path d="M1160 590 L1160 566 M1160 590 L1136 590"/>
  </g>

  <!-- eyebrow -->
  <text x="80" y="120" fill="#00C896" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="22" font-weight="500" letter-spacing="4">${eyebrow}</text>

  <!-- title -->
  <text x="80" y="320" fill="#F2EFE4" font-family="'Inter', system-ui, sans-serif" font-size="112" font-weight="700" letter-spacing="-3">${title}</text>
  <circle cx="${Math.round(80 + measureInterBold(card.title, 112) - card.title.length * 3 + 18)}" cy="320" r="8" fill="#00C896"/>

  <!-- tagline -->
  <text x="80" y="400" fill="#F2EFE4" fill-opacity="0.75" font-family="'Geist', system-ui, sans-serif" font-size="30" font-weight="400">${tagline}</text>

  <!-- status badge -->
  <g transform="translate(80 510)">
    <rect x="0" y="0" width="${status.length * 14 + 48}" height="44" rx="4" fill="#000" fill-opacity="0.35" stroke="${statusFill}" stroke-opacity="${statusOpacity * 0.55}"/>
    <circle cx="22" cy="22" r="5" fill="${statusFill}" fill-opacity="${statusOpacity}"/>
    <text x="38" y="29" fill="${statusFill}" fill-opacity="${statusOpacity}" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="16" font-weight="500" letter-spacing="3">${status}</text>
  </g>

  <!-- footer mark -->
  <text x="80" y="585" fill="#F2EFE4" fill-opacity="0.45" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="14" letter-spacing="2.5">${footer}</text>
  <text x="1120" y="585" fill="#00C896" fill-opacity="0.7" font-family="'JetBrains Mono', ui-monospace, monospace" font-size="14" letter-spacing="2.5" text-anchor="end">SB·</text>
</svg>`;
}

/* ── Card definitions ───────────────────────────────────── */

export const CARDS: Record<string, OgCard> = {
  default: {
    eyebrow: "BRAUM · ME · ROUTING",
    title: "Stefan Braum",
    tagline: "IT-Leadership, KI und Digitalisierung im Mittelstand.",
    status: "LIVE",
    footer: "BRAUM.ME · ALLE ANLAUFSTELLEN",
  },
  mail: {
    eyebrow: "BRAUM · ME · KONTAKT",
    title: "Stefan erreichen",
    tagline: "Persönlich oder Consulting · Adresse auf Anfrage.",
    status: "LIVE",
    footer: "BRAUM.ME/MAIL",
  },
};
