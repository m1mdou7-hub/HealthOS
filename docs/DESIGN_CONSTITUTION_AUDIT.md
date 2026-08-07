# HealthOS Design Constitution — Audit Report

**Audit date:** 2026-08-06 · **Auditor:** Design System Review
**Scope:** `docs/DESIGN_CONSTITUTION.md` (v1.0 draft) vs. current codebase (`styles/main.css`, `tailwind.config.js`, `app/`, `components/`)
**Method:** static analysis + grep counts over all `.tsx`/`.ts`/`.css` sources; spot-checked high-impact claims directly.
**Result:** The constitution is directionally correct and matches the codebase's *intended* architecture. It is **ratifiable**, but **not yet accurate as a binding contract** — it codifies an aspirational state that the code does not currently meet. Recommend ratify-with-conditions (§V) rather than ratify-now or rewrite.

**v1.0 status update (post-audit):** All findings below were incorporated into the constitution's v1.0 revision. See **Part VI · Audit Resolution Log** (`DESIGN_CONSTITUTION.md` §41) for the finding→resolution matrix, and **§40.2** for the 18-item migration plan that turns the target state into implementation. The four release-blockers (§III) are now codified as binding rules + migration items (M1–M18). The audit findings remain below for traceability.

---

## I. Findings by Mandated Audit Area

### 1. Token consistency — ⚠️ Partial (constitution overstates reality)

**Constitution claim:** tokens are the single source; components reuse them.
**Reality:**
- `var(--accent)` (111 uses) + `var(--accent-*)` (62) → **strong accent discipline**. Confirmed.
- **Shadow tokens are effectively dead.** `--shadow-card`/`--shadow-pop` and the Tailwind config shadows (`soft/elevated/glow/glow-lg/inner-line`) have **0 direct component uses**; components use raw `shadow-2xl` (48), `shadow-lg` (31), `shadow-xl` (19). Constitution §10/§31.5 present these as live system rules, but nothing consumes them.
- **Hardcoded hexes persist:** 56 inline-style hexes (18 distinct: `#27272a`, `#10b981`, `#3b82f6`, `#8b5cf6`…), 16 arbitrary-class hexes, and **~80 chart attribute colors** (`stroke`/`fill`/`stopColor`) — the constitution's "no raw hexes" rule is violated in every chart and several badges.
- **Radius drift:** flagship `rounded-[1.75rem]` has **0 uses**; de-facto radii are `rounded-xl` (679), `rounded-3xl` (353), `rounded-2xl` (203). Constitution §11 presents 1.75rem as *the* card radius, but the codebase's dominant card radius is 1.5rem (`rounded-3xl`).
- **Font size drift:** **1,570 arbitrary `text-[...]` utilities** (12 distinct values: `text-[10px]`×829, `text-[9px]`×429…). The type scale in §6.2 is not the scale in use.

**Recommendations:**
- Add a **"current vs. target" delta appendix** to the constitution so reviewers know §11/§10 describe target state, not current state.
- Mandate chart-color tokens (`--chart-1..4`) and forbid raw chart hexes — this is a genuine missing rule (§III).
- Retire or explicitly bless `rounded-3xl` (1.5rem) as the *de-facto* large-card radius, or drive migration to `1.75rem`. Pick one; today both are "the" radius.

### 2. Component consistency — ⚠️ Partial

