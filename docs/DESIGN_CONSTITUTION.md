# HealthOS Design Constitution — v1.0 (Official)

> **The single source of truth for the HealthOS design language.**
> Every component, screen, token, and piece of AI-generated UI must comply with this document.
> Where older code conflicts with this constitution, the constitution wins and the code is to be migrated — the constitution is **never** weakened to match the current implementation.

**Version:** 1.0 · Ratified status: **pending final approval** · Owner: Design System
**Scope:** Web app (Next.js + Tailwind), mobile (Capacitor), charts/analytics, all future UI work
**Design philosophy:** This document describes the **desired future state** of HealthOS. Implementation must evolve toward it. Incomplete implementation is a migration backlog, not a reason to lower the standard.

---

## Part 0 — Governance

## 0. Ratification & Enforcement

- **Binding contract:** Nothing ships (hand-written or AI-generated) until it passes this document.
- **Enforcement gates (mandatory):**
  1. **Lint gate:** an ESLint/Tailwind rule set enforcing the token-only rules (§2). Any PR that introduces an arbitrary design value fails CI.
  2. **Denylist:** arbitrary Tailwind values (`text-[…]`, `bg-[…]`, `border-[…]`, `rounded-[…]`, `shadow-[…]`, `w-[…]`, `h-[…]`, `p-[…]`, `m-[…]`) are rejected except the three documented exceptions (§2.3).
  3. **Hex check:** raw hex codes in components (class names, inline styles, chart `stroke`/`fill`/`stopColor`) fail review unless whitelisted by the token system.
  4. **Review checklist:** every component/PR is checked against this constitution before merge.
- **Amendment process:** changes to this constitution require a review + ratification cycle (§40). No unratified edits.

## 1. Mission, Vision & Design Philosophy

### 1.1 Mission
HealthOS is a **premium, luxury medical enterprise OS**. Every pixel must feel:

| Goal | Meaning |
|---|---|
| Premium | Materials: glass, mesh light, hairline borders, gradient washes — never flat gray |
| Luxury | Restraint, generous whitespace, handcrafted detail (top-edge glints, corner glows) |
| Medical Enterprise | Clinically trustworthy: calm, precise, deterministic; information is never decorative |
| Apple-level polish | Sub-pixel borders, spring-eased motion, flawless light/dark parity |
| Linear simplicity | Typography-first hierarchy, quiet chrome, focused density |
| Stripe consistency | One input style, one button style, one table style — everywhere |
| Tesla smoothness | Fast, physical-feeling transitions with a single signature easing |
| Professional hospital software | Safety-relevant clarity: status colors are semantic, never decorative |
| Minimal visual noise | One accent, one glow, one easing, one radius language — reused, never improvised |

### 1.2 The 10 Commandments of HealthOS UI
1. Reuse tokens. Never invent a color, spacing, radius, easing, or shadow.
2. Glass or die. Surfaces are glass (`--glass-fill`, `--surface-solid`), never flat hexes.
3. One easing rules motion: `cubic-bezier(0.16, 1, 0.3, 1)`.
4. Hairlines over boxes. 1px borders with `--border-strong` at emphasized edges.
5. Space is the luxury. Density is earned, never default.
6. Bilingual by birthright. English + Arabic (RTL) from the first pixel.
7. Semantic status. `--success/--warning/--error/--info/--neutral/--disabled` mean things — the brand accent never stands in for a status.
8. Animate cause, not decoration. Motion expresses hierarchy and state.
9. Reduced motion is a first-class citizen, not an afterthought.
10. No magic numbers. Every value traces to this document.

## 2. Design Governance (mandatory rules)

The **No-Arbitrary Doctrine** — these rules are absolute and enforced by the §0 gates:

### 2.1 No arbitrary values — everything from tokens
| Property | Rule |
|---|---|
| Spacing | Only the §9 scale. `gap-0.5 … gap-24`. No `p-[13px]`, no `m-[7px]`. |
| Colors | Only semantic tokens (§6) or the §6.5 chart palette. No `#…` in JSX, `className`, or `style`. |
| Typography | Only §8 faces/weights/sizes. No `text-[10px]`, no `text-[9.5px]`, no `font-…` other than `font-sans`/`font-display`/`font-mono`/`font-serif` (§8.1–8.2). |
| Border radius | Only §11 scale. No `rounded-[13px]`. |
| Animations | Only §14 keyframes/easings/durations. No inline `transition:`, no ad-hoc `@keyframes` outside the token library. |
| Shadows | Only §12 elevation tokens. No `shadow-[0_0_0_1px_#fff]`. |
| Inline design values | Inline `style` objects may reference **CSS variables only** (`var(--accent)`); literal colors/sizes are forbidden. Exception: dynamic chart data values (§34). |

### 2.2 Directional utilities
- New code must use **logical utilities only**: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `rounded-s/e-*`, `border-s/e-*`, `inset-inline-*`, `translate-x`/`rotate` only via the RTL flip contract (§17.7).
- **Forbidden in new code:** `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`, `border-l-*`, `border-r-*`, `rounded-tl/tr/bl/br-*`, physical `translate-x-*`.
- Existing physical utilities are legacy debt; see §40 migration plan.

### 2.3 Documented exceptions (arbitrary values allowed)
1. Page padding `p-6` (mandated by §16).
2. App-rail width `w-[72px]` (mandated by §31).
3. Icon size `size-[18px]` (mandated by §15).
Everything else arbitrary is rejected.

### 2.4 Governance of shared primitives
- The design-system primitives (`components/ui/design-system/`) are the **only** sanctioned place for reusable components. Workspaces may not each build their own `Field`, `Modal`, or `Table`.
- Any shared primitive added must be registered here (see §38.5 inventory) before reuse.
- Dead code (`WorkspaceSidebarNav` as of v1.0) must be adopted or removed; it may not be cited as an established pattern while unrendered.

---

## Part I — Foundations

## 3. Design Principles

1. **Typographic hierarchy first.** Space Grotesk for display, Manrope for UI. Hierarchy from size/weight/tracking, not colored boxes.
2. **Glass materials.** Background is `--mesh` (two radial blooms + vertical gradient, fixed attachment); surfaces float above it.
3. **Light within light, dark within dark.** Layers: `bg` → `bg-2` → `bg-3` (app levels); `surface` → `surface-2` → `surface-3` (fill levels); `surface-solid` (opaque chrome).
4. **One strong accent.** `--accent` is the only saturated brand color; semantic status colors are the only other voices, and the accent never replaces a semantic status.
5. **Hairline discipline.** Borders are 1px `--border` (quiet) or `--border-strong` (emphasized). Never 2px except RTL logical-swap contexts (fixed per §17.5).
6. **Progressive disclosure.** More data is revealed by interaction, not by crowding the first view.
7. **Determinism.** Same state → same layout. No layout shift; tables reserve headers; skeletons reserve geometry.
8. **Accessibility is design, not a checklist.** Runs through every section.
9. **Bilingual parity.** EN and AR are equal citizens, never translations bolted on.

## 4. Terminology (canonical)

| Term | Definition |
|---|---|
| Token | A named CSS variable or Tailwind-extended value defined in §6–15. The only legal design value. |
| Semantic token | A status token (success/warning/error/info/neutral/disabled) with a fixed meaning. |
| Surface | A background fill level: `--bg*`, `--surface*`, `--surface-solid`. |
| Chrome | App furniture: `nav`, `aside`, `header` — always `--surface-solid` + heavy blur. |
| Hairline | A 1px border using `--border` or `--border-strong`. |
| Glass | A surface using `--glass-fill` (translucent, blur 22px) or `--surface-solid` (opaque, blur 44px). |
| Primary action | The single dominant action in a task group — `.btn-primary`. |
| Stat tile | A dashboard metric card (§32). |
| Data table | A table with a `<thead>`, scroll wrapper, and (when wide) sticky identifier column (§23). |
| Workspace | A submodule panel in the Organization Workspace (15 max) or app chrome. |
| View | A bounded screen region (page, panel, modal) — the unit for "one gradient wash" and "one primary action." |
| Edge | The logical start/end (RTL-aware). `start` = right in Arabic, `end` = left. |

## 5. Brand Identity

### 5.1 Brand Name & Voice
- **Name:** HealthOS — "Luxury Clinical OS".
- **Voice:** Calm, expert, human. Copy clinical in substance, warm in tone. AR and EN equal.
- **Personality:** A five-star private clinic's front desk: precise, discreet, premium.

