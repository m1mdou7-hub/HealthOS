# Phase 3 Visual Migration Report

**Date:** 2026-08-07 · **Branch:** `constitution-phase-1-navigation` · **Goal:** unify the entire app (chrome + every workspace) onto the velvet OS look — gold accent, frosted glass, ambient lighting — without rewriting ~5,000 legacy class usages.

---

## 1. Root cause fixed

Two parallel theming systems ran simultaneously:

- **Legacy theme blocks** in `styles/main.css` (`html[data-theme='purple'|'earth'][data-mode='dark'|'light']`) hardcoded purple/earth values (`--accent:#9B71B2`, `--surface-solid:#150d1f`, `--bg:#0b0710`, purple mesh, purple borders) and won by specificity over velvet's `:root` aliases.
- **Velvet system** (`styles/velvet-tokens.css`) supplied gold (`--velvet-gold-500:#c9a84c`), velvet surfaces, frosted glass, and the premium ambient mesh.

Result: chrome (rail/header) rendered velvet gold, while **every workspace interior rendered legacy purple** — a visible split.

## 2. What changed

### `styles/main.css`
1. **Rewrote all four legacy theme blocks** (purple/earth × dark/light, previously ~7,450 chars each of hardcoded palette) to **alias the velvet palette**:
   - `--bg`/`--surface-*` → velvet surfaces
   - `--accent` → `var(--velvet-accent)` (gold)
   - `--mesh` → `var(--velvet-mesh-primary)` (gold ambient light)
   - `--gradient`/`--gradient-soft` → velvet gold gradients
   - `--glass-*` → velvet glass fills/blur
   - `--shadow-card`/`--shadow-pop` → velvet shadow composites
   - `--text`/`--text-sub`/`--text-muted` → velvet text tier
   - status colors → velvet success/warning/error/info
2. **GLOBAL REMAPPING layer** upgraded:
   - Structural slabs (`bg-zinc-950`, `#0d0d16` panels) → **translucent frosted glass**: `color-mix(...78%, transparent)` + `blur(28px) saturate(180%)`
   - Header/banner strips (`bg-zinc-900/85..90`) → frosted `blur(24px) saturate(170%)`
   - Accent-tinted badge variants (`bg-purple-500/20`, `text-purple-300`, `border-purple-500/30`, etc.) → gold accent glass (`--accent-glow2`/`--accent`)

### `styles/velvet-tokens.css`
- `--velvet-text-muted` → `var(--velvet-300)` (contrast fix from prior pass, kept).

### `components/ui/ThemeSelector.tsx`
- Theme preview swatches + accent dot now show the **unified gold/velvet look** instead of the legacy purple/earth gradients (which no longer render anywhere).

## 3. Migrated pages (before → after screenshots in `mockups/.qa/`)

| Page | Route | After screenshot |
|---|---|---|
| Dashboard | `/` | `after-dashboard.png` |
| Patients | `/patients` | `after-patients.png` |
| Clinics | `/clinics` | `after-clinics.png` |
| Laboratory | `/laboratory` | `after-laboratory.png` |
| Imaging | `/imaging` | `after-imaging.png` |
| Billing | `/billing` | `after-billing.png` |
| Settings | `/settings` | `after-settings.png` |
| Analytics | `/analytics` | `after-analytics.png` |
| Medical Records | `/medical-records` | `after-medical-records.png` |
| Inventory | `/inventory` | `after-inventory.png` |
| Automations | `/automations` | `after-automations.png` |
| Communication | `/communication` | `after-communication.png` |
| Documents | `/documents` | `after-documents.png` |
| Tasks | `/tasks` | `after-tasks.png` |
| Notifications | `/notifications` | `after-notifications.png` |

## 4. Verification (live computed styles, Chrome)

- `--accent` = `#c9a84c` (gold) on every page; `--velvet-accent` identical → **systems unified**.
- Body mesh = gold radial gradients (`rgba(201,168,76,0.12)`) — ambient lighting now gold.
- `nav-item.active` = gold `rgba(201,168,76,0.12)` bg + gold text.
- Text-gradient = `linear-gradient(135deg,#c9a84c 0%,#e0c880 50%,#b8b8e0 100%)`.
- `.btn-primary`/`.bg-gold-gradient` = gold gradient.
- Workspace root panels = glass `blur(22px) saturate(1.6)`; header strips `blur(24px)`; sidebar/main `blur(28px)` — **frosted-glass depth**.
- **Purple remnant count: 0** (was 5+ visible tokens). All 15 pages confirmed gold via pixel sampling (gold-pixel counts 2,300–6,000 per 1262×624 viewport).
- Light mode: `--accent #b8943a`, `--bg #fafaff`, `--surface-solid #f0f0f8`, `--text #18182e` — both themes unified.
- `next lint` exit 0 (0 errors), `tsc --noEmit` exit 0.

## 5. Remaining legacy (non-blocking)

1. **WorkspaceSidebarNav is dead code** — imported in `OrganizationWorkspace`, never rendered. Adopting/removing belongs to a later phase (M15 debt).
2. **Hardcoded hexes in workspace markup** — ~183 across `components/ui` (e.g. `BillingWorkspace` 33, `InventoryWorkspace` 27). They now render correctly because the remap routes them, but migrating to tokens is future polish.
3. **Legacy onboarding wizard** uses a hardcoded navy overlay (`rgba(2,6,17,0.82)`) instead of the tokenized Modal.
4. **Light-mode accent-on-bg = 2.75:1** (gold-on-white) — AA flag on brand-gold choice; dark mode passes (8.64:1). Brand decision, not auto-fixed.

## 6. Verdict

The visual split is eliminated. The entire app — chrome + all 15 pages — now renders in the unified velvet OS language: gold accent, frosted-glass interiors, ambient gold lighting, consistent text tier. No legacy page remains in the purple/earth palette.
