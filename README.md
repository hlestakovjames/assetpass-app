# AssetPass Application

**Repository:** `hlestakovjames/assetpass-app`  
**Application responsibility:** Authenticated AssetPass participant, Individual Workspace, Organisation Workspace and Platform Administration experiences.  
**Implementation status:** Early application foundation with a mixture of working flows, demo-backed views and route placeholders.

## Responsibility boundary

This repository owns the authenticated application experience:
- Sign-in, registration, email verification and account recovery UI.
- Authenticated account and context experience.
- Optional Individual Workspace.
- Organisation Workspaces and membership/asset workflows.
- Platform Administration Workspace.
- Authenticated Marketplace participation surfaces.
- Shared application shell, components, feature modules and backend API clients.

The backend remains authoritative for identity, workspace activation, membership, appointments, permissions, asset records, marketplace state and consequential actions. A frontend guard or hidden menu is not an authorization boundary.

The public marketing website is maintained separately in [assetpass-frontend](https://github.com/hlestakovjames/assetpass-frontend).

## Current route groups

| Route group | Responsibility | Current status |
|---|---|---|
| `/(auth)` | Login, registration and email verification | UI and API client foundation |
| `/account` | Account home, available contexts and Individual Workspace activation | Initial account/context landing and activation controls |
| `/individual` | Individual workspace and asset experience | Early route/component foundation |
| `/organization` | Organisation workspace, members and assets | Some API-backed and some demo/placeholder areas |
| `/platform` | Platform Administration Workspace | Existing console foundation with placeholder module routes |
| `/marketplace` | Marketplace participant experience | Route/feature placeholder; must use shared Marketplace domain |

The root route currently redirects to `/login`. After authentication, accounts with no active workspace are directed to `/account`. Several route folders contain only `.gitkeep`; these are planned locations, not implemented features.

## Current frontend structure

- `src/app/`: Next.js routes and layouts.
- `src/components/`: shared and workspace-specific presentation components.
- `src/features/`: feature-specific state and behavior.
- `src/features/authentication/`: authentication client/provider/guards and registration reference data.
- `src/features/organizations/`: organization API, demo data and demo provider.
- `src/features/platform/`: platform API.
- `src/app/platform/`: administration route group.
- `src/ARCHITECTURE.md`: frontend structural conventions.

The organization demo provider and demo data are explicitly prototype support. They must not be mistaken for authoritative backend records.

## Technology

- Next.js 16.4.2
- React 19.3.0
- TypeScript 5
- Tailwind CSS 4
- next-themes

## Local development

Requires Node.js 22 and npm.

```bash
npm ci
```

Set the backend API URL in a local `.env.local` file:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available scripts:

```bash
npm run lint
npm run build
npm run start
```

## Core alignment rules

- One persistent person identity/account may access multiple contexts; do not create duplicate accounts for individual, organisation or platform capacities.
- An authenticated account may exist without an Individual Workspace.
- `/account` is the safe landing for authenticated accounts with no active default workspace.
- Individual Workspace routes are guarded by server-resolved activation state; client guards improve navigation but do not replace backend authorization.
- Individual and organisation contexts can be established independently and linked later through verified identity/authority workflows.
- Context switching must revalidate access with the backend.
- Platform role, organisation role, membership, office/position and permission are distinct.
- Global Administrator is the platform role; Platform Owner is an ownership description, not an RBAC role.
- Marketplace public discovery and authenticated participation use the same authoritative Marketplace domain.
- Do not present demo data as live production data.
- AI recommendations must not silently perform consequential operations.

## Validation

```bash
npm run lint
npm run build
```

The repository includes a GitHub Actions workflow for lint and production-build validation. A successful CI run is required before a development pull request is considered ready.

## Next alignment work

1. Validate account landing, context selection and Individual Workspace activation/deactivation against the backend migration and CI.
3. Organisation-first onboarding and representative/authority verification.
4. Global Administrator role and permission alignment.
5. Replace demo-backed organisation/platform behavior incrementally as matching backend APIs become available.
6. Implement workspace capabilities against stable API contracts and acceptance tests.

## Source of truth

The expanded product and technical architecture, requirements, API boundaries, data diagrams, decision register and acceptance criteria are maintained in [assetpass-docs](https://github.com/hlestakovjames/assetpass-docs).
\n\nWorkspace selection is persisted per authenticated session through `POST /api/v1/workspaces/context/select`. The client refreshes `/auth/me` after selection; backend authority checks remain decisive. A session's selected context is carried forward during refresh-token rotation, while other sessions for the same account keep their own selection. The frontend navigation guard is a usability layer, not an authorization boundary.\n