### 5.2 Signature Palettes (the "two signatures")
| Signature | Mission colors | Personality |
|---|---|---|
| **B · Luxury Purple** (default) | `#9B71B2` amethyst · `#3A1C36` dark plum · `#E3D0EA` orchid · `#FBF1FF` violet-light | Modern medical luxury, default |
| **A · Luxury Earth** | `#55443A` chestnut · `#8A9992` morning blue · `#4D2308` espresso · `#CFD0CD` almond | Calm, grounded, editorial |

### 5.3 Logo & Wordmark
- Wordmark in **Space Grotesk**, tracking `-0.03em`, accent gradient via `.text-gradient`.
- The 1px **top-edge glint** (`.glass::before`, `.card-gradient::after`) is a brand micro-detail on every primary surface.

### 5.4 Brand Applications
- **Web:** theme B purple, dark default.
- **Mobile (Capacitor):** same tokens, native focus rings.
- **Print/PDF:** light themes; white-on-purple identity.
- **Browser/PWA chrome:** `themeColor`/`msapplication-TileColor` must derive from the active theme accent (§7.5). Never a hardcoded green or any color outside the theme matrix.

---

## Part II — Tokens

## 6. Color System

### 6.1 Semantic roles
| Token | Purpose |
|---|---|
| `--bg`, `--bg-2`, `--bg-3` | app background levels |
| `--surface`, `--surface-2`, `--surface-3` | interactive fill levels |
| `--surface-solid` | opaque chrome: modals, nav, poppers |
| `--border`, `--border-strong` | hairlines (quiet / emphasized) |
| `--text`, `--text-sub`, `--text-muted` | text hierarchy |
| `--accent`, `--accent-hi`, `--accent-dim` | brand action |
| `--accent-glow`, `--accent-glow2` | halo / subtle tint |
| `--success`, `--warning`, `--error`, `--info`, `--neutral`, `--disabled` | semantic status |
| `--chart-1…4`, chart support tokens | analytics (§6.5) |

### 6.2 The complete semantic color system

Every semantic state has **three registered expressions** plus an **on-color** for solid fills. This is the complete, official set — no additional status variants may be improvised.

| State | Meaning | Token set |
|---|---|---|
| **Success** | complete / active / available / healed | `--success` · `--success-bg` · `--success-border` · `--success-strong` · `--on-success` |
| **Warning** | attention / caution / pending-critical | `--warning` · `--warning-bg` · `--warning-border` · `--warning-strong` · `--on-warning` |
| **Error** | failure / invalid / critical | `--error` · `--error-bg` · `--error-border` · `--error-strong` · `--on-error` |
| **Info** | informational / neutral-procedural | `--info` · `--info-bg` · `--info-border` · `--info-strong` · `--on-info` |
| **Neutral** | inactive / archived / offline / not-applicable | `--neutral` · `--neutral-bg` · `--neutral-border` · `--neutral-strong` · `--on-neutral` |
| **Disabled** | disabled / non-interactive | `--disabled-text` · `--disabled-bg` · `--disabled-border` |

**Token derivation rules (applies in every theme):**
- `--*-bg` (tint): `color-mix(in srgb, <core> 14%, transparent)` — badge/surface backgrounds.
- `--*-border` (hairline): `color-mix(in srgb, <core> 40%, transparent)` — emphasized border.
- `--*-strong` (solid): the saturated core — solid fills, selected markers, chart emphasis.
- `--on-*`: guaranteed-contrast text color for use on `--*-strong` fills (dark in dark mode, dark-on-pastel; light in light mode). Verified ≥ 4.5:1 (§19).
- **Dark mode cores:** success `#6ee7b7` · warning `#fcd34d` · error `#fca5a5` · info `#93c5fd` · neutral `#9ca3af`.
- **Light mode cores:** success `#059669` · warning `#d97706` · error `#dc2626` · info `#2563eb` · neutral `#6b7280`.
- **Disabled (both modes):** `--disabled-text = color-mix(in srgb, var(--text-muted) 40%, transparent)`; `--disabled-bg = var(--surface)`; `--disabled-border = var(--border)`.

### 6.3 The Brand-Never-Semantic Rule (binding)
- `--accent` and `--gradient` are **brand only**. They must never be used to communicate success, warning, error, info, neutral, or disabled states.
- Known defect to fix (see §41): the legacy remap at `main.css` maps `text-amber-*` → `var(--accent)`. **This must be corrected to `var(--warning)`.** Until fixed, warning states are broken; the fix is mandatory before ratification of the amber mapping.
- The design-system `<Badge>` must use `var(--success)/var(--warning)` etc. — never hardcoded hexes.

### 6.4 Status color policy
- **Never decorative.** Green = healed/available/success; amber = warning/attention; red = error/critical; blue = info/procedural; gray = neutral/inactive.
- Implemented via the §6.2 token sets. Legacy utilities (`text-emerald-*`, `text-amber-*`, `text-red-*`, `text-blue-*`) are remapped by `main.css` to the **matching** status token — no cross-mapping to accent (fix in §6.3).

### 6.5 Chart / analytics palette (tokens, not hexes)
| Token | Role | Derivation |
|---|---|---|
| `--chart-1` | primary series | `var(--accent)` |
| `--chart-2` | secondary series | `var(--info)` |
| `--chart-3` | positive series | `var(--success)` |
| `--chart-4` | warning series | `var(--warning)` |
| `--chart-grid` | gridlines/axes | `var(--border)` |
| `--chart-tooltip-bg` | tooltip surface | `var(--surface-solid)` |
| `--chart-tooltip-border` | tooltip border | `var(--border-strong)` |
| `--chart-label` | axis/tick labels | `var(--text-muted)` |

**Rules:** chart `stroke`/`fill`/`stopColor` must reference `var(--chart-*)` or `var(--text-*)`. Raw hex chart colors are forbidden (§34). Max 4 categorical series; additional series require a governance amendment.

### 6.6 Contrast minimums (enforced, §19)
- `--text` on `--bg`/`--surface-solid`: ≥ 12:1. `--text-sub`: ≥ 7:1. `--text-muted`: ≥ 4.5:1 for text, ≥ 3:1 for large/UI components.
- `--accent` as text on `--bg`: ≥ 4.5:1 (both modes verified). Primary button: `color: var(--bg)` on gradient.
- All `--on-*` colors: ≥ 4.5:1 on their `--*-strong` fill.

## 7. Theme Architecture

### 7.1 The Matrix
`data-theme` × `data-mode` → 4 complete token palettes.

| | `data-mode="dark"` | `data-mode="light"` |
|---|---|---|
| `data-theme="purple"` | **Default** (`:root`) | alternate |
| `data-theme="earth"` | alternate | alternate |

### 7.2 Rules
1. Never hardcode light/dark — consume tokens; theme swap is free.
2. Default = purple + dark. Earth is the calm alternative.
3. Theme transitions animated: `background-color 0.45s cubic-bezier(0.16,1,0.3,1), color 0.3s`.
4. Chrome (`nav`, `aside`, `header`) always `--surface-solid` + `blur(44px) saturate(180%)`, both modes.
5. Legacy class aliases (`.theme-crimson`, `.theme-earthy`, `.theme-amethyst`) preserved; new code ignores them.
6. Photos/avatars excluded from theme logic.

### 7.3 Surfaces and dark/light mode
| Mode | `--bg` | `--bg-2` | `--bg-3` | `--surface-solid` | glass-fill |
|---|---|---|---|---|---|
| Dark | `#0b0710` | `#120b1a` | `#191022` | `#150d1f` | `rgba(255,255,255,0.035)` |
| Light | `#FBF1FF` | `#f3e9fa` | `#eadff4` | `#ffffff` | `rgba(255,255,255,0.55)` |

(Earth dark: `#100d0b/#171310/#1e1916/#1a1512`; Earth light: `#F4F2EE/#ebe7e0/#e2ddd2/#ffffff`. Full matrices in `styles/main.css:20-213`.)

### 7.4 Adding a theme
Add a `html[data-theme='x'][data-mode='y']` block defining **all** tokens (§6–12 complete audit). Missing tokens = broken theme.

### 7.5 PWA / browser chrome theming
- `viewport.themeColor`, `msapplication-TileColor`, and mobile status bar colors **must derive from the active theme accent** (theme-aware at runtime; static fallback = the default purple accent `#9B71B2`).
- Current `#10b981` emerald in `app/layout.tsx` is a **defect** — it is not in either palette and must be replaced (see §41).

### 7.6 `bg-black`/`bg-white` surface ban (binding)
- New code must not use `bg-black`/`bg-white` for surfaces. Use `--bg`, `--surface-*`, or `--surface-solid`.
- Backdrop scrims (modal overlays) are the sole exception: use `var(--bg)` at 50–60% opacity + `backdrop-blur`.
- The ~128 existing `bg-black*` uses are migration debt (§40).

## 8. Typography Scale

