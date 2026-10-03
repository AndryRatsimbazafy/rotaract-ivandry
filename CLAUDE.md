# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Website for the Rotaract Club Ivandry: a public Front Office, an admin Back Office, and a backend API. `PROJECT_CONTEXT.md` is the reference for decisions, constraints and scope — read it before any structural change, and update it when a documented decision becomes obsolete.

State: the Front Office (`apps/web`) v1 is complete and connected to the API (feature 009): five pages read published content through `src/data/*` from the Next.js server (`src/lib/api.ts`, time-based revalidation of about 60 seconds, action and news lists read in full by pages of 100, no visible pagination), news days and months shown in Madagascar time (`src/lib/dates.ts`), and the application form posts through a Server Action; `apps/web/.env.local` (`API_URL`, server-side only) is created by hand. `apps/api` has its foundation in place (validated env configuration, MongoDB connection, `/api/v1` prefix, common error format, global validation, security headers, `GET /api/v1/health`; `apps/api/.env.example` exists) admin authentication (`auth` module: single `ADMIN` account created only by `npm run seed:admin --workspace=api`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, JWT HS256 capped at 8 hours, Argon2id, `JwtAuthGuard` + `RolesGuard` on every admin controller class, login rate limit) and a first business module, `rotary-years`: public list `GET /api/v1/rotary-years` plus protected admin operations under `/api/v1/admin/rotary-years` (list, create, delete; deletion refused when a mandate references the year), and `members`: Member and MemberMandate models, admin operations under `/api/v1/admin/members` and `/api/v1/admin/mandates` (strict per-year display order, transactional reorder), public directory `GET /api/v1/members` and `GET /api/v1/members/years`; and `actions`: the Action model (unique slug generated from the title, `years` reserved, draft/published with a first-publication date that is never rewritten, optional impact, optional global manual order), admin operations under `/api/v1/admin/actions`, public reads `GET /api/v1/actions`, `/actions/years`, `/actions/:slug` (published actions only); and `news`: the News model (collection `news`, five locked types, unique slug among news with `archives` reserved, same publication rule as actions), admin operations under `/api/v1/admin/news`, public reads `GET /api/v1/news`, `/news/archives` (Rotary years with their count of published news), `/news/:slug`. and `applications`: the Application model (no processing status, never modified), public deposit `POST /api/v1/applications` in `multipart/form-data` (PDF, DOC or DOCX CV of 5 MB at most, type checked on content, 20 requests per hour per IP), admin operations under `/api/v1/admin/applications` (list, detail, CV returned by the API, deletion that also removes the file); the CV is stored on Cloudinary (raw, authenticated) behind the `StorageService` abstraction of the `media` module, the only place that knows the provider, and no storage reference ever appears in an API response. Three `CLOUDINARY_*` variables are mandatory at startup. Member portraits and action and news photos wait for image storage, whose provider is still open. Ten dependencies installed beyond the template. The Back Office (`apps/admin`) is built on that API (feature 008): login with the JWT kept in an `httpOnly`, `Secure` cookie, `src/proxy.ts` plus a protected layout, and screens for Rotary years, members and mandates (with per-year ordering), actions, news and applications (CV download relayed by the Back Office, never a storage URL). Reads happen in Server Components, writes in Server Actions; the browser never calls the API. MUI 9 with one functional theme; six dependencies beyond the template. `apps/admin/src/lib/dates.ts` is the only file that knows the club's time zone: news dates are entered and shown in Madagascar time and converted to UTC on the server. `apps/admin/.env.local` (`API_URL`, server-side only) is created by hand. `ARCHITECTURE.md` specifies the backend and Back Office; image storage (portraits, photos) is not done.

## Commands

Always run `npm install` from the repository root (single root `package-lock.json`). Node 22 (`.nvmrc`).

| Command (from root) | Effect |
|---|---|
| `npm run dev` | all three apps in parallel (shell `&` + `wait`, Linux/macOS only) |
| `npm run dev:web` / `dev:admin` / `dev:api` | one app |
| `npm run build` / `build:web` / `build:admin` / `build:api` | build all / one |
| `npm run lint` | lint all apps |
| `npm run format --workspace=api` | Prettier on the API |

