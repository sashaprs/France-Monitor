# France Monitor — Design System

> **France Monitor** est un terminal d'intelligence économique, institutionnelle et territoriale dédié exclusivement à la France. Il centralise, structure et visualise en temps réel les données publiques françaises (INSEE, Banque de France, ministères, data.gouv.fr, DGFiP, Assemblée nationale, Sénat…) pour les analystes, investisseurs, journalistes, cabinets de conseil, collectivités et administrations.
>
> Positionnement : **un terminal Bloomberg + une plateforme géospatiale + un moteur de données publiques françaises.** Ce n'est ni un média, ni un site d'actualité — c'est un terminal de données décisionnelles. Fiabilité et **traçabilité** des sources sont au cœur du produit.

This project is the **design system** that backs that product: tokens, fonts, brand assets, reusable React components, and (forthcoming) full-screen UI kits.

---

## Design direction

The chosen direction is **Trade-Republic minimalism, light & institutional** (per the brief): a calm white canvas, generous whitespace, a single confident **French blue** accent, and clear financial up/down semantics. Structure comes from **hairline borders and space**, not heavy shadows or color. French national identity is **subtle** — a deep *Bleu France* for brand moments and a hexagon mark nodding to *l'Hexagone*, never flag-like decoration.

> The uploaded `uploads/design_system_template.html` (a dark neon-green/purple "Dark Tech" starter) was used **only as a structural reference**. The visual language here is entirely re-skinned per the answered brief.

---

## Sources & provenance