### 8.1 Official font families (final — do not downgrade)
| Role | Family | Weights | Tracking |
|---|---|---|---|
| Display / Headings | **Space Grotesk** | 400–700 | `-0.025em` → `-0.03em` |
| UI / Body | **Manrope** (primary) → Inter fallback | 400–800 / 300–900 | 0 |
| Mono / IDs / kbd | **JetBrains Mono** | 400–700 | `tnum` |
| Arabic | **Noto Sans Arabic** (primary) → **Tajawal** | 400–700 | 0 |
| Editorial serif (legacy) | Cormorant Garamond | — | — |

- Body stack: `'Manrope', 'Inter', 'SF Pro Text', 'SF Pro Display', system-ui, -apple-system, 'Segoe UI', 'Noto Sans Arabic', 'Tajawal', sans-serif`.
- **Font shipping rule (binding):** all official families — including **JetBrains Mono** and **Noto Sans Arabic/Tajawal** — **must be loaded**. Current build loads only Manrope/Inter/Space Grotesk; JetBrains Mono (1,473 uses) and the Arabic faces fall back to system fonts. This is a migration item (§40) — the constitution does not lower the standard.

### 8.2 Type scale (final)
| Level | Face | Size | Weight | Line | Notes |
|---|---|---|---|---|---|
| Display (hero) | Space Grotesk | `text-5xl/6xl` | 700 | 1.05–1.1 | `.section-title`, `ls -0.03em` |
| Page title | Space Grotesk | `text-3xl/4xl` | 700 | 1.1 | balance wrap |
| Section title | Space Grotesk | `text-xl/2xl` | 700 | 1.1 | `ls -0.025em` |
| Eyebrow | Space Grotesk | `.65rem` | 700 | — | `ls .22em`, uppercase, accent |
| Card title | Manrope | `text-base/lg` | 700 | 1.3 | |
| Body / UI | Manrope | `.8125–.875rem` | 500–600 | 1.5 | default |
| Table cell | Manrope | `.75rem` | 500 | — | |
| Table header | Manrope | `.625rem` | 700 | — | `ls .18em`, uppercase, muted |
| Badge | Manrope | `.625rem` | 700 | — | `ls .08em`, uppercase |
| Caption / meta | Manrope | `.625–.75rem` | 500 | — | `--text-muted` |
| Kbd / ID | JetBrains Mono | `.625rem` | 700 | — | `tnum` |

### 8.3 Hierarchy rules (resolving current drift)
1. **Headings are Space Grotesk (display) or Manrope (UI).** `font-mono` is reserved for data/IDs and is **forbidden on headings**. Current mono headings (EHR/Document section labels) must migrate.
2. **Page titles are Space Grotesk `text-3xl/4xl`** — the current `font-sans text-xl/2xl` page-title pattern is a migration item, not a new standard.
3. `text-[…]` arbitrary sizes are forbidden (§2). The 1,570 existing arbitrary sizes are migration debt.
4. Min interactive text `.8125rem`; button text `.875rem` minimum.
5. `tnum` on all numbers (stat tiles, tables, IDs) via `font-feature-settings: 'tnum' 1`.
6. **Arabic:** never apply `text-transform: uppercase` to Arabic text (Arabic has no case). Arabic uppercase-decorative elements (eyebrows, table headers) must render with letter-spacing only and `text-transform: none` under `[dir='rtl']`. Line-height ≥ 1.5 always.
7. Mono content is forced `direction: ltr` by the RTL layer for IDs/code — correct and required (§17.6). Badges that mix mono + Arabic label content must separate the Arabic label (RTL) from the numeric ID (LTR) into distinct spans.

## 9. Spacing System

Base unit: **4px**. All spacing on the 4px grid. Semantic names only.

| Token (Tailwind) | px | Use |
|---|---|---|
| `space-y-0.5` | 2 | kbd/icon micro-gap |
| `gap-1` | 4 | badge inner, micro |
| `gap-1.5` | 6 | badge inner (`.375rem`) |
| `gap-2` | 8 | button/nav icon↔label |
| `gap-2.5` | 10 | form label↔input |
| `gap-3` | 12 | card internal sections, input groups |
| `gap-4` | 16 | toolbar, compact card content |
| `gap-6` | 24 | card content↔padding, stat separation, **page grid gutters** |
| `gap-8` | 32 | page section separation |
| `gap-10` | 40 | major page breaks |
| `gap-12` | 48 | hero/empty-state breathing room |
| `gap-16` | 64 | section-level breaks (enterprise) |

**Hard rules:**
- Cards: internal `p-6` (24px). Buttons: `.625rem 1.25rem`. Inputs: `0.75rem 1rem`.
- Never use odd non-4px spacings.
- RTL: logical utilities only (§2.2, §17).
- **Clarification (resolves §5 ambiguity):** "gutters 1.5rem" = page grid column gap (`gap-6`). Card internal padding is a separate `p-6`. These are not interchangeable.

## 10. Grid System

- **12-column grid** (Tailwind default), gutters `1.5rem` (`gap-6`), fluid to container (max 1400px).
- Breakpoints (Tailwind defaults):
  | Prefix | min-width | Use |
  |---|---|---|
  | (base) | 0 | mobile, single column |
  | `sm` | 640px | two-up stat tiles |
  | `md` | 768px | tables readable |
  | `lg` | 1024px | 3-col content grids |
  | `xl` | 1280px | full enterprise density |
  | `2xl` | 1400px | capped container |
- **Dashboard:** stats `1/2`→`1/3`→`1/4`; main `2/3` + aside `1/3`; tables full-width below.
- **Tablets/mobile:** stack cards, wrap toolbars, icon rail → drawer (§31), wide tables scroll with sticky identifier (§23).

## 11. Border Radius Rules

A tight, disciplined radius language:

| Token | Radius | Use |
|---|---|---|
| `rounded-full` | 9999px | pills: badges, kbd, avatars, indicators |
| `rounded-[1.75rem]` (28px) | `1.75rem` | **flagship card radius** — `.glass`, `.card-*`, `.magic-spotlight-card`, dialogs |
| `rounded-2xl` | 1rem | buttons, `.nav-item`, accordions |
| `rounded-xl` | `.875rem` (14px) | inputs, selects, textareas |
| `rounded-lg` | `.5rem` | small controls, cell chips |
| `rounded-4xl` / `rounded-5xl` | 2rem / 2.5rem | hero / feature cards |

**Rules:**
- Cards ≥ 1.5rem are **not** part of the system. The flagship is **1.75rem**. The current de-facto `rounded-3xl` (1.5rem) is migration debt → `1.75rem`.
- Interactive small controls `1rem`; inputs `0.875rem`; tiny = pill.
- Dialog `1.75rem`; buttons inside dialog `1rem`.
- No arbitrary `rounded-[…]`.

## 12. Elevation Rules

Elevation = shadow + border ring, never shadow alone. Layered from the `--mesh` background.

| Layer | Recipe | Shadow token |
|---|---|---|
| L0 · chrome/quiet | `--surface-2`, 1px `--border` | none |
| L1 · cards | `--glass-fill` + blur 22 | `--shadow-card` |
| L2 · hovered/selected | glass-fill-hover, border-strong | `--shadow-card` lifted |
| L3 · glowing card | `card-hover:hover` | `0 32px 80px -32px var(--accent-glow)` + 1px border-strong |
| L4 · popovers/menus | `--surface-solid` + blur 44 | `--shadow-pop` |
| L5 · modals | `--surface-solid` + blur 44 + border-strong | `--shadow-pop` |

Tailwind shadows available: `soft`, `elevated`, `glow`, `glow-lg`, `inner-line`.
- Hover: `translateY(-4px)` cards, `translateY(-1px)` buttons, on the signature easing.
- **Rule:** raw `shadow-2xl`/`shadow-lg`/`shadow-xl` and inline shadow hexes are forbidden — they are the current drift and must migrate to these tokens.

## 13. Glassmorphism Rules

Glass is the core material. Two recipes:

### 13.1 `--glass-fill` (translucent, interactive) — cards, buttons, inputs
```
background: var(--glass-fill)                  /* ~3.5% white (dark) / 55% white (light) */
backdrop-filter: blur(22px) saturate(160%)     /* --glass-blur */
border: 1px solid var(--glass-border)
```
Hover: `--glass-fill-hover`, border → `--border-strong`.

### 13.2 `--surface-solid` (opaque chrome) — modals, nav, poppers, dialogs
```
background: var(--surface-solid)
backdrop-filter: blur(44px) saturate(180%)     /* --glass-blur-heavy */
border: 1px solid var(--glass-border) / --border-strong
```