Add a dependency to one app with `npm install <pkg> --workspace=<web|admin|api>`.

There are **no automated tests, by decision** — no unit, integration or E2E. Do not add test tooling, test files or test scripts.

## Architecture

npm workspaces monorepo (`apps/*`, `packages/*`), no Turborepo/Nx.

- `apps/web` — public Front Office, Next.js App Router, port **3000**
- `apps/admin` — Back Office, Next.js App Router, port **3001**
- `apps/api` — NestJS (Express platform), port **4000** (`process.env.PORT ?? 4000`)
- `packages/` — reserved for future shared packages, currently empty

Things that are not obvious from a single file:

- **No hoisting.** Root `.npmrc` sets `install-strategy=nested`: each app keeps its own `node_modules`, and the root `node_modules` only holds workspace links. This is a project constraint, not an accident — do not switch to a hoisted layout.
- **Toolchains differ per app.** `web`/`admin` use TypeScript 5 + ESLint (flat config, `eslint-config-next`), double quotes. `api` uses TypeScript 6 + oxlint + Prettier (single quotes, trailing commas), `module: nodenext`, decorators enabled.
- **Next.js version.** Both Next apps are on Next 16 and each contains an `AGENTS.md` generated by `next dev` pointing to the bundled docs in `node_modules/next/dist/docs/`; consult those docs before writing Next.js code, as APIs may differ from older versions.
- Next apps use `src/app`, CSS Modules (no Tailwind), and the `@/*` → `./src/*` import alias.

## Decided constraints

- npm only; TypeScript everywhere; no Docker; no CI/CD; deployment out of scope for now (later: Vercel for the two Next apps, Render for the API).
- In place in `apps/api`: MongoDB Atlas (Free) through Mongoose, JWT auth, a single `ADMIN` role. In place in `apps/admin`: MUI. The Back Office has its own functional look (`apps/admin/src/theme/theme.ts`); `DESIGN.md` does not apply to it. It uses no form, date, table or drag-and-drop library, and calls only existing `/admin/*` and `/auth/*` operations.
- `ARCHITECTURE.md` is the reference for the backend and Back Office (data models, MongoDB, API structure, endpoints, auth, API contracts, environment variables). Read it before any work in `apps/api` or `apps/admin`, or before connecting `apps/web` to the API; change a decision there first, never only in code. Its section 14 lists locked decisions and open ones; items marked « [ouvert] » need the user's decision before being implemented. Rules that must hold: Action and News stay separate entities, each with an explicit Rotary year chosen by the admin (never silently derived from the date); missing impact data is not displayed, with no placeholder text; a member's functions live in a per-Rotary-year mandate that can hold several functions, never in a single member property; applications are stored with no status workflow; admin endpoints live under `/admin` behind JWT + `ADMIN`, and the Front Office never calls them; `apps/web` reads data only through `src/data/*`; no secrets in code.
- Public UI is French only for v1. Keep the architecture ready for French + English, but do not implement English.
- Do not add dependencies or restructure the repo beyond what a task explicitly asks; work proceeds in explicitly requested steps (pages, models, auth, APIs, design implementation and UI components are each started only on request).
- `DESIGN.md` is the source of truth for the visual direction of the Front Office (colors, typography, layout, components, motion, accessibility). Read it before any UI work and follow it; change a design decision there first, never only in code. Its values are implemented as tokens in `apps/web/src/app/tokens.css` (Open Sans + Georgia, no dark mode in v1); the Home page is the reference implementation. This direction (premium editorial, documentary, asymmetric but controlled) is mandatory for **every** Front Office page, not only the Home: reuse the tokens, type scale, grid and composition devices, give each page its own composition rather than copying the Home, and never fall back to generic layouts or card grids. If an idea contradicts `DESIGN.md`, name the contradiction and propose an update to `DESIGN.md` before implementing.
- Commits follow Conventional Commits with a scope, e.g. `feat(web): …`.
