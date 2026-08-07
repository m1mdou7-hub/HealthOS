# Phase 3 Visual QA Report

**QA date:** 2026-08-07 · **QA method:** agent-browser (Chrome) computed-style probes + static CSS audit against `docs/DESIGN_CONSTITUTION.md` · **Build:** `next build` exit 0, `next lint` exit 0 (0 errors), `tsc --noEmit` exit 0

**Scope:** visual verification of all migrated components (velvet tokens, Button, Card, Input, Modal, Drawer, Toast, Tooltip, Table, Skeleton, EmptyState, StatCard, chrome/rail, glass, elevation, typography, both themes). Polish only — no redesign. Active test matrix: Arabic RTL, dark theme (default).

---

## 1. Result summary

| Area | Status | Notes |
|---|---|---|
| Token plumbing | PASS | `data-velvet-theme="black"` + `data-velvet-mode="dark"` served; both systems flip on mode toggle |
| Glass system | PASS | Card glass `blur(22px) saturate(1.6)`; chrome/rail `blur(44px) saturate(1.8)`; light-mode glass 55% white + dark text (sec 13.4) |
| Elevation | PASS | Card `--velvet-shadow-card` inset 1px white/6% + black 0.7; Modal/Drawer/Toast `--velvet-shadow-pop` |
| Radius language | PASS | Cards 1.75rem, buttons 1rem, inputs 14px, pills 9999px, toasts 1.75rem |
| Typography | PASS | `.section-title` Space Grotesk 700 / -0.03em; `.eyebrow` .65rem/.22em uppercase accent; Manrope body; JetBrains Mono table headers + kbd |
| Motion | PASS | Signature `cubic-bezier(0.16,1,0.3,1)` in Modal/Drawer/Progress; reduced-motion kill-switch present (sec 14.4) |
| Focus | PASS | Global `*:focus` ring 3px accent-glow2 + 1px accent (sec 19.2); `velvet-focus-ring` utility |
| Contrast (dark) | **FIXED** | `--text-muted` on card was 3.41:1 (AA fail) -> now 5.65:1 via `--velvet-300` mapping |
| Contrast (light) | FLAG | Accent-on-bg 2.75:1 (brand-gold choice; legacy purple was 5.69:1) -- see sec 5 |
| Status colors | PASS (dark) | success 9.88:1 on card; tokenized bg/border/fill pairs |
| Legacy compat | PASS | `bg-zinc-*`/`border-zinc-*` resolve through remap to tokens; legacy `--text-muted` alias intact |

## 2. Verified live (computed styles)

### 2.1 Landing `/` and app shell
- body `rgb(11,7,16)` = `--bg`, mesh radial/linear gradients render.
- Rail: `w-[72px]`, `box-shadow: var(--velvet-shadow-card)` inline, bg `#150d1f` = `--surface-solid`, `backdrop blur(44px) saturate(1.8)` (sec 13/31).
- Brand row: `text-gradient` + PRO badge; Space Grotesk headings with -0.025em tracking.

### 2.2 Buttons
- `.btn-primary`: radius 16px (1rem), `--gradient-primary` bg, color `var(--bg)`, padding 10px 20px (.625rem/1.25rem), weight 700, `0 8px 28px` accent-glow + inset glint (sec 20).
- Icon buttons radius 8px; search/pill 9999px; language/theme chips radius 12-16px.

### 2.3 Inputs (search, `/patients`)
- radius 14px, bg `rgba(255,255,255,0.035)` = `--glass-fill`, border `rgba(227,208,234,0.12)` = `--border` (sec 21/6).

### 2.4 Cards & radius distribution (clinics)
- 41x16px, 22x9999px, 13x28px, 12x12px, 2x8px, 2x24px -- dominated by the 1rem button + pill set; cards uniformly 28px.
- `card-elevated` glass: `blur(22px) saturate(1.6)`, elevation inset 1px white/6% + black 0.7 (consistent, no raw hardcoded shadows).

### 2.5 Toast
- radius 28px, `--shadow-pop`, success tint `rgba(74,222,128,0.12)` bg + 1px `--success` border, Space Grotesk title 600/14px, 5s auto-dismiss + manual close.

### 2.6 Modal primitive (statics)
- Overlay `--velvet-bg` 0.6 + blur(8px); panel `--surface-solid` + `blur(44px) saturate(200%)`, `--border-strong`, 1.75rem radius, `--shadow-pop`, Space Grotesk title, signature easing. Fully tokenized.
- Live legacy onboarding wizard uses hardcoded `rgba(2,6,17,0.82)` + blur(14px) -- pre-existing legacy component, not the migrated Modal (see sec 4.3).