### 13.3 Signature details (non-negotiable)
1. **Top-edge glint:** 1px `linear-gradient(90deg, transparent, <border-strong at 50%>, transparent)` on every primary surface.
2. **Corner bloom:** soft `radial-gradient(--accent-glow2)` top-right (220×220px, -60px offset) on interactive glass. **RTL:** mirror bloom to the logical top-start (top-left in Arabic).
3. **Gradient wash:** `.card-gradient::before` = `--gradient-soft` at 14%, rising to 20% on hover.
4. **Saturate:** every blurred surface `saturate(160–200%)`.

### 13.4 Anti-patterns
- No blur-on-blur beyond 2 glass layers deep — use `--surface-solid`.
- No blur under modals beyond the chrome layer.
- Light-mode glass (55% white) — never white text on it.

## 14. Motion & Animation Rules

### 14.1 The signature easing
- `cubic-bezier(0.16, 1, 0.3, 1)` — ALL entrance, hover, layout, theme transitions.
- Press: `scale(0.98)` primary/secondary, `scale(0.965)` global `:active`, 0.15s.

### 14.2 Duration scale
| Duration | Use |
|---|---|
| `0.15s` | hover color/bg, micro |
| `0.2s` | input focus, badge states |
| `0.25–0.35s` | card hover, borders, shadows |
| `0.28s` | `.animate-scale-in` (modal/panel) |
| `0.4s` | card gradient wash |
| `0.45s` | theme bg transition |
| `0.5s` | `.animate-fade-up`, `.animate-fade-in` |

### 14.3 Prescribed animations (complete library)
`.animate-scale-in` (0.28s) · `.animate-fade-up` (0.5s) · `.animate-fade-in` (0.5s) · `.skeleton` (shimmer 1.6s) · `.magic-shimmer-btn` (3s) · `.pulse-glow` (3.2s) · `.aurora`/`.float-y`/`.float-spin` (ambient) · `.gradient-border` (8s) · `.header-shimmer` (3.5s).

### 14.4 Rules
- Animate cause, not decoration. No ambient motion in dense data views.
- No bounce/drop-in beyond scale-in.
- **Stagger:** ≤ 120ms apart, one surface at a time (guidance, not hard rule).
- **Reduced motion:** the global kill-switch (main.css §REDUCED MOTION) is authoritative. New `@keyframes` must be added to the token library and will be killed by the switch automatically. No per-component reduced-motion logic.
- **Entrance direction is logical, not physical:** slide-ins for drawers follow start/end (§17.7), not left/right.

## 15. Icon System

- **Source:** `lucide-react` (sole icon library).
- **Sizes:** `size-3.5` (14) meta · `size-4` (16) table · `size-[18px]` (18) nav · `size-5` (20) buttons · `size-6` (24) headers/empty states.
- **Style:** `strokeWidth` 1.75–2 (1.5 only for hero icons). Round caps/joins.
- **Color:** `currentColor`; `--text`/`--text-muted` chrome, `--accent` active/selected, status tokens for status.
- **Rules:**
  - One library, one style. No other icon vendors.
  - Icons are never the sole affordance — critical actions pair with text.
  - Icon buttons need `aria-label`.
  - **Directional icons** (arrows, chevrons, `ArrowRight`, `ChevronLeft/Right`, `MoveRight/Left`, `Send`, `ExternalLink` when it implies direction, undo/redo) flip in RTL via `rtl:-scale-x-100` (§17.7). Symmetric icons (settings, search, calendar, users) never flip.
  - Missing visual content (org logos, avatars) → initial-letter monogram in accent pill.

---

## Part III — Layout & Language

## 16. Layout Rules

### 16.1 Page skeleton
```
<app shell>          → icon rail (w-[72px] → hover:w-64) + content
<page>               → max-width container, centered, padding 2rem
  <header row>       → eyebrow + title (Space Grotesk) + primary action(s) at logical end
  <toolbar/segments> → sticky on scroll, glass chrome
  <content grid>     → 12-col, responsive collapse
  <footer/quiet>     → muted meta, kbd hints
```
- Container: `max-w-7xl`-class width ≤ 1400px, centered, `padding: 2rem`.
- Page header: eyebrow (`.65rem`, `ls .22em`, accent) → `.section-title` (Space Grotesk 700) → subtitle (`--text-sub`) → actions.
- Action placement mirrors direction: primary at logical **end** (right in LTR, left in RTL).
- No horizontal page scroll; long tables scroll inside `scrollbar-none` wrappers.

### 16.2 Alignment
- 12-col grid, 4px vertical rhythm (§9).
- Headings `text-wrap: balance`; body natural.
- Numeric columns right-aligned with `tnum` (tables, stats, IDs).

## 17. RTL Architecture (production-ready)

RTL is not a hack layer — it is a **first-class, logical-first system**. This section replaces the legacy remap approach as the standard.

### 17.1 Principles
1. **Logical-first:** all directional styling uses logical properties (`margin-inline-start`, `inset-inline-*`, `text-align: start`, logical utilities). Direction is expressed once, at the `<html dir>` level.
2. **The `tailwindcss-rtl` plugin is the mechanism** (`ms/me/ps/pe/start/end`, `text-start/text-end`, `rounded-s/e`, `border-s/e`, `float-start/end`).
3. **The `main.css` remap block is legacy migration only.** It is incomplete (covers a fixed whitelist) and must not be extended. New code never depends on it.

