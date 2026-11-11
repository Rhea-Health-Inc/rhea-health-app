# Rhea Health — Dashboard App

The Rhea clinician software: sign in / sign up, the clinician workspace and
the organisation admin console. Split out of the original combined Lovable
project (`Rhea-Health-Inc/rhea-health`) on 2026-11-11.

The public marketing pages (home, about, pricing, Loop) live in the separate
`rhea-health-marketing` project.

## Pages

| Route                          | Page                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `/`                            | Redirects to `/app` when signed in, otherwise `/signin`                                                                         |
| `/signin`, `/signup`, `/reset` | Auth (mock, localStorage — see `src/lib/auth.ts`)                                                                               |
| `/app/*`                       | Clinician workspace: home, schedule, patients, visit, sessions, documentation, messages, analytics, practice, settings          |
| `/admin/*`                     | Organisation admin: overview, users, departments, roles, licenses, billing, usage, integrations, security, audit, AI governance |

## Development

```sh
npm install
npm run dev
npm run build   # production build
npm run lint    # eslint + prettier check
npx tsc --noEmit
```

Stack: TanStack Start (React 19, file-based routing), Vite, Tailwind CSS 4,
shadcn/Radix UI components in `src/components/ui`.

## Known issue carried over from the original project

The Rhea logo (`src/assets/rhea-logo.png.asset.json`) is a Lovable-hosted
asset pointer — its URL (`/__l5e/assets-v1/…`) only resolves inside Lovable's
hosting. Drop the real `rhea-logo.png` into `src/assets/` and update the
import in `src/components/clinik/Logo.tsx` before deploying anywhere else.

Auth is a demo mock (`src/lib/auth.ts`, localStorage only, no backend) —
that is how the original project worked; wiring a real backend is future work.