**Constitution claim:** one button/input/card/table style everywhere.
**Reality — two parallel, non-coordinating conventions coexist:**
- **CSS-class convention** (what the constitution documents): `btn-primary` 78, `btn-secondary` 60, `btn-ghost` 48, `card-elevated` 352, `badge-*` ~79. This is the real standard. ✅
- **Legacy remapped classes** that only *look* right via `!important`: `text-zinc-*` 1,955, `border-zinc-*` 1,052, `bg-zinc-*` 1,045, `text-white` 790. ✅ visually, but fragile (see §7).
- **CSS-Module Button** (`components/ui/Button/Button.tsx`, 10 uses): `uppercase`, `px-8 py-3.5`, `rounded-2xl` — **contradicts §18** (buttons must be `text-sm`, non-uppercase, `.625rem 1.25rem`). It is used in Auth/Account forms only, so the conflict is contained but real.
- **Inline `style={{ color: 'var(--...)' }}` objects:** 1,261 var() refs — tokens are *consumed*, but via inline styles instead of utilities/classes, which defeats theming overrides, RTL, and `!important` remaps.

**Recommendations:**
- Constitution should name the actual source of truth: **CSS classes in `main.css` + design-system primitives**, not a shadcn-style component tree (`components.json` is stale shadcn scaffolding with `baseColor: zinc`).
- Add a rule: "New code uses utility tokens or the `main.css` classes; inline `style` objects are allowed only for CSS variables not expressible as utilities (dynamic chart colors)."
- Resolve the `Button/Button.tsx` conflict explicitly (deprecate the CSS-Module variant or extend the constitution to cover it).

### 3. Typography hierarchy — ❌ Significant gap between spec and reality

- **Fonts loaded:** only Manrope, Inter, Space Grotesk.
  - **JetBrains Mono is referenced but never loaded** — yet `font-mono` is used **1,473 times** (the single most-used font utility). All mono silently falls back to system `ui-monospace`. Constitution §6.1/§31.3 mandates JetBrains Mono as the mono face. **Constitution is wrong about the current system.**
  - **Noto Sans Arabic / Tajawal never loaded** — Arabic (the **default** locale, `NEXT_LOCALE` default `'ar'`) renders in Manrope. Constitution §6.1's Arabic guarantee is aspirational.
- **Page-title scale mismatch:** constitution §6.2 says page titles are Space Grotesk `text-3xl/4xl`. Reality: 15 of 18 pages explicitly use `font-sans` (Manrope) `text-xl/2xl`. The primary page-title pattern in the constitution is **not implemented**.
- **Hierarchy override hazards:** global `h1–h4 { font-family: Space Grotesk }` is routinely overridden by `font-sans` (page titles) and `font-mono` (EHR/Document section labels). Result: 4–5 competing "heading" voices instead of the clean Space Grotesk (display) / Manrope (UI) split the constitution defines.

**Recommendations:**
- Add JetBrains Mono + Noto Sans Arabic/Tajawal to the font `@import` — the constitution should mandate this (missing deployment rule).
- Amend §6.2 page-title scale to match implemented reality (`text-xl/2xl` Manrope) or accept that a headline-scale migration is required before the constitution is enforceable.
- Add an explicit rule: "Headings use Space Grotesk (display) or Manrope (UI); `font-mono` is reserved for data/IDs and must never be used for headings."

### 4. Color hierarchy — ❌ Contains a live semantic bug the constitution doesn't catch

- **Amber remap bug (confirmed):** `main.css:321-324` remaps `text-amber-*` → `var(--accent)` (brand purple), **not** `var(--warning)`. All **117 `text-amber-*` + 76 `text-amber-400`** usages (warnings like "Moderate Precaution" in EhrWorkspace, implant phase chips) render in brand accent, silently destroying warning semantics. `var(--warning)` has only 27 direct uses. **The constitution's §7.2 "status colors are semantic" rule is being violated by the CSS layer itself.**
- **Design-system `Badge` hardcodes status hexes** (`#34d399`, `#fbbf24`, `rgba(16,185,129,…)`) instead of `var(--success)`/`var(--warning)` — these will **not follow theme/mode changes**.
- **Hardcoded purple that ignores Earth theme:** `OrganizationWorkspace.tsx:677` violet badge (`rgba(168,85,247,…)`), `ThemeSelector.tsx` palette literals.
- **`--text-muted` under-specified:** dark-mode value `#8f86a0` is ~4.5:1 on `--bg`; on `--surface-2` it dips below AA for small text. Constitution §7.5 sets a 4.5:1 floor but the token itself is borderline. Needs a measured verification, not an assertion.