### 17.2 Directional utilities (binding)
- **Must use:** `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `rounded-s-*`, `rounded-e-*`, `border-s-*`, `border-e-*`, `inset-inline-start/end`, `translate` via logical contract.
- **Forbidden in new code:** `ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`, `text-left`, `text-right`, `border-l-*`, `border-r-*`, `rounded-tl/tr/bl/br-*`, physical `translate-x-*`, `rotate-180`.

### 17.3 Layout mirroring contract
| Pattern | LTR | RTL |
|---|---|---|
| Text alignment | `text-start` = left | `text-start` = right |
| Rail / drawer origin | start = left edge | start = right edge |
| Action button placement | logical end = right | logical end = left |
| Search icon in input | `ps-*` left | `ps-*` right |
| Back/forward chevrons | `rotate-180` when navigating toward end | mirrored via same rule on the logical axis |
| Table numeric columns | `text-start`/`text-end` per semantics | automatic |

### 17.4 The `start`/`end` convention
- `start` = reading direction origin (LTR left, RTL right). `end` = the opposite.
- Nav indicator bars, drawer slides, FAB toasts, chat bubbles, search icons — all anchor to **start/end**, never left/right.

### 17.5 Remap block fixes (mandatory before ratification)
The legacy block at `main.css:949-988` has two width bugs that must be corrected:
- `.border-l` (should be 1px) is currently given `border-right-width: 2px`.
- `.border-r-2` (should be 2px) is currently given `border-left-width: 1px`.
These invert border weights on RTL and must be fixed during migration (§40).

### 17.6 Content direction rules
- Numeric IDs, codes, versions, kbd, and pure-mono content are always `direction: ltr` (embedded LTR), enforced by the `[dir='rtl'] .font-mono` rule.
- Mixed spans (Arabic label + Latin ID) split into two spans with explicit `dir`.
- Body text `text-align: right` in RTL (global).

### 17.7 Icon & transform flipping contract
- Flip (via `rtl:-scale-x-100`): directional arrows/chevrons/send/move icons.
- Never flip: symmetric icons.
- Entrance slides for drawers/panels animate on the logical axis (`animate` from `start`).
- Toggle/slider handles (`translate-x-*`) must use logical positioning so the "on" position mirrors correctly in RTL.

### 17.8 Testing matrix (mandatory)
Every release ships tested against: EN-LTR × AR-RTL × {mobile, tablet, desktop} × {both themes} × {both modes}.

## 18. Responsive Rules

| Breakpoint | Behavior |
|---|---|
| base (<640) | single column; stat tiles stack; toolbars wrap; tables scroll with sticky identifier; rail → hamburger drawer; buttons full-width in sheets |
| `sm` (640) | 2-up stat grid; compact tables |
| `md` (768) | full tables; dialog default width |
| `lg` (1024) | 3-col grids; rail fully usable |
| `xl+` (1280) | full enterprise density; hover-expanded rail |
- **Touch:** targets ≥ 44px on ≤`md`; `touch-action: manipulation`.
- **Container:** fluid to 1400px cap; page padding `2rem`.
- **RTL = responsive:** layout mirrors at every breakpoint via logical utilities; no breakpoint-specific RTL hacks.
- **Mobile nav is the hamburger drawer** (chosen pattern); bottom nav is **not** used.

## 19. Accessibility Rules (WCAG 2.1 AA minimum)

1. **Contrast:** enforced minimums in §6.6. A measured token-contrast matrix per theme/mode is maintained in §41 and verified in CI (axe-core).
2. **Focus visibility:** global ring `3px var(--accent-glow2)` + `1px var(--accent)` on `:focus`. Never remove outline without a replacement ring. Interactive nav pills must expose a visible focus ring (the inline `layoutId` pill in the shell must keep one).
3. **Reduced motion:** global kill-switch; token-based animations only (§14.4).
4. **Semantics:** native elements; Radix primitives for dialog/tabs/popper (focus trap, ARIA built-in).
5. **Labels:** every input has a real `<label>`; icon-only buttons `aria-label`; nav `aria-current`.
6. **Keyboard:** full keyboard operability — arrows for tabs, Esc for dialog/drawer, Enter/Space for controls.
7. **Touch:** ≥ 44px targets ≤md; `-webkit-tap-highlight-color: transparent`.
8. **RTL/Arabic:** `dir` on `<html>`, `text-align: right`, logical props, Arabic fonts loaded (§8.1).
9. **Announcements:** `aria-live` for async status (toast success/failure).
10. **Screen-reader hierarchy:** one `h1` per page; headings nest without skipping; heading faces not used for non-headings.
11. **Status not color-only (AA 1.4.1):** success/warning/error/neutral always pair a status color with an icon or text label. A bare color chip without a label is forbidden for meaningful states.

---

## Part IV — Components

## 20. Buttons

### 20.1 The hierarchy (3 levels, exactly)
| Level | Class | Style |
|---|---|---|
| Primary | `.btn-primary` | `--gradient` bg, `color: var(--bg)`, 700, radius `1rem`, `.625rem 1.25rem`, border white/12, `0 8px 28px` accent-glow + inset top glint; hover `translateY(-1px)` + `0 16px 44px` + `saturate(1.08)`; active `scale(.98)` |
| Secondary | `.btn-secondary` | `--glass-fill` bg, `--text` 600, radius `1rem`, 1px `--border`, blur 12, inset white/6%; hover border-strong + glass-fill-hover |
| Ghost | `.btn-ghost` | transparent, `--text-sub` 600, radius `1rem`; hover `--surface-2` + `--text` |

**Danger actions:** use a `--error`-tinted **secondary** shape (error-bg tint, error text, error border) — never a saturated error fill, never `--accent`.

### 20.2 Anatomy & rules
- Icon + label gap `0.5rem`; icon `size-5`.
- Height ≥ 2.25rem; ≥ 2.75rem for touch-primary.
- **One primary per logical task group** (clarification of the "one primary per view" rule): a task group is a bounded action set (a form's submit, a modal's confirm, a toolbar's top action). If a view has two distinct task groups, each may have one primary — but never two competing primaries in the same action row.
- Full-width only in constrained columns (sheets, auth).
- Loading: spinner `size-4` replaces icon + disabled, width locked.
- Disabled: `--disabled-*` tokens, no glow, no lift.
- **Legacy CSS-Module `Button` (uppercase, `px-8 py-3.5`)** is deprecated — migrate to `.btn-*` classes (§40). It is not part of the v1.0 standard.

## 21. Inputs

### 21.1 Style (single global recipe)
```
background: var(--glass-fill)     /* blur(10px) */
border: 1px solid var(--border)
border-radius: 0.875rem
color: var(--text)
placeholder: var(--text-muted) @ 0.8
```
**Focus:** `border-color: var(--accent)` + ring `0 0 0 3px var(--accent-glow2)`, no outline.

### 21.2 Variants
- Text/search/email/password/number/tel/date/time → same recipe, `0.875rem`.
- Select → same recipe; options on `--surface-solid` with `--text`.
- Textarea → same recipe, `min-h` per content.
- Search → leading search icon (`ps-*` side, `--text-muted`), trailing clear.
- Password → trailing eye toggle (icon-only, `aria-label`).
- Error state → `--error-border` border + `3px --error-bg` ring (via tokens, not inline hex).

### 21.3 Rules
- Consistent height within a form (2.5rem, matching buttons).
- `tnum` for numeric; correct `inputMode` for mobile.
- Real labels; never placeholder-as-label.
- Focus ring is the only focus affordance.

## 22. Forms

### 22.1 Anatomy
```
<form>
  <fieldset>  (grouped related fields)
    <label>   Manrope 700 · .8125rem · --text · required marked with accent *
    <input>   (§21)
    <helper>  .75rem --text-muted
    <error>   .75rem --error + icon (role="alert")
  </fieldset>
  <actions>   cancel at logical start, primary submit at logical end (mirrored in RTL)
</form>
```
- Labels above inputs (no floating labels).
- Field grouping `gap-4`; fieldset padding matches card padding.

### 22.2 Validation states (final — from the shared `Field` primitive)
| State | Input border | Message |
|---|---|---|
| idle | `--border` | helper text |
| focus | `--accent` + 3px `--accent-glow2` | — |
| valid (on submit) | `--success-border` tint | optional success hint |
| error | `--error-border` + `--error-bg` ring | `--error` text + icon, below field |
| disabled | `--disabled-border`, reduced contrast | no ring |

**Per-field validation is mandatory** (target state): validate on blur and submit; show per-field errors, never only a banner. The current codebase has no per-field validation — this is a migration item, not an optional feature.

### 22.3 Enterprise forms
- **Wizard/multi-step:** stepper (numbered chips, logical order), back/next at logical end, progress preserved on back.
- **Sections/fieldsets:** use `<fieldset>` + `<legend>`; section spacing `gap-8`; dense grids `md:grid-cols-2`.
- **Save semantics:** explicit Save/Cancel; dirty-state indicator (unsaved changes); discard confirmation for unsaved edits.
- **Large forms:** auto-save draft where appropriate; keyboard-complete; section collapsible (accordion) for 8+ fieldsets.
- **Bilingual:** all labels/helpers/errors via `t()` keys, EN+AR shipped together.

### 22.4 Rules
- Full-width fields in dialogs; two-col only for tight paired data at `sm+`.
- Required indicator: accent `*`.
- Autocomplete attributes for real-world fields.

## 23. Tables (data-heavy)

### 23.1 Style
```
<table>  border-collapse: separate; border-spacing: 0
<thead>  1px border-bottom var(--border)
  th     .625rem · 700 · ls .18em · uppercase · --text-muted  (text-start)
<tbody>
  tr     border-bottom 1px var(--border); hover → --surface-2
  td     .75rem · 500
```
- Numeric columns `text-end` + `tnum`.
- Row height ≥ 2.5rem; cell padding `0.5–0.75rem`.

### 23.2 Data-heavy rules (enterprise)
1. **Every data table has a `<thead>`** — always present, always.
2. **Scroll wrapper:** any table that would exceed the container wraps in `overflow-x-auto` (with `scrollbar-none`). **Mandatory**, not optional. Current tables lacking wrappers (Billing, Analytics, PermissionTemplateManager) are migration debt.
3. **Sticky identifier column:** for tables with ≥ 8 columns (or content width > 720px), the identifier column (patient/room/ID) is sticky on the **logical start** edge (`sticky start-0`), with a hairline separator and a slight surface backdrop so rows slide under it.
4. **Header size is exactly `.625rem`.** `text-[10px]` headers are forbidden.
5. **Row actions on hover:** icon group at logical end, `aria-label` each, revealed on hover (LTR/RTL mirrored).
6. **Pagination / incremental loading:** data > 1,000 rows requires pagination (page sizes 10/25/50) or incremental virtual loading. No unbounded DOM rows.
7. **Selection:** checkboxes in a leading logical column; bulk-action bar appears with count.
8. **Empty/loading states:** §28/§29 apply inside the table area — header stays visible.
9. **Status column:** semantic badges (§6.2) — never brand color for status.
10. **Sortable columns:** sort arrows indicate state; `aria-sort`.

## 24. Cards

### 24.1 Recipes
| Type | Class | Use |
|---|---|---|
| Standard glass | `.card-elevated` | the workhorse |
| Gradient wash | `.card-gradient` | featured/dashboard highlight |
| Hover-lift | `.card-elevated card-hover` | clickable cards |
| Spotlight | `.magic-spotlight-card` | emphasis with mouse-glow |
| Gradient border | `.gradient-border` | flagship hero |
| Legacy shine | `.card-luxury` | 1px top glint |

### 24.2 Anatomy
```
<card 1.75rem radius, glass, 1px border>
  <header>  title (Manrope 700) + actions (icons) + optional badge
  <body>    content, spacing gap-6 internal
  <footer>  muted meta, kbd hints, status