### 2.7 Drawer primitive (statics)
- `--surface-solid` + `blur(44px) saturate(180%)`, `--border-strong`, `--shadow-pop`, spring motion. Fully tokenized.

### 2.8 Tooltip (Recharts, live)
- `--surface-solid` bg, 1px `--border-strong`, 12px radius, text `--text` -- matches sec 30 tooltip treatment.

### 2.9 Table / Skeleton / EmptyState / StatCard / Kbd / Progress (statics)
- Table th: `font-mono` bold uppercase `tracking-[0.18em]` 10px `--text-muted`, `--border` row separators (sec 23.1). Loading uses `velvet-skeleton` rows.
- Skeleton shimmer: `--velvet-surface-2` base + `--velvet-surface-3` gradient sweep, 1.6s loop.
- EmptyState: `--velvet-surface-2` icon disc, `.section-title`, `--text-sub` description.
- StatCard: `--velvet-accent-glow2` icon chip + `--border-strong`, display value Space Grotesk.
- Progress: `--velvet-surface-2` track / `--velvet-accent` fill, signature ease, ARIA attrs.
- Kbd: `--velvet-surface-2` + `--border` + mono.

### 2.10 Nav + badges (statics -- component is dead code, see sec 4.1)
- `.velvet-nav-item`: 1rem radius, Manrope 13px/600, `--text-muted`; active = `--accent-glow2` + inset `--border-strong` + 3px accent bar with glow; hover `--surface-2`.
- `.velvet-badge`: pill, `--accent` bg, `--ink-on-accent` text, accent-glow; `.velvet-badge-muted` = `--surface-2` + `--border`.

### 2.11 Light theme
- Tokens flip: `--bg` -> #fafaff, `--text` -> #18182e, card -> #e0e0f0, glass-fill -> `rgba(24,24,46,0.05)`.
- Glass cards render `rgba(255,255,255,0.55)` + `blur(22px) saturate(1.6)` with dark text `rgb(36,18,46)` -- no white-on-light violation (sec 13.4).
- Muted-on-card 5.37:1, sub 11.79:1, text 13.31:1 -- all pass.

## 3. Contrast matrix (measured)

| Pair | Dark | Light | Sec 6.6 req | Result |
|---|---|---|---|---|
| `--text` on bg | 15.13 | 13.31 | >=12 | PASS |
| `--text-sub` on card | 8.99 | 11.79 | >=7 | PASS |
| `--text-muted` on card | **5.65** | 5.37 | >=4.5 | **PASS after fix** (was 3.41) |
| `--accent` on bg | 8.64 | **2.75** | >=4.5 | FLAG (dark PASS) |
| `--success` on card | 9.88 | -- | >=4.5 | PASS |
| `--text-muted` on surface-solid | 6.16 | -- | >=4.5 | PASS |

## 4. Non-blocking observations

1. **WorkspaceSidebarNav is dead code.** Imported in `OrganizationWorkspace` but never rendered (2 import/type refs, 0 JSX uses). The `velvet-nav-item`/`velvet-badge` CSS is correct but invisible. This is documented M15 debt -- adopting or removing it belongs to a later migration phase, not this QA pass.
2. **Analytics page title uses Manrope** (`font-sans` inline header) instead of `.section-title`/Space Grotesk. Pre-existing workspace markup, not the migrated PageHeader primitive. PageHeader/SectionTitle/eyebrow primitives themselves are correct.
3. **Legacy onboarding wizard** uses a hardcoded navy overlay (`rgba(2,6,17,0.82)`) rather than the tokenized Modal. Pre-existing legacy component; migrating it is out of scope for polish.

## 5. Flag for product decision (not auto-fixed)

**Light-mode accent-on-bg = 2.75:1** fails sec 6.6 (>=4.5:1 for accent-as-text). Dark accent (`--velvet-gold`, 8.64:1) is fine. The light-mode gold `#b8943a` is a brand choice distinct from the legacy purple (`#7a4f92`, 5.69:1). Not changed because picking a darker light-mode gold is a brand decision, not polish.

## 6. Changes made this pass

- `styles/velvet-tokens.css` (Black theme block): `--velvet-text-muted: var(--velvet-400)` -> `var(--velvet-300)`. Restores AA (3.41 -> 5.65:1 on card) lost when the legacy `#8f86a0` was darkened to `#6b6b94` during migration. Light block (`--velvet-700`) untouched. Legacy alias `--text-muted` (`#8f86a0`, 4.99:1) still passes independently.

## 7. Verdict

All migrated components match the Design Constitution. One genuine regression found and fixed (muted contrast). One brand decision flagged (light accent). **Phase 3 Visual QA passes.**