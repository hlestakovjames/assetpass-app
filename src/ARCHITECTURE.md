# AssetPass frontend architecture

This directory structure is the baseline for the AssetPass application. It separates route composition, presentation components, domain features and backend communication.

## Application routes — `app/`

- `(auth)/`: login, registration, password recovery and reset routes. The route group does not add an `/auth` URL segment.
- `platform/`: global platform administration workspace.
- `organization/`: organization-owned asset lifecycle workspace.
- `individual/`: individual asset ownership workspace.
- `marketplace/`: public asset discovery and published listings.
- `account/`: authenticated account landing, available workspace contexts, and Individual Workspace activation controls.

Each workspace owns its layout and route entry points. Route folders may remain intentionally empty until their module is implemented. Existing routes must remain functional during the structural rollout.

## Presentation — `components/`

- `ui/`: foundational design-system primitives.
- `shared/`: presentation components reused across workspaces.
- `platform/`, `organization/`, `individual/`, `marketplace/`: workspace-specific presentation components.

## Domain functionality — `features/`

- `authentication/`: sign-in, session restoration, identity resolution, account context and workspace activation API workflows.
- `organizations/`: organization registration and organization domain state.
- `assets/`: asset records and lifecycle workflows.
- `custody/`: assignments, custody and transfers.
- `maintenance/`: inspections and maintenance workflows.
- `marketplace/`: listing and discovery domain logic.
- `reporting/`: report definitions and reporting workflows.

## Shared application infrastructure

- `hooks/`: reusable React hooks.
- `lib/`: shared utilities and infrastructure.
- `services/`: API clients and backend communication.
- `types/`: shared TypeScript types.
- `config/`: application configuration.

## Architecture boundaries

- Pages and layouts in `app/` compose components and features; they should not become large containers for unrelated UI and business logic.
- `components/` owns reusable presentation, not backend persistence or domain workflows.
- `features/` owns domain-specific behavior and state.
- `services/` communicates with the AssetPass backend; `lib/` provides shared infrastructure.
- Marketplace discovery is public. Platform, organization and individual access must ultimately be enforced by backend-backed authentication and authorization, not merely by hiding navigation.
- Account identity and authentication do not imply an activated Individual Workspace. Accounts without an available default context land at `/account`.
- `IndividualWorkspaceGuard` is a client navigation guard only. The backend must enforce active workspace state on every personal workspace API; the existing personal asset registration/list endpoints use a server-side active-workspace guard.
- The auth client may refresh the resolved identity after workspace lifecycle commands, but it must not own or infer workspace activation state.
- A directory placeholder indicates an architectural location only. It does not mean the module is implemented.