</card>
```
- Padding `p-6`; tighter `p-4` for dense stat tiles/tables.
- Card titles Manrope 700 `text-base/lg`; `.section-title` never inside a card body.
- Status chip at logical start-bottom, `--text-muted`, icon 16px.

### 24.3 Rules
- Clickable cards: whole-card hover elevation + focus ring.
- One gradient wash max per **view** (§4 definition).
- Cards inside cards (nested) use `--surface-2` for depth-2; never double glass blur.

## 25. Tabs

### 25.1 Workspace tabs (horizontal, Organization Workspace)
- Icon (18px) + label + optional live badge; `gap-1.5`.
- Active: `.nav-item.active` treatment + 3px **logical-start** indicator (see §17 RTL mirror).
- Panel swap: `AnimatePresence mode="wait"` + `animate-scale-in`.
- **Active-state spec is exactly one:** `.nav-item.active`. The `scale-[1.02]`/`font-extrabold` overrides and the PatientWorkspace `border-b-2 border-gold-500` variant are migration debt.

### 25.2 Segmented control (in-panel filters)
- Container `--surface-2`, radius `1rem`, padding 4px; segment `rounded-lg`, `--text-muted`, active → `--surface-solid` + `--text` + soft shadow.

### 25.3 Rules
- Tabs are stateful (not URLs) unless deep-linkable → hash routes.
- `role="tablist"`/`role="tab"`/`aria-selected`/`aria-controls`.
- Keyboard arrows; visible focus ring.
- Never hide essential data behind tabs (progressive disclosure only).

## 26. Modals

### 26.1 Recipe
```
Overlay: fixed inset-0, var(--bg) at 50–60% + backdrop-blur(4–8px), animate-fade-in
Dialog:  --surface-solid · blur(44px) saturate(200%) · 1px --border-strong
         radius 1.75rem · box-shadow var(--shadow-pop) · animate-scale-in (0.28s)
```
Global rule: `[role="dialog"]`, popper children → solid glass + heavy blur + border-strong + shadow-pop.

### 26.2 Anatomy
```
<dialog 1.75rem>
  <header>  eyebrow/title (Space Grotesk 700) + close X (aria-label)
  <body>    content, p-6, max-height ~80vh, scrollbar-none region
  <footer>  cancel (logical start) + confirm (logical end)
</dialog>
```
- Widths: `sm` 384 confirm · `md` forms · `lg/xl` detail.
- Close: Escape, overlay, X. Disabled-while-submitting.
- **Danger confirm:** cancel is secondary; destructive confirm is the **danger-secondary** shape (§20.1). Non-destructive confirm uses primary.
- **Stacking:** one modal at a time by default; a deliberate flow (confirm → detail) may open sequentially but **never two visible modals stacked** without an explicit design decision.

### 26.3 Rules
- Scroll lock; focus trap + return focus (Radix Dialog).
- Preserve scroll position behind.

## 27. Drawers

- Recipe: `--surface-solid` + blur 44 + `--border-strong` on the **logical-start edge only**; leading radius (`rounded-s-[1.75rem]`); `--shadow-pop`.
- Entrance: slide from **logical start**, `0.35–0.45s` on the signature easing; overlay fade 0.3s.
- Widths: `sm` 320 · `md` 384 · `lg` 480; full height; header + body + footer like §26.2.
- Rules: Escape/overlay/X; focus trap; reduced motion → slide becomes fade; prefer a drawer over a modal when underlying context must stay visible.

## 28. Empty States

```
<centered block, gap-6, p-12>
  <icon>   size-12, --text-muted at 40%, in a surface-2 circle
  <title>  Space Grotesk 700, text-lg/xl
  <copy>   1–2 lines, --text-sub, max-w-sm centered
  <actions>  primary (create) + secondary (import/learn)
</centered block>
```
- **Fresh workspace:** "Your clinic is ready" + primary "Add first clinic".
- **No results:** "No matches" + clear-filters action.
- **No search results:** "No results for `query`" + suggestions.
- **Mandatory:** every data list (clinics, users, teams, templates…) renders an empty state when length === 0. Current lists that render nothing (OrganizationWorkspace clinics/users) are migration debt.

## 29. Loading States

- **Skeletons** (`.skeleton`): `--surface-2` fill, radius `1rem`, shimmer of `--surface-3`, 1.6s. Match final geometry to prevent layout shift. **This is the standard** — the current `animate-pulse` grey-block pattern is migration debt.
- **Page/panel enter:** `animate-fade-up` once data resolves.
- **Buttons:** spinner `size-4` + disabled, width locked.
- **Isolated spinner:** lucide `Loader2` `animate-spin`, `size-5`, `--text-muted`; overlay `--accent`.
- **Full-page first load:** centered logo + shimmer.
- **Infrastructure:** every route segment ships `app/<segment>/loading.tsx` (skeleton matching the page) — mandatory. No blank renders; tables show 5–6 skeleton rows; dashboards show 4 skeleton tiles.

## 30. Error States & Error Boundaries

### 30.1 Inline / page errors
- **Field error:** `--error` text `.75rem` + warning icon, below field, `role="alert"`.
- **Section/page error:** card with `--error`-tinted icon, human explanation, and **retry / back / contact** actions. Never raw stack traces.
- **Toast:** logical-start-bottom, `--surface-solid` + blur 44 + `--border-strong`, `--shadow-pop`, 4–5s auto-dismiss + manual close; success/error tint the leading icon only.
- **404/offline:** full-page empty-state style with brand ambience (mesh + aurora).

### 30.2 Error boundaries (infrastructure, mandatory)
- **Every route segment ships `app/error.tsx`** (and `app/global-error.tsx` for root) rendering the §30.1 error card with retry.
- Shared `ErrorBoundary` component in the design system wraps interactive panels; a thrown error shows the error card, never a blank/crashed workspace.
- **Clinical modules (EHR, billing, imaging, laboratory, pharmacy) require error boundaries as a hard gate** — a runtime error must never blank a patient record view (§33).
- Current codebase has **zero** error boundaries — mandatory migration item.

## 31. Navigation Rules

### 31.1 App shell
- **Icon rail:** `w-[72px]`, expands to `w-64` on hover, glass chrome (`--surface-solid` + blur 44), logo + primary nav + user cluster. Desktop-only (`hidden lg:flex`).
- **Mobile:** hamburger drawer (`lg:hidden`, `w-full max-w-xs`); bottom nav not used.
- **Active item:** `.nav-item.active` (accent text, `--accent-glow2` fill, 1px inset border-strong, 3px **logical-start** indicator with glow). The shell's inline `layoutId` pill is the one sanctioned app-chrome variant and must keep a visible focus ring (§19.2).

### 31.2 Workspace tabs
- Horizontal tab bar under the page header; icon + label + optional live badge.
- Labels from `labelsMap` (bilingual), never hardcoded.
- Badges show computed counts, never static numbers.
- Switching uses `AnimatePresence mode="wait"` + `animate-scale-in`.

### 31.3 Hierarchy & depth
- 3 levels max: app rail → page tabs → in-panel segments.
- **IA grouping is mandatory** (pending refactor): related submodules grouped under section labels; a flat 15-tab bar is a temporary state, not a standard. Never exceed 15 entries in one bar.
- Breadcrumbs for deep content: `page / section / item`.

### 31.4 Rules
- `aria-current="page"` on active; `aria-label` on icon-only items.
- RTL mirroring per §17 (indicator at logical start).
- Permissions-aware: items reflect the user's roles (hide, disable-with-hint, or "locked" badge) — never remove silently without an explanation.
- Cross-navigation is keyboard and screen-reader accessible.

---

## Part V — Composition & Enterprise

## 32. Dashboard Composition Rules

### 32.1 The dashboard recipe
```
<page>
  <header>   eyebrow "Overview" · page title · actions
  <stat row> 4 × card-elevated (icon · value tnum display · delta badge)
  <main grid>  2/3 content + 1/3 aside (lg+)
     - featured card (card-gradient, one per view)
     - data table (activity/appointments)
  <aside>    quick actions, upcoming, alerts, ambience
