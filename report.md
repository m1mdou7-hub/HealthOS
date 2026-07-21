# HealthOS Forensic Audit Report

## 1. Project Architecture
The project is built on a Next.js (App Router) structure and is designed as a SaaS platform (specifically a Healthcare Operating System). It uses Supabase for authentication, user management, database access (PostgreSQL), and Stripe for payments and subscriptions. It uses a serverless architecture designed for Vercel deployment, leveraging Next.js server actions and API routes (e.g., Stripe webhooks, Gemini API).

## 2. Tech Stack and Versions
- **Framework:** Next.js `14.2.3`
- **Language:** TypeScript `^5.4.5` (running `5.8.3` in reality)
- **Database / Auth:** Supabase (`@supabase/supabase-js` `^2.43.4`, `@supabase/ssr` `^0.1.0`)
- **Payments:** Stripe (`stripe` `^14.25.0`, `@stripe/stripe-js` `2.4.0`)
- **UI / Styling:** React 18, Tailwind CSS `^3.4.4`, `lucide-react`, `recharts` `^3.9.2`, Radix UI (`@radix-ui/react-toast`), Framer Motion (`motion`)
- **AI Integration:** Google Gemini (`@google/genai` `^2.12.0`)
- **Package Manager:** `pnpm` (based on lockfile, but `bun` lockfile is also present)

## 3. Folder Structure
- `app/` - Next.js App Router pages and API routes (includes core modules like `/appointments`, `/audit`, `/billing`, `/patients`, `/settings`, etc.)
- `assets/` - Static assets
- `components/` - React components, organized by domain (`ui/`, `laboratory/`, `operations/`, `icons/`)
- `fixtures/` - Stripe testing fixtures
- `public/` - Public static files
- `styles/` - Global CSS (Tailwind)
- `supabase/` - Supabase configurations, migrations, and seed files
- `utils/` - Shared utilities, API helpers, Supabase client/server singletons, and Stripe configs

## 4. Build Errors
During the initial `next build`, a missing environment variable error occurs:
```
Error: Configuration Error: NEXT_PUBLIC_SUPABASE_URL environment variable is missing.
```
This is specifically triggered by `utils/supabase/admin.ts` when imported by the Stripe webhook handler.

After providing `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, another error occurs during static site generation:
```
TypeError: fetch failed
    at async rg.listUsers
