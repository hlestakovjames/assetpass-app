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

## Registration approval policy

New individual registrations are submitted for internal Platform Administration review. They cannot sign in until approved. Email verification is not required for sign-in once approved; the App must not present a newly submitted account as immediately active.

## Current route groups

| Route group | Responsibility | Current status |
|---|---|---|
| `/(auth)` | Login, registration, email verification, forgot-password and reset-password | Shared backend authentication and account recovery integration in progress |
| `/account` | Account home, available contexts and Individual Workspace activation | API-backed account/context landing, workspace controls and Account security entry point |
| `/account/security` | Signed-in password change | Verifies current password; revokes sessions and requires fresh sign-in |
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

Configure the same-origin API proxy in a local `.env.local` file:

```dotenv
ASSET_PASS_BACKEND_ORIGIN=http://localhost:3001
ASSET_PASS_PUBLIC_ORIGIN=http://localhost:3000
```

The browser calls `/api/v1/*` on the App origin. The Next.js BFF forwards requests to the backend and preserves the host-only authentication cookies. Do not set `NEXT_PUBLIC_API_BASE_URL` to the backend origin. In production, configure the two server-only variables to the exact deployed backend and App origins.

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


### Shared browser authentication and password recovery

The App browser uses a same-origin BFF route at `/api/v1/*`. Configure `ASSET_PASS_BACKEND_ORIGIN` and `ASSET_PASS_PUBLIC_ORIGIN` in the server environment. Browser code must use the relative `/api/v1` API base; do not point the browser directly at the backend origin or persist refresh tokens in browser storage.

Password recovery uses the shared backend endpoints:
- `POST /api/v1/auth/password-reset/request` — generic response to prevent account enumeration.
- `POST /api/v1/auth/password-reset/confirm` — single-use, short-lived token.
- `POST /api/v1/auth/change-password` — current-password verification, CSRF and authenticated session required.

Reset/change revokes all existing sessions. The user must sign in again. Account approval/status is not changed by recovery.

## Core alignment rules

- One persistent person identity/account may access multiple contexts; do not create duplicate accounts for individual, organisation or platform capacities.
- An authenticated account may exist without an Individual Workspace.
- `/account` is the safe landing for authenticated accounts with no active default workspace.
- Individual Workspace routes are guarded by server-resolved activation state; client guards improve navigation but do not replace backend authorization.
- Individual and organisation contexts can be established independently and linked later through verified identity/authority workflows.
- Context switching must revalidate access with the backend.
- Platform role, organisation role, membership, office/position and permission are distinct.
- Global Administrator is the highest platform role and retains all registered platform operational permissions; Platform Owner is the ownership description/title associated with that top authority, not a separate RBAC role. Central Platform Administrators are delegated administrators with individually assigned permissions. Private individual and organisation record access remains separately purpose-, resource-, privacy- and audit-controlled.
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
4. Verify Global Administrator role and permission alignment against the backend forward migration.
5. Replace demo-backed organisation/platform behavior incrementally as matching backend APIs become available.
6. Implement workspace capabilities against stable API contracts and acceptance tests.

## Source of truth

The expanded product and technical architecture, requirements, API boundaries, data diagrams, decision register and acceptance criteria are maintained in [assetpass-docs](https://github.com/hlestakovjames/assetpass-docs).


Workspace selection is persisted per authenticated session through `POST /api/v1/workspaces/context/select`. The client refreshes `/auth/me` after selection; backend authority checks remain decisive. A session's selected context is carried forward during refresh-token rotation, while other sessions for the same account keep their own selection. The frontend navigation guard is a usability layer, not an authorization boundary.


## Organisation-first onboarding

The registration screen offers a separate organisation application that does not require a personal AssetPass account or password. The organisation application uses the same dependent Country → County/Region → City/Town selectors as the individual registration flow, plus country-specific registration-authority options. It submits the ISO 3166-1 alpha-2 country code and resolved location names; if the location reference service is unavailable or a value is missing, manual entry remains available. The representative supplies organisation details, confirms authority and acknowledges the privacy notice. AssetPass emails a single-use verification link. After verification, the organisation enters the existing platform review process. Once approved, the representative receives a separate one-time claim code by email. They sign in with an AssetPass account using the same representative email, enter the code on the account page, and claim the organisation. The claim code—not the early-launch account emailVerifiedAt flag—proves control of the representative mailbox. After a successful claim, the app refreshes the resolved identity, selects the newly claimed organisation as the current session context through the backend, and then navigates to that organisation workspace.

The app route `/organization-onboarding/verify` handles the email token. The claim action calls `POST /api/v1/organizations/onboarding/claim`. After verification, the API returns a short-lived application-bound read-only onboarding session. The app keeps its bearer token in tab-scoped `sessionStorage` and uses it only for `GET /api/v1/organizations/onboarding/session` and `POST /api/v1/organizations/onboarding/session/close`. The session is not an AssetPass account or JWT login. Private evidence upload, session recovery and browser-level end-to-end testing remain outstanding.
## Phase 1 Marketplace participation settings — in development

Draft integration: [PR #27](https://github.com/hlestakovjames/assetpass-app/pull/27), dependent on backend [PR #25](https://github.com/hlestakovjames/assetpass-backend/pull/25).

Account Settings now includes an explicit individual Marketplace opt-in acknowledgement and an opt-out action. The UI distinguishes personal Marketplace participation from the central AssetPass identity, App access, organisation membership and organisation representation. Currently valid organisation representation grants are displayed separately. All changes are sent through the same-origin API BFF with CSRF protection; the backend is authoritative.

App CI and Vercel preview checks passed for the current feature branch. The capability is not yet merged to the shared integration branch or deployed as an enabled production feature.