</page>
```
### 32.2 Rules
- **Stat tile anatomy:** icon (24px accent) · value (Space Grotesk 700 `text-3xl`, `tnum`) · label (`.75rem --text-muted`) · delta badge (success/error with ↑↓).
- **One `card-gradient` hero per view.**
- Density rises top→bottom (stats → table → meta).
- `pulse-glow` only for genuinely live data.
- **Density limits:** max **6 stat tiles** and max **2 chart surfaces** per dashboard view. Beyond that, split views.

## 33. Medical Dashboards & Clinical Workflow Rules

- **Clinical determinism:** clinical values (vitals, counts, doses) render with `tnum`, right-aligned in their columns, never truncated or animated mid-read.
- **Status semantics are clinical semantics:** success/warning/error/neutral colors and labels are the clinical communication layer (§6.2). They must never be overridden by brand color — this is a patient-safety rule.
- **Precaution/risk indicators** (warning-level) always pair color + icon + text (§19.11 status-not-color-only); a bare amber chip is forbidden.
- **Urgency hierarchy:** routine < attention (warning) < critical (error) — expressed via badge + label, with a deterministic sort so critical rises to top.
- **Live-data honesty:** `pulse-glow` and streaming only where data is genuinely live; static values never pulse.
- **Confirmations for irreversible clinical actions** (void billing, delete record, discharge, irreversible order changes): always require explicit confirmation (danger-secondary confirm, §26.2). High-risk actions may require typed confirmation.
- **Audit trail visibility:** every clinical mutation shows in the audit view; audit tables follow §23.
- **Error boundaries are mandatory in clinical modules** (§30.2).
- **Screen-reader data tables:** row-level context (`aria-label` with identifier + status summary) so SR users understand a row without scanning.

## 34. Analytics Views & Charts

- **Palette:** §6.5 chart tokens only. No raw hex in `stroke`/`fill`/`stopColor`.
- **Surfaces:** chart cards use `.card-elevated`; tooltips use `--surface-solid` + `--shadow-pop` + `--border-strong`.
- **Gridlines/axes:** `--chart-grid`; tick labels `--chart-label` (`--text-muted`); legend `--text-sub`.
- **Responsive:** charts reflow with the grid; min-height for tooltip legibility; touch charts show value on tap.
- **Loading:** skeleton matching chart geometry (§29).
- **Empty:** empty-state pattern (§28) inside the chart card.
- **Rules:** max 2 chart surfaces per dashboard (§32.2); max 4 categorical series (§6.5); time-series aligned to a consistent axis; no 3D/glossy chart effects (flat, token-styled).
- **Density:** chart titles Manrope 700 `text-sm/base`; numbers `tnum`.

## 35. Enterprise Workspace Rules

### 35.1 Scope
The **Organization Workspace** (OrganizationWorkspace + its 15 submodules): organizations → clinics → branches → departments → rooms → chairs → equipment → staffing → rosters → appointments → billing → inventory → reports → settings → security.

### 35.2 Structure
1. **Header banner** — workspace name + theme context.
2. **Grouped horizontal tab bar** — section-labeled groups (mandatory target; flat 15-tab is temporary).
3. **`AnimatePresence mode="wait"` panel** — entrance `animate-scale-in`.
4. **Setup wizard** — first-run path.

### 35.3 Multi-workspace layout rules
- Each workspace is an independent, full-height panel with its own scroll region — no nested tab explosions.
- Workspaces share the exact same chrome recipes (header banner, tab bar, panels) across all 15 — no bespoke per-workspace chrome.
- Recursion depth org > clinic > branch > department > room via breadcrumbs, each level a full panel.
- **Consistency:** identical card/table/form/button/modal recipes everywhere. No bespoke enterprise widgets without a constitution amendment.

### 35.4 Rules
- IA grouping mandatory (§31.3); counts are computed, never static.
- Permissions-aware per §31.4.
- Enterprise views are the only place standard spacing may be tightened for density — with `--text-muted` chrome so hierarchy stays calm.
- Dead `WorkspaceSidebarNav` must be adopted or removed (§2.4).

## 36. Enterprise Forms (see §22.3) and Data Governance

- Form scale rules in §22.3 apply across the enterprise (wizards, sections, save semantics, dirty-state).
- **Data tables** per §23; **large data** per §23.2.6 (pagination/virtualization).
- **Multi-tenant lists** (clinics, users, templates) always render empty/loading/error states (§28–30).

## 37. Component Naming Rules

### 37.1 Files & components
- One component per file, kebab-case file (`clinic-card.tsx`), PascalCase component (`ClinicCard`).
- Colocation: feature components next to their domain; design-system primitives in `components/ui/design-system/`.
- Approved names: `DashboardShell`, `OrganizationWorkspace`, `OrganizationManager`, `WorkspaceTabPanel`, `WorkspaceSidebarNav`, `ModalActions`. Reuse them.

### 37.2 Props & state
- `camelCase`; callbacks `on*`; booleans `is*`/`has*`/`can*` (`isLoading`, `canEdit`).
- Typed interfaces; no `any` on prop boundaries.
- One responsibility per component — extract panels/tables/cards.

### 37.3 CSS / tokens
- Custom classes kebab-case, semantic (`btn-primary`, `card-gradient`, `badge-warning`).
- Token values only; no inline hexes; no new `!important` (legacy block is retiring).
- `cn()` for conditional classes.

### 37.4 i18n
- UI strings via `t('key')` from `messages/en.json` + `messages/ar.json` — always both.
- Keys dot-namespaced by feature (`organization.clinic.add`).

### 37.5 Design-system inventory (registered primitives)
| Primitive | Status |
|---|---|
| `GlassCard`, `SectionTitle`, `StatCard`, `Badge`, `Kbd`, `PageHeader`, `Divider`, `AmbientGlow` | registered (design-system) |
| `Field` / `Input` / `Table` / `Modal` / `Drawer` / `Tabs` | **to be created** as shared primitives (§22, §23, §26, §27) |
| `Button/Button.tsx` (CSS-Module) | **deprecated** → migrate to `.btn-*` |
| `WorkspaceSidebarNav` | **dead** → adopt or remove |
| `Toasts/toast.tsx` (shadcn relic) | **deprecated** → migrate to token toast (§30.1) |

---

## Part VI — Reference

## 38. Reusable Token Reference (canonical tables)

### 38.1 Color tokens (Theme B · Purple · Dark = default)
| Token | Value | Role |
|---|---|---|
| `--bg` | `#0b0710` | app base |
| `--bg-2` | `#120b1a` | raised level |
| `--bg-3` | `#191022` | deepest level |
| `--surface` | `rgba(155,113,178,0.06)` | quiet fill |
| `--surface-2` | `rgba(155,113,178,0.11)` | hover/selected fill |
| `--surface-3` | `rgba(155,113,178,0.16)` | strong fill |
| `--surface-solid` | `#150d1f` | opaque chrome |
| `--border` | `rgba(227,208,234,0.12)` | hairline |
| `--border-strong` | `rgba(155,113,178,0.4)` | emphasized hairline |
| `--text` | `#F7F4FB` | primary |
| `--text-sub` | `#E3D0EA` | secondary |
| `--text-muted` | `#8f86a0` | tertiary |
| `--accent` | `#9B71B2` | brand action |
| `--accent-hi` | `#FBF1FF` | accent on accent |
| `--accent-dim` | `#3A1C36` | accent wash |
| `--accent-glow` | `rgba(155,113,178,0.35)` | halo |
| `--accent-glow2` | `rgba(155,113,178,0.12)` | subtle tint |
| `--success` | `#6ee7b7` | status: success (dark) |
| `--warning` | `#fcd34d` | status: warning (dark) |
| `--error` | `#fca5a5` | status: error (dark) |
| `--info` | `#93c5fd` | status: info (dark) |
| `--neutral` | `#9ca3af` | status: neutral (dark) |
| `--gradient` | `linear-gradient(135deg, #FBF1FF 0%, #E3D0EA 40%, #9B71B2 75%, #3A1C36 100%)` | brand action/hero |
| `--gradient-soft` | `linear-gradient(160deg, rgba(251,241,255,.9), rgba(227,208,234,.55), rgba(155,113,178,.35))` | card wash |
| `--mesh` | 2 radial blooms + vertical | page background |

> Full light-mode and Earth matrices: `styles/main.css:20-213` (all four are law).

### 38.2 Semantic status token sets
| State | core | tint bg | border | strong | on-color |
|---|---|---|---|---|---|
| success | `--success` | `color-mix(success 14%, transparent)` | `color-mix(success 40%, transparent)` | core | `--on-success` (dark: `#04120c`) |
| warning | `--warning` | `color-mix(warning 14%, transparent)` | `color-mix(warning 40%, transparent)` | core | `--on-warning` (dark: `#3a2a00`) |
| error | `--error` | `color-mix(error 14%, transparent)` | `color-mix(error 40%, transparent)` | core | `--on-error` (dark: `#160302`) |
| info | `--info` | `color-mix(info 14%, transparent)` | `color-mix(info 40%, transparent)` | core | `--on-info` (dark: `#04122e`) |
| neutral | `--neutral` | `color-mix(neutral 14%, transparent)` | `color-mix(neutral 40%, transparent)` | core | `--on-neutral` (dark: `#0b0f14`) |
| disabled | `--disabled-text` | `--disabled-bg = var(--surface)` | `--disabled-border = var(--border)` | — | — |