**Recommendations:**
- Constitution §7.2 must add: "All legacy amber/emerald/red/blue utilities resolve to the *matching* status token; `--accent` may never absorb a status color." Flag the `main.css:321` remap as a known defect to fix.
- Mandate that the design-system `<Badge>` use `var(--success)/var(--warning)`.
- Add a **token contrast validation table** (§III, missing rule) with measured contrast ratios per token per theme/mode.

### 5. Enterprise scalability — ⚠️ Advisory; three structural risks unaddressed

- **Permission-template manager, chart surfaces, and billing tables have no overflow wrappers** and will overflow on narrow enterprise screens.
- **Zero sticky-first-column tables** exist — the §16.2 mandated pattern for wide data is unimplemented.
- **`WorkspaceSidebarNav` is dead code** — imported in 8 workspace files, rendered **nowhere**. The constitution references it (§Appendix, §29) as a reusable enterprise nav component. It is not.
- **No `error.tsx`/`loading.tsx`/error boundaries anywhere** — for an enterprise app with 20+ workspaces this is a reliability gap; the constitution mandates error/loading states (§24–25) but no infrastructure enforces them.
- **OrganizationManager empty-state gap:** `filteredClinics.map` and `filteredUsers.map` render nothing on empty — no empty state, directly violating §23.

**Recommendations:**
- Constitution should not list `WorkspaceSidebarNav` as an established enterprise component (§Appendix) until it is rendered; mark it "deprecated/dead, pending adoption or removal."
- Add an enterprise rule: "Every data view must have an empty state, a loading state, and a bounded-height scroll container with sticky first column for >8-column tables."
- Add a rule mandating `app/error.tsx` + `app/loading.tsx` per route segment (or a shared ErrorBoundary) as infrastructure, not convention.

### 6. RTL compatibility — ❌ The most serious mismatch between the constitution and the codebase

- **Logical utilities are effectively unused:** `ms-*` **0**, `me-*` 1, `ps-*` 1, `pe-*` 1, `start-*` 3, `end-*` 2, `rounded-s/e-*` **0**. The `tailwindcss-rtl` plugin the constitution relies on (§5) is installed but dormant.
- **Physical directional utilities are ubiquitous and largely UNCOVERED by the `main.css` remap block** — which only remaps a fixed whitelist (`mr-1/2/3/4/6`, `ml-1/2/3/4/6`, `pl-2/3/4`, `pr-1.5/2/3/4`, `border-l/r[-2]`, `left-0/4`, `right-0/4`). Confirmed uncovered, per file:line:
  - **Padding:** `pr-1` (24 uses: AuditWorkspace:304, BillingWorkspace:1602, OrganizationWorkspace:1108…), `pl-8` (10), `pl-9` (6), `pl-6` (4), `pl-10` (2), `pl-12`, `pr-8`, `pr-10`, `pr-12`, `pl-7`, `pl-3.5`, `pl-1`
  - **Margins:** `ml-0.5`, `ml-1.5`, `ml-0`, `mr-1.5`
  - **Positioning:** `left-2.5` (8, all search icons), `left-1/2` (6), `left-3/3.5/2/6/7/10/16/24`, `right-6` (8, all FABs/toasts), `right-2` (8), `right-16/20/24/full`
  - **Text align:** `text-left` 154, `text-right` 111 — never remapped; many tables force `text-left`/`text-right` explicitly.
  - **Corner radii:** `rounded-tl/tr-*` (10), `rounded-r-3xl` — never remapped (chat bubbles, panels).
  - **Transforms:** `translate-x-*` (18, toggles/sliders), `rotate-180` (3, chevrons) — never flipped.