[cause]: Error: connect ECONNREFUSED 127.0.0.1:54321
```
The build attempts to fetch users from a local Supabase instance at build-time (likely inside a Next.js route or server action generating static pages), failing if the instance is not running.

## 5. TypeScript Errors
Running `tsc --noEmit` yields no errors. The TypeScript configuration is strictly enforced (`"strict": true`) and successfully type-checks the current codebase.

## 6. ESLint Issues
Running `next lint` returns:
```
✔ No ESLint warnings or errors
```
However, using `depcheck` indicates several unused `devDependencies` related to ESLint: `eslint-config-prettier`, `eslint-plugin-react`, `eslint-plugin-tailwindcss`.

## 7. Next.js Issues
- A build error occurs if the local Supabase server is not running during the `build` process, which signifies that database calls are leaking into Next.js static generation phases.
- Using `next build` reveals warnings about webpack packfile cache serialization:
```
<w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (106kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
```

## 8. Dead Code
A `knip` audit indicates several unused files and exports:
- **Unused files:** `components/icons/GitHub.tsx`, `components/laboratory/mockData.ts`, `components/laboratory/types.ts`, `components/ui/AppointmentsWorkspace.tsx`, `components/ui/Input/index.ts`, `components/ui/Input/Input.module.css`, `components/ui/Input/Input.tsx`
- **Unused exports:** `ToastAction`, `reducer`, `toast` (in `components/ui/Toasts`), `postData` (`utils/helpers.ts`), `createClient` (`utils/supabase/middleware.ts`)
- **Unused exported types:** `RestorationType`, `CaseType`, `ShadeDetails` (in `components/operations/labTypes.ts`); `Json`, `TablesUpdate`, `Enums` (in `types_db.ts`)
- **Duplicate exports:** `MOCK_CHAIRS|MOCK_CHAIRS_STATUS` in `components/operations/types.ts`

## 9. Duplicate Code
Using `jscpd` for clone detection reveals 151 clones, comprising around ~5% duplicated lines and tokens across the codebase. Major areas of duplication include:
- `components/ui/LaboratoryWorkspace.tsx` and `components/ui/OrganizationWorkspace.tsx` have identical block clones.
- `components/ui/PatientWorkspace.tsx` contains heavy internal duplication (e.g., duplicated rendering structures).
- `components/ui/NotificationsWorkspace.tsx` has internal clones.
- `components/ui/PlatformWorkspace.tsx` and `components/ui/TasksWorkspace.tsx` share identical logical blocks.
- `utils/supabase/client.ts` and `utils/supabase/middleware.ts` / `utils/supabase/server.ts` share logic blocks.

## 10. Security Issues
- `utils/supabase/admin.ts` uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass Row-Level Security (RLS). This must only be used securely on the server (which seems to be correctly adhered to, but requires strict oversight).
- Build scripts implicitly assume local/development setups for production builds if proper ENV variables are not scoped correctly (e.g., `NEXT_PUBLIC_DEV_BYPASS_AUTH`).
- Stripe Webhook handler (`app/api/webhooks/route.ts`) explicitly logs verbose stack traces to the response body in case of errors:
  ```json
  "message": err?.message,
  "stack": err?.stack
  ```
  This is a critical security risk (information disclosure) in a production environment.

## 11. Performance Issues
- The `RootLayout` (`app/layout.tsx`) fetches the user via `getUser(supabase)` on every single top-level request, preventing aggressive caching of the root layout and potentially causing high database/latency overhead.
- React components using large duplicated structural blocks instead of abstracted sub-components may lead to larger bundle sizes (e.g., `PatientWorkspace.tsx`).

## 12. Supabase Integration
- Proper usage of `@supabase/ssr` for client, server, and middleware integration.
- Types are autogenerated in `types_db.ts`.
- Builds rely heavily on `listUsers` and active database connections, leading to brittle deployment pipelines if build-time data isn't mocked or safely handled.

## 13. Stripe Integration
- Integrated for subscription management (`@stripe/stripe-js`, `stripe`).
- Exposes an API endpoint (`/api/webhooks`) for Stripe events (`product.created`, `price.created`, `checkout.session.completed`, etc.).
- Uses testing and live keys interchangeably via environment overrides (e.g., `STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET`).

## 14. Missing Environment Variables
For a successful deployment or local build, the following are strictly required but absent by default:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GEMINI_API_KEY` (used for AI features)

## 15. Broken Imports
A `depcheck` run found missing dependencies required by files in the codebase, meaning they are either badly referenced or aliased improperly:
- `types_db` (used in `./utils/supabase/admin.ts`)
- `utils` (used in `./utils/auth-helpers/server.ts`)
- `styles` (used in `./app/layout.tsx`)

*Note: Next.js tsconfig paths `@/*` are defined, but the import `import 'styles/main.css'` in `app/layout.tsx` doesn't use the `@/` prefix, relying on `baseUrl: "."`. The same goes for `utils/helpers` in `auth-helpers/server.ts`.*

## 16. Broken Routes
The `next build` static page generation currently fails entirely due to database fetch calls occurring at build time (e.g. `listUsers` failing via `ECONNREFUSED` at `127.0.0.1:54321`). This completely breaks the deployment of statically generated routes like `/audit`, `/billing`, `/clinics`, etc., if a live database connection is not accessible at build time.

## 17. Recommended Development Roadmap
1. **Fix Build Errors:** Refactor Next.js pages or API routes to prevent static generation from making real database calls (e.g., `listUsers`), or wrap them in proper error handling/mocking during the build phase.
2. **Environment Configuration:** Enforce environment variable validation at runtime/build-time using a library like `zod` and `t3-env` to provide better error messages.
3. **Security Patch:** Immediately remove `err.stack` and sensitive error information from being returned in the Stripe Webhook `POST` response.
4. **Code Deduplication:** Refactor the heavily duplicated Workspaces (`PatientWorkspace`, `LaboratoryWorkspace`, `OrganizationWorkspace`) into reusable, parameterized components.
5. **Clean up Dead Code:** Remove unused components like `components/ui/AppointmentsWorkspace.tsx` and `components/icons/GitHub.tsx` as identified by `knip`.
6. **Fix Imports:** Update absolute imports to consistently use the `@/` prefix (e.g., `import '@/styles/main.css'` instead of `import 'styles/main.css'`) to align with Next.js path aliases and resolve `depcheck` false positives.
7. **Optimize Performance:** Review `RootLayout` user fetching. Consider passing the user session via a lower-level context provider or leveraging Next.js caching correctly so that public pages don't suffer performance hits from authentication checks.