### 38.3 Spacing scale
Base 4px: `2 · 4 · 6 · 8 · 10 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64` (px). Semantic uses per §9.

### 38.4 Typography tokens
| Token | Value |
|---|---|
| Display | `Space Grotesk` 700 · `ls -0.03em` |
| UI | `Manrope` 500–700 · `ls 0` |
| Mono | `JetBrains Mono` · `tnum` |
| Arabic | `Noto Sans Arabic` / `Tajawal` |
| Body | 1.5 line-height · `.875rem` |
| Eyebrow | `.65rem` · 700 · `ls .22em` · uppercase |
| Table th | `.625rem` · 700 · `ls .18em` · uppercase |
| Badge | `.625rem` · 700 · `ls .08em` · uppercase |

### 38.5 Radius tokens
`9999px` pill · `1.75rem` card · `1rem` button/nav · `0.875rem` input · `2rem`/`2.5rem` hero.

### 38.6 Elevation tokens
`--shadow-card` · `--shadow-pop` · tailwind `soft/elevated/glow/glow-lg/inner-line`. Layering per §12.

### 38.7 Motion tokens
Easing `cubic-bezier(0.16,1,0.3,1)`. Durations `0.15/0.2/0.25/0.3/0.35/0.4/0.45/0.5s` per §14.2. Keyframes §14.3.

### 38.8 Glass tokens
`--glass-fill` / `--glass-fill-hover` / `--glass-border` / `--glass-blur: 22px` / `--glass-blur-heavy: 44px` (saturate 160–200%).

### 38.9 Layout tokens
Container max 1400px, centered, `padding 2rem`. 12-col grid, gutters `1.5rem`. Chrome: `--surface-solid` + blur 44. Rail: `72px` → `256px`.

### 38.10 Chart tokens
`--chart-1…4`, `--chart-grid`, `--chart-tooltip-bg`, `--chart-tooltip-border`, `--chart-label` (§6.5).

## 39. RTL Quick Reference (cheat sheet)
| Need | Logical (use) | Legacy (forbidden) |
|---|---|---|
| Margin | `ms-2` / `me-2` | `ml-2` / `mr-2` |
| Padding | `ps-3` / `pe-3` | `pl-3` / `pr-3` |
| Position | `start-0` / `end-0` | `left-0` / `right-0` |
| Align | `text-start` / `text-end` | `text-left` / `text-right` |
| Border | `border-s` / `border-e` | `border-l` / `border-r` |
| Radius | `rounded-s-2xl` / `rounded-e-2xl` | `rounded-l-*` / `rounded-r-*` |
| Flip icon | `rtl:-scale-x-100` | physical rotate assumptions |

## 40. Change Management & Migration

### 40.1 Change management
1. New UI must be born compliant — this document gates every PR.
2. Token additions require a full 4-theme audit before landing.
3. New animations must live in the token library and respect reduced motion.
4. Amendments: propose → review → ratify → migrate. No unratified edits.

### 40.2 Migration plan (from v0/v1.0 audit)
The following are **migration backlog**, not new standards. Each has an owner gate at ratification:
| # | Migration | Constraint |
|---|---|---|
| M1 | Fix amber remap → `var(--warning)` in `main.css` | Blocks semantic correctness (§6.3) |
| M2 | Fix `.border-l`/`.border-r-2` width inversion | Blocks RTL correctness (§17.5) |
| M3 | Load JetBrains Mono + Noto Sans Arabic/Tajawal | Blocks typography standard (§8.1) |
| M4 | Replace `themeColor`/tile `#10b981` with theme accent | Blocks PWA theming (§7.5) |
| M5 | Retire 1,570 arbitrary `text-[…]` sizes | Enforced by lint gate (§0/§2) |
| M6 | Migrate `rounded-3xl` → `1.75rem` card radius | Blocks radius language (§11) |
| M7 | Migrate raw `shadow-2xl/lg/xl` → elevation tokens | Blocks elevation system (§12) |
| M8 | Remove/replace ~128 `bg-black*` surfaces | Blocks light-mode correctness (§7.6) |
| M9 | Migrate 400+ physical directional utilities → logical | Blocks RTL completeness (§17.2) |
| M10 | Add per-field validation to forms | Blocks §22.2 standard |
| M11 | Add error boundaries (`error.tsx`/`global-error.tsx`) | Blocks §30.2, clinical gate |
| M12 | Add `loading.tsx` + adopt `.skeleton` standard | Blocks §29 |
| M13 | Add empty states to all data lists | Blocks §28 |
| M14 | Wrap un-wrapped tables; add sticky identifier columns | Blocks §23.2 |
| M15 | Migrate CSS-Module `Button`, shadcn `Toast`, dead `WorkspaceSidebarNav` | Blocks §20/§30/§2.4 |
| M16 | Implement chart tokens (§6.5) replacing chart hexes | Blocks §34 |
| M17 | Correct page titles → Space Grotesk `text-3xl/4xl`; remove `font-mono` headings | Blocks §8.3 |
| M18 | Enforce lint gates (denylist + hex check) in CI | Enables §0 |

## 41. Audit Resolution Log (v1.0)

This section records how the v1.0 audit findings are resolved in this constitution. Details in `DESIGN_CONSTITUTION_AUDIT.md`.

| Audit finding | Resolution in v1.0 |
|---|---|
| Shadow tokens dead / raw shadows used | §12 token table + M7 |
| Radius drift (rounded-3xl) | §11 flagship 1.75rem + M6 |
| Type scale drift (text-[…]) | §8.3 + §2.1 + M5 |
| Two parallel conventions (CSS-module Button) | §20.2 + M15 |
| Page-title scale mismatch | §8.3 + M17 |
| JetBrains Mono / Arabic not loaded | §8.1 font-shipping rule + M3 |
| Amber→accent semantic bug | §6.3 + M1 |
| `themeColor` green | §7.5 + M4 |
| `bg-black` light-mode hazards | §7.6 + M8 |
| RTL not implemented (physical utilities) | §17 production-ready RTL + M9 |
| Remap width bugs | §17.5 + M2 |
| `nav-item` indicator RTL mirror | §17.4 + §25.1 |
| No error boundaries | §30.2 + M11 |
| No `.skeleton` use / animate-pulse | §29 + M12 |
| Missing empty states | §28 + M13 |
| No sticky/scroll tables | §23.2 + M14 |
| No per-field validation | §22.2 + M10 |
| Chart hexes | §6.5 + §34 + M16 |
| Dead `WorkspaceSidebarNav` | §2.4 + M15 |
| No enforcement gate for tokens | §0 + §2 + M18 |
| Contradictory "one primary per view" | §20.2 "per logical task group" |
| 15-tab max already at limit | §31.3 grouping mandate |
| Modal stacking ambiguity | §26.2 explicit flow rule |
| "1.5rem gutters" ambiguity | §9 clarification (grid gap ≠ card padding) |
| Arabic uppercase ambiguity | §8.3.6 |
| RTL icon flip ambiguity | §15 + §17.7 |
| Mobile nav ambiguity | §18 (hamburger chosen, no bottom nav) |
| Tabs vs nav taxonomy | §25 vs §31 defined |
| Danger action vs confirm ambiguity | §20.1 + §26.2 |
| Sticky-column scoping | §23.2.3 (≥8 cols / >720px) |
| `!important` remap dependency | §40.2 (feature-flagged migration, not convention) |

---

## Appendix · Source-of-truth map
| Canonical source | What it defines |
|---|---|
| `styles/main.css` | Theme tokens (20–213), base (218–270), legacy remap (272–376, retiring), glass (378–503), buttons (505–612), inputs/forms (614–650), tables (652–679), badges (681–730), nav (732–769), utilities (786–841), motion (843–925), scrollbar (927–943), RTL remap (945–988, legacy → §17), reduced motion (990–1001) |
| `tailwind.config.js` | Font families, purple/chestnut/morning/almond palettes, radius 4xl/5xl, shadows, keyframes/animations, RTL plugin |
| `components/ui/DashboardShell.tsx` | App shell: icon rail, chrome, layout |
| `components/ui/OrganizationWorkspace.tsx` | Workspace tabs, labelsMap, panels, AnimatePresence |
| `components/ui/design-system/primitives.tsx` | Registered primitives (GlassCard, SectionTitle, StatCard, Badge, Kbd, PageHeader, Divider, AmbientGlow) |
| `components/ui/OrganizationManager.tsx` | Enterprise forms reference |
| `messages/en.json` · `messages/ar.json` | Bilingual copy source |

---

*HealthOS · Luxury Clinical OS · Constitution v1.0 (Official) — pending final approval.*