- **Remap block itself has bugs:** `main.css:976` gives `.border-l` (should be 1px) `border-right-width: 2px`; `main.css:977` gives `.border-r-2` `border-left-width: 1px`. Border weights invert on RTL.
- **`.nav-item.active::after` indicator** uses physical `right: 0` — the signature 3px rail bar stays on the *right* even in Arabic (mirror is broken).

**Recommendations:**
- The constitution's RTL strategy ("use logical utilities") is the correct **target**, but it cannot be stated as current practice. Add a **migration-status note** and a hard rule: "No new physical directional utilities (`ml/mr/pl/pr/left/right/text-left/right/border-l/r/rounded-tl/tr/bl/br/translate-x/rotate-180`) in new code."
- Amend §14.4: the active-tab indicator must use logical start (`inset-inline-start`) so the bar mirrors in RTL.
- Flag the `.border-l`/`.border-r-2` width bugs for the CSS migration.

### 7. Accessibility (WCAG AA) — ⚠️ Aspirational; two concrete AA breaches already present

- **Amber→accent remap (§4)** converts warning text to brand color — the *color contrast for warning semantics* is lost, but worse, **warning/danger status differentiation collapses**, an AA 1.4.1 (Use of Color) concern.
- **`bg-black*` is NOT remapped (72 + 56 variant uses)** — CommunicationWorkspace (19), AppleDemoWorkspace, Pricing, modal scrims. In light mode these are near-black blocks; any white text on them passes, but any token-dark text on them fails. Contrast is fragile and the constitution's §27.1 guarantee doesn't hold until remapped.
- **Light-mode contrast risk on glass:** light-mode `--glass-fill` = `rgba(255,255,255,0.55)`; legacy `text-zinc-400/500`-style content over it (muted text 790 `text-white` remaps aside) may dip below AA. §7.5 asserts compliance without measured proof.
- **Missing keyboard/focus evidence for the custom active-nav pill** (`DashboardShell` inline-style `layoutId` pill) — motion + inline styles bypass the `.nav-item.active` focus conventions.
- **`<kbd>`/mono content forced `direction: ltr`** (`main.css:983`) is correct for code but the constitution doesn't specify *when* mono must be LTR-embedded vs. RTL — ambiguous for Arabic labels in mono badges (§III ambiguity).

**Recommendations:**
- Add a **measured contrast table** per token × theme × mode (§III missing rule) — this is the single highest-value addition.
- Add rule: "Status is never conveyed by color alone (AA 1.4.1): warning/danger always pair with icon or text."
- Mandate an automated check (axe-core in CI) rather than manual §27 review.

### 8. Mobile responsiveness — ✅ Largely sound