- **Brief**: company description pasted by the user (vision, sources, users, terminal structure).
- **Map geometry**: `assets/france-regions.geojson` — the 13 metropolitan régions, from [gregoiredavid/france-geojson](https://github.com/gregoiredavid/france-geojson) (`regions-version-simplifiee.geojson`, IGN Admin Express, Licence Ouverte). Projected to SVG paths in `components/map/regionPaths.js` (Mercator, viewBox `0 0 1000 963`).
- **Fonts**: Google Fonts — see *Typography* below.
- No Figma or codebase was provided.

---

## CONTENT FUNDAMENTALS

**Language.** French, throughout (UI labels, copy, data legends). Use proper French typography: non-breaking thin space as thousands separator (`3 228`), comma as decimal (`2,3 %`), `€`/`Md€`/`M€` for currency, `%` with a space before it (French convention).

**Voice.** Institutional, precise, neutral, factual. France Monitor *reports and structures*; it never editorializes, predicts, or persuades. No marketing superlatives, no hype, no exclamation marks in-product. Think INSEE press note crossed with a Bloomberg headline.

**Person.** Impersonal / third person for data ("La dette publique atteint…"). On the marketing surface, address the reader formally with **vous**, never **tu**. Avoid "we/nous" chest-beating.

**Casing.** Sentence case for titles and buttons ("Dette publique", "Exporter les données"). Reserve UPPERCASE only for the small tracked **labels/eyebrows** (`.fm-label`, 11px, 0.08em). Never all-caps headlines.

**Traceability is copy, not just UI.** Every figure names its source and date — "Source : INSEE · T3 2024". Unverified or estimated values are explicitly flagged ("Provisoire", "Estimation"). This is a product promise; the `SourceTag` component and the "Provisoire" badge exist for it.

**Numbers first.** Lead with the figure, then the label, then the context. Captions carry freshness ("Mise à jour il y a 4 min").

**Emoji.** None. Ever. This is an institutional data product.

**Examples**
- Module title: *Dette publique* · eyebrow: *MODULE*
- Stat: *3 228 Md€* / label *Dette publique* / delta *+2,1 %* / source *INSEE · T3 2024*
- Alert: *Donnée provisoire — chiffre susceptible d'être révisé au prochain trimestre.*
- Button: *Rechercher* · *Exporter* · *Comparer les régions*

---

## VISUAL FOUNDATIONS

**Color.** White (`--bg`) canvas; near-black cool ink (`#0B0E14`) text; a cool, lightly blue-tinted gray scale for structure. One accent: **interactive blue `#2563EB`** (`--accent`), with the deeper official **Bleu France `#000091`** reserved for brand/logo moments. **Marianne red `#E1000F`** for declines and alerts. Financial semantics are strict: **green `#0E8A52` = gain/▲, red = loss/▼**. A sequential blue ramp (`--seq-1…8`) drives the map choropleth. Tints (`--*-tint`) are very pale and used for badge/alert backgrounds only. See `tokens/colors.css`.

**Type.** **Schibsted Grotesk** (400–800) for everything structural — clean, neutral, institutional. **IBM Plex Mono** (400–600) for *all figures, deltas, tickers, source tags, IDs* — tabular numerals are on by default (`font-variant-numeric: tabular-nums`). Display 56 / H1 36 / H2 26 / H3 20 / body 15 / small 13 / caption 12 / label 11. Tight tracking on large sizes (`-0.02…-0.03em`); 0.08em uppercase on labels only. See `tokens/typography.css`.
> ⚠️ **Font substitution flagged:** the official typeface of the French State is **Marianne** (proprietary). Schibsted Grotesk is an open stand-in with similar neutral-humanist character. Swap to Marianne in production if licensed — change only `--font-sans` and `tokens/fonts.css`.

**Spacing.** 4px base scale (`--space-1…24`). Generous, Trade-Republic airy — panels breathe; density is achieved with type scale and alignment, not cramming.

**Backgrounds.** Flat white / `--surface-sunken` (#F7F8FA) for sidebars and recessed areas. **No gradients** (except the whisper-soft sparkline area fill), no textures, no patterns, no hero photography by default. The data and the map are the imagery.

**Corners & cards.** Soft but restrained radii — cards `--radius-lg` (14px), controls `--radius-md` (10px), pills 999px. A card is: white surface + **1px hairline border** (`--border` #E1E5EA) + lg radius, usually **no shadow**. Optional header row divided by `--border-subtle`. Elevation is reserved for things that truly float (popovers, hovered/clickable tiles).

**Borders & dividers.** The primary structural device. 1px hairlines everywhere; `--border-subtle` for inner row dividers, `--border-strong` for emphasis. No 0.5px tricks.

**Shadows.** Whisper-light and cool-tinted (`--shadow-xs…pop`). Most surfaces use none. Hover on a clickable tile lifts to `--shadow-sm`; popovers use `--shadow-lg`/`pop`. Never decorative drop-shadows.

**Motion.** Quiet and quick. `--dur-fast 120ms` for hovers/fills, `--dur-base 180ms` for toggles, `--dur-slow 280ms` for bars filling. Easing `--ease-out` (cubic-bezier(.22,1,.36,1)). No bounces, no springy overshoot, no infinite loops. Map fills and selections cross-fade.

**Hover / press.** Hover = subtle background step (`--surface-hover`) or border darken; primary buttons darken to `--accent-hover`. Map régions drop to ~0.78 opacity on hover. Focus = `--ring-focus` (3px soft blue ring). No transform scaling on press; selection is shown by border + ring, not motion.

**Transparency / blur.** Used sparingly — a sticky top bar may use a translucent white with backdrop-blur. Otherwise surfaces are opaque.

**Layout rules.** Terminal shell = fixed left **sidebar 248px** (`--sidebar-w`, modules), fixed **top bar 56px** (`--topbar-h`, search left / profile-settings-notifications right), and a main zone dominated by the **interactive France map** with a right **data panel ~360px** (`--panel-w`). Marketing pages cap at `--container-max` 1240px.

**Data-viz vibe.** Restrained, accurate, legible. Sequential blue for intensity; the categorical ramp (`--viz-1…6`) for distinct series. Tabular numerals always. No 3D, no glossy charts, no needless gridlines.

---

## ICONOGRAPHY

- **System:** [**Lucide**](https://lucide.dev) — thin (≈2px) stroke, rounded joins, 24×24 grid. Its quiet, geometric, institutional line style matches the brand exactly. Load from CDN: `https://unpkg.com/lucide@latest` (or `lucide-react` in production). Render at 16–20px in UI, stroke `currentColor`.
- A few **inline SVG glyphs** (search magnifier, chevron, check, alert) are baked directly into components (`SearchField`, `Select`, `SourceTag`, `Alert`) so those primitives have **no runtime icon dependency**.
- **No icon font, no emoji, no unicode pictographs** as icons. The only unicode marks used intentionally are the financial arrows **▲ ▼** in `DeltaPill` and the verified **✓**.
- **Brand mark:** `assets/logo-mark.svg` — a hexagon (*l'Hexagone*) in Bleu France with a single blue locator dot ("a monitored point"). `assets/logo-wordmark.svg` is the full lockup. Use the mark alone in the sidebar/top-bar; the wordmark on marketing and login.
- If a needed glyph is missing from Lucide, pick the nearest Lucide equivalent before reaching for another set — consistency of stroke matters more than the perfect metaphor.

---

## Index / manifest

**Root**
- `styles.css` — the entry point consumers link (imports only).
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css` (radii/shadows/motion/layout), `base.css` (reset).
- `assets/` — `logo-mark.svg`, `logo-wordmark.svg`, `france-regions.geojson` (raw source), `france-regions-paths.json` (projected).
- `readme.md` (this file) · `SKILL.md` (Agent-Skills wrapper).
- `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` — **generated** by the compiler; do not edit.

**Components** (`window.FranceMonitorDesignSystem_5343d8.<Name>`)
- `core/` — `Button`, `IconButton`, `Badge`, `DeltaPill`, `SourceTag`, `Avatar`
- `forms/` — `SearchField`, `Input`, `Select`, `Toggle`
- `data/` — `StatTile`, `Sparkline`, `DataTable`, `TrendBar`
- `surfaces/` — `Card`, `SectionHeader`, `Tabs`, `Alert`
- `map/` — `FranceMap` (+ `regionPaths.js`: `FRANCE_REGIONS`, `FRANCE_VIEWBOX`)

Each directory has a `*.card.html` specimen (Design System tab) and each component a `.d.ts` + `.prompt.md`.

**Foundation cards** (`guidelines/`) — Colors (brand, neutrals, semantic, sequential), Type (display, body, data), Spacing (scale, radii, shadows), Brand (logo).

**UI kits** (`ui_kits/`) — interactive click-through recreations, each with its own README:
- `terminal/` — the core view: sidebar modules + top bar + interactive `FranceMap` + right data panel + layer toggles + region drill-in. **Starting point.**
- `module/` — full Dette-publique dashboard: tabs, headline figure + area chart, stat tiles, provisional-data alert, regional ranking, administration split. **Starting point.**
- `marketing/` — landing page: hero with map, official-sources strip, features, positioning ("ni un média…"), target users, CTA. **Starting point.**

---

## Notes
All three UI kits are built and marked as starting points. The map geometry, tokens, components, and foundation cards are complete.