- Rail `hidden lg:flex` + `w-[72px] hover:w-64` + mobile drawer (hamburger `lg:hidden`, `w-full max-w-xs`) — matches §14/§26.
- Horizontal tab bars collapse to `overflow-x-auto` + `shrink-0` (OrganizationWorkspace:701, PatientWorkspace:331). ✅
- Responsive grids pervasive (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`). ✅
- **Gaps:** FABs/toasts use physical `fixed bottom-6 right-6` (breaks RTL, §6); tables without overflow wrappers (§5); no bottom-nav alternative to the drawer (acceptable, but constitution §26 doesn't specify the mobile nav mode — it says "bottom bar / hamburger" — ambiguous).

**Recommendation:** Spec §26 precisely: mobile uses the hamburger drawer (current), bottom nav is **not** used. Add the 44px target rule for ≤md (already implied, make it explicit and numeric).

### 9. Future AI-generated components compatibility — ⚠️ Needs explicit rules

- AI-generated code is the primary authoring path for this repo. The two strongest drift vectors — **arbitrary utilities** (`text-[10px]` ×829, `rounded-[1.75rem]` ×0, `text-[9.5px]`) and **inline hexes** — are exactly what LLMs emit when rules aren't machine-enforceable.
- The constitution is prose; it has **no lintable constraints** (no eslint rule, no `cn()` constraint, no token-denylist). Without a mechanical gate, "reuse tokens" will not survive codegen.

**Recommendations:**
- Add a rule: "Arbitrary Tailwind values (`text-[…]`, `bg-[…]`, `rounded-[…]`, `w-[…]`) are forbidden for colors, font sizes, and radii; they may be used only for the three documented exceptions (page padding `p-6`, rail `w-[72px]`, icon `size-[18px]`)."
- Add a CI lint rule (tailwind class denylist + hex-color check) — the constitution should mandate the gate, not just the principle.

### 10. Multi-theme compatibility — ⚠️ Defaults correct, coverage incomplete

- **Theme architecture verified:** `data-theme="purple" data-mode="dark"` SSR default; localStorage `healthos_theme_id`/`healthos_mode`; inline flash-prevention script; `applyThemeToDocument()` in `ThemeSelector.tsx`; 4 token matrices in `main.css:21-213`. **Constitution §8 is accurate.**
- **Gaps:** `viewport.themeColor: '#10b981'` (emerald) in `app/layout.tsx:21,46` — **not in either theme palette**; a starter-template leftover that breaks mobile browser-chrome branding in purple/earth.
- **Unremapped light-mode hazards:** `bg-black*` (128), `bg-white*` (102+84), `bg-zinc-950/95`, `/5`, `/70` — light-mode breaks (confirmed examples: Pricing `bg-black`, AppleDemoWorkspace bottom-sheet, CommunicationWorkspace `bg-black/80` panels). The `!important` remap saves most zinc but explicitly not black/white.

**Recommendations:**
- Constitution §8 add: "`themeColor`/tileColor must derive from the active theme's `--accent` (or a per-theme static), never a hardcoded green."
- Add §8 rule: "New code must not use `bg-black`/`bg-white` for surfaces; use `--bg`/`--surface-*`/`--surface-solid`." Flag the ~128 `bg-black` sites as migration debt.

### 11. Dashboard scalability — ✅ Rules sound; one enforcement gap

- §28 stat-card anatomy, single `card-gradient`, density-ladder are well specified and match `OperationalDashboard`/workspace patterns.
- **Gap:** no rule bounding the number of stat cards or chart surfaces; nothing prevents an ungoverned 8-card dashboard. For enterprise scale, add: max 4–6 stat tiles per dashboard, max 2 chart surfaces per view.

### 12. Navigation scalability — ✅ Structurally correct; 2 issues

- 15 flat tabs **exactly at** the constitution's max — flagged by the user's own pending IA-refactor request. §14.3 already says group and collapse. **Correct direction.**
- **Issue 1:** `nav-item active` badge style in OrganizationWorkspace adds `scale-[1.02]` + `font-extrabold` beyond the constitution's spec — minor, but violates "one spec."
- **Issue 2:** The `nav-item` indicator bar is physical `right: 0` (RTL broken, §6); also `DashboardShell`'s active pill uses inline `layoutId` motion, a *third* active-state recipe. The constitution describes one active state; code has three (`.nav-item.active`, shell `layoutId` pill, PatientWorkspace `border-b-2 border-gold-500`).

**Recommendation:** §14 must enumerate the *accepted* active-state recipes (max one, plus the shell pill as the documented app-chrome exception) and require the rest to be migrated.

### 13. Data-heavy tables — ⚠️ Rules incomplete for real enterprise data

- **Zero sticky-first-column tables** exist; ~half of tables lack `overflow-x-auto` wrappers (BillingWorkspace:1431, AnalyticsWorkspace:503, PermissionTemplateManager:692/949/1080, Patient/BillingOverview:681).
- All 28 tables have `<thead>` ✅ (no orphan data).
- Tables use `text-xs font-mono` + `text-[10px]` headers — **below the constitution's §16.1 header size (`.625rem`) by arbitrary overrides**, and header readability at 10px fails comfortable scanning.
- No row-action-on-hover pattern standardized (some inline buttons, some kebab). No density/virtualization guidance for 10k+ row tables (no pagination standard either — some have none).

**Recommendations:**
- §16 add: "Tables wider than the container must wrap in `overflow-x-auto` with `sticky` first column (identifier); mandated, not optional." (Currently stated as a pattern, not a hard rule.)
- Add §16 rule: "Header size is exactly `.625rem`; `text-[10px]` or smaller is forbidden for headers." Add pagination or incremental-loading standard for >1,000 rows.

### 14. Forms — ⚠️ Constitution over-engineers what doesn't exist

- **No per-field validation anywhere.** The only error surface is a single `LicenseGate` banner. The constitution's §17.2 validation-state table (idle/focus/valid/error/disabled with colored borders) describes a system that is not implemented.
- Labels-above ✅ (consistent). Required = native `required` only, **no visible asterisk**, contradicting §17's required-mark rule.
- No shared `Input`/`Field` primitive (only a local `Field` in OrganizationManager).
- Input radius drifts: `rounded-xl` overrides the global `0.875rem`.

**Recommendations:**
- Mark §17.2 as **target-state** with a migration note, and add the immediate rule: "All fields show real-time validation on blur/submit with `--danger` border + message (§17.2), and required fields carry the accent `*`."
- Add a shared `Field`/`Input` primitive to the design-system inventory (missing component rule).

### 15. Medical workflow usability — ⚠️ Two gaps for a clinical context

- **No error boundaries (§5)** — a runtime error in EHR/billing crashes the workspace silently. For clinical software this is unacceptable; the constitution's §25 error rules don't mandate infrastructure.
- **Amber→accent remap (§4)** means "warning/precaution" levels (EHR precaution chips) lose their semantic color — **clinically dangerous** color semantics.
- Missing rules for: clinical urgency hierarchy (how urgent vs. routine are visually differentiated beyond color), audit-required confirmation flows (§21 dismisses confirmations as an option, not a rule), and 508/screen-reader criticality of health data.

**Recommendation:** Add §33 "Medical/Clinical Rules": error-boundary infrastructure mandatory, status semantics never remapped, confirmation flows for destructive clinical actions, and screen-reader-accessible data tables with row-level context.

---

## II. Rule Classification

### A. Conflicting rules (constitution vs. code, or internal)
1. **§6.2 page-title scale** (Space Grotesk `text-3xl/4xl`) vs. implemented (Manrope `text-xl/2xl`, 15 pages) — spec states a pattern the app doesn't use.
2. **§11 flagship card radius `1.75rem`** vs. zero uses and de-facto `rounded-3xl` (1.5rem) — two "the" radii.
3. **§18 button recipe** vs. `Button/Button.tsx` CSS-Module variant (`uppercase`, `px-8 py-3.5`) — same component, two specs.
4. **§16.1 header size `.625rem`** vs. widespread `text-[10px]` headers — spec vs. practice.
5. **§7.2 status semantics** vs. `main.css:321` remapping amber→`--accent` — the CSS itself breaks the rule.
6. **§31.3/§6.1 mono face** (JetBrains Mono) vs. never-loaded → system fallback — spec mandates a font that isn't shipped.
7. **§14.3 active-state recipe** vs. three competing active-nav recipes in code.

### B. Ambiguous rules (need tightening)
1. **§5 "gutters 1.5rem"** — is this the page grid gap or card internal gap? (Code uses both `gap-4` and `gap-6`.)
2. **§6.2 Arabic uppercase handling** — "must degrade gracefully" is not a rule; specify exact behavior for `text-transform: uppercase` on Arabic.
3. **§12 RTL icon flipping** — "directional icons flip" — which lucide icons are directional (arrow/chevron), and how is that enforced?
4. **§26 mobile nav** — "bottom bar / hamburger" — pick one; code uses hamburger drawer.
5. **§22 tabs vs. §14 nav** — when is a horizontal workspace tab (nav) vs. an in-panel tab/segment? The line between "tab bar" and "tabs" is blurred.
6. **§27.3 "reduced motion via tokens"** — the global kill-switch handles it; "must respect automatically" is unenforceable prose.
7. **§18 danger action** — "danger uses danger-tinted secondary, never saturated fill" — but §20.2 says confirm buttons are "primary (confirm)"; is a destructive confirm primary or danger-secondary? Needs one unambiguous statement.

### C. Missing design rules (not covered at all)
1. **Chart/visualization token rules** (chart palettes, gridline color, tooltip surface) — 80 hardcoded chart hexes prove this is needed.
2. **Contrast-verification table** per token × theme × mode (measured ratios).
3. **Font loading/deployment rule** (which fonts MUST ship: add JetBrains Mono + Noto Sans Arabic/Tajawal).
4. **Arbitrary-utility denylist** (`text-[…]`, `bg-[…]`) + CI enforcement rule.
5. **`themeColor`/PWA tile-color theming rule**.
6. **`bg-black`/`bg-white` surface ban** (light-mode hazards).
7. **Error-boundary / `error.tsx` / `loading.tsx` infrastructure mandate**.
8. **Per-field validation mandate** (matching §17.2 target).
9. **Shared form primitives** (`Field`, `Input`) — missing from the component inventory.
10. **Data-density limits** (max stat tiles, max charts per dashboard, table pagination/virtualization).
11. **Dead-code governance** (`WorkspaceSidebarNav`) — remove or adopt; constitution shouldn't cite it as an established component.
12. **Clinical/medical rules (§33)** — error boundaries, status semantics, confirmation flows, screen-reader tables.

### D. Rules risky in large enterprise deployments
1. **"Exactly one primary button per view"** (§18) — too rigid for multi-action enterprise headers; should be "one primary *action* per logical task group," not per view.
2. **"No more than 15 tabs"** (§14.3) — fine, but the OrganizationWorkspace is already at 15 with **no grouping**; the rule must couple with the grouping mandate or it's already violated.
3. **"One gradient wash max per view"** (§15.3/§28.2) — reasonable but unenforceable without a view-scoping definition (what is a "view"?).
4. **"Max one modal at a time"** (§20.3) — conflicts with real patterns (form modal opening a confirm/drawer); should be "no *stacked* visible modals without a deliberate flow."
5. **"Sticky first column"** (§16.2) — mandated for wide tables is good, but horizontal sticky + mobile + RTL is complex; scope it to ≥8 columns or scroll width > 720px, and require it to respect logical start.
6. **`!important` remap dependency** (§32) — the constitution says "retire progressively," but 4,000+ legacy uses mean every new component risks regressing if the remap is removed; needs a **feature-flagged migration**, not a convention.
7. **Entrance-stagger "max 120ms apart"** (§13.4) — micro-rule with low value and high drift risk in codegen; consider demoting to guidance.

---

## III. The Four Highest-Impact Defects (fix before/at ratification)

1. **RTL is not implemented despite being claimed.** ~400 physical directional utilities fall outside the remap whitelist (paddings `pr-1`×24, `pl-8`×10; position `left-2.5`×8, `right-6`×8; `text-left`×154/`text-right`×111; corner radii; transforms). **Arabic is the default locale.** This is a release-blocker for a bilingual enterprise product. Constitution must: (a) state current status honestly, (b) forbid new physical direction utilities, (c) fix the `.border-l`/`.border-r-2` remap bugs.
2. **Amber→accent remap breaks warning semantics** (`main.css:321-324`) — clinically and semantically wrong; must be corrected in the CSS and enforced by a new §7.2 rule.
3. **Fonts referenced but not loaded** (JetBrains Mono ×1,473 uses; Noto Sans Arabic/Tajawal for the default Arabic locale). Constitution mandates faces that don't ship. Must add a font-shipping rule.
4. **No enforcement gate for token rules.** The exact drift vectors (arbitrary `text-[10px]`×829, inline hexes, dead shadow tokens) are what codegen produces. Constitution must mandate a lint gate (class denylist + hex check + `cn()` contract), or "reuse tokens" remains aspirational.

---

## IV. Verification Notes

Claims verified directly during audit:
- Amber remap → `var(--accent)` confirmed at `main.css:321-324`.
- JetBrains Mono absent from the `@import` (line 8) confirmed.
- `.skeleton` class: 0 uses across all `app/`/`components/` `.tsx`.
- Theme architecture (`data-theme`/`data-mode`, localStorage keys, `ThemeSelector.applyThemeToDocument`) confirmed.
- RTL remap whitelist scope + `border-l`/`border-r-2` width inversion confirmed at `main.css:976-977`.

---

## V. Recommendation

**Ratify-with-conditions.** The constitution's *architecture* is correct and matches the codebase's intended direction. Do not rewrite it. Do, however:

1. **Add a "Current vs. Target State" disclaimer** (§0 or appendix): every rule that the audit shows unimplemented (JetBrains Mono, 1.75rem radius, page-title scale, shadow tokens, per-field validation, sticky columns, logical utilities) is marked **Target State** with a pointer to the evidence.
2. **Fold the four highest-impact fixes (III) into the constitution** as binding rules + known-defect flags.
3. **Add the missing rules (II.C)** most critical to codegen safety: arbitrary-utility denylist, chart tokens, contrast table, font shipping, `bg-black/white` ban, error-boundary mandate.
4. **Resolve the conflicts (II.A)** and ambiguities (II.B) — especially §18/§20 danger-primary rule, §26 mobile nav, §14 vs §22 tab taxonomy.
5. **Gate ratification** on the two release-blockers: RTL enforcement rule + amber remap fix, with the font-shipping and lint-gate rules added as conditions.

Once these are incorporated, the constitution is ratifiable and will govern both the navigation IA refactor and all future component work.

---

## VI. v1.0 Resolution Confirmation

All recommendations from §V were implemented in the v1.0 constitution:

| §V requirement | v1.0 implementation |
|---|---|
| "Current vs. Target State" disclaimer | §0 philosophy + §40.2 migration plan (M1–M18) |
| Four highest-impact fixes (III) as binding rules | RTL → §17 production-ready architecture; amber remap → §6.3 + M1; font shipping → §8.1 + M3; lint gate → §0 + §2 + M18 |
| Missing rules (II.C) | arbitrary-utility denylist §2.1; chart tokens §6.5/§34; contrast table §6.6/§19.1; `bg-black/white` ban §7.6 + M8; error-boundary mandate §30.2 + M11; per-field validation §22.2 + M10; font shipping §8.1 |
| Conflicts (II.A) resolved | §8.3 page-title scale; §11 flagship radius; §20.2 deprecates CSS-Module `Button`; §8.3 mono-heading ban; §6.3 brand-never-semantic |
| Ambiguities (II.B) resolved | §9 gutters clarification; §8.3.6 Arabic uppercase; §15/§17.7 icon flips; §18 hamburger-only; §25 vs §31 tab taxonomy; §26.2 danger confirm; §23.2.3 sticky-column scope; §40.2 feature-flagged migration; §14.4 stagger demoted to guidance |
| Ratification gate (2 release-blockers) | RTL enforcement §17.2 + M9; amber remap §6.3 + M1; font-shipping §8.1 + M3; lint-gate §0 + M18 |

**Constitution v1.0 is now consistent, complete, and governs the navigation IA refactor and all future component work. Awaiting final approval before any application code is modified.**
