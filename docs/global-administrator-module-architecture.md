# Global Administrator Module Architecture

**Status:** Proposed implementation baseline  
**Role designation:** Platform Owner  
**Display title:** Global Administrator  
**Scope:** Platform-wide administration and governance; organization operational workspaces remain tenant-scoped.

## Module domains

### 1. Executive & Platform Intelligence
- Global Overview
- Platform Analytics & Reports

### 2. Organization Governance
- Organization Management
- Registration & Approvals
- Organization Lifecycle
- Ownership, Succession & Recovery

### 3. Identity & Access Administration
- Global User Management
- Platform Administrator Management
- Roles & Permissions
- Authentication & Sessions

### 4. Platform & Site Configuration
- Site Settings
- Platform Configuration
- Communications & Notifications
- Localization & Regional Settings

### 5. Product & Commercial Management
- Subscription & Plans Management
- Module & Feature Management
- Marketplace Administration

### 6. Security, Risk & Compliance
- Security Monitoring & Incidents
- Audit Logs & Activity Review
- Compliance & Data Governance

### 7. Platform Operations & Integrations
- System Health & Monitoring
- Integrations & API Management
- Background Jobs & Scheduled Tasks
- Backup & Recovery Operations

### 8. Support & Resolution
- Support Management
- Dispute & Escalation Management
- Help Centre & Knowledge Base

## Reconciliation with the existing console

| Existing module | Domain | Target disposition |
|---|---|---|
| Platform Overview | Executive & Platform Intelligence | Retain; evolve into Global Overview |
| Organizations | Organization Governance | Retain; expand organization lifecycle controls |
| Registration Reviews | Organization Governance | Retain; present as Registration & Approvals |
| Global Assets | Executive & Platform Intelligence / Organization Governance | Review and constrain to authorized platform-level summaries; avoid unrestricted tenant data access |
| Custody & Movements | Executive & Platform Intelligence / Organization Governance | Review; platform-wide indicators and exceptions only unless explicitly authorized |
| Platform Users & Access | Identity & Access Administration | Expand and separate global users, delegated admins, roles, and authentication/session controls |
| Growth & Analytics | Executive & Platform Intelligence | Retain; consolidate into Platform Analytics & Reports |
| Platform Governance | Organization Governance | Retain; expand ownership, succession, recovery and delegated authority controls |
| Security & Audit | Security, Risk & Compliance | Retain; distinguish incident monitoring from immutable audit review |
| Maintenance Oversight | Organization Governance / Executive Intelligence | Reassess as cross-organization summary or exception view; operational maintenance stays in each organization |
| Compliance Oversight | Security, Risk & Compliance | Retain; focus on platform compliance and organization-level indicators |
| Reports & Exports | Executive & Platform Intelligence | Retain; consolidate into Platform Analytics & Reports with permission-controlled exports |
| Integrations & Data Operations | Platform Operations & Integrations | Expand into integrations/API, data operations and job monitoring |
| Support & Platform Operations | Support & Resolution / Platform Operations | Split responsibilities: support cases vs technical operations and incidents |
| Platform Settings | Platform & Site Configuration | Retain; expand and explicitly include Site Settings |

> The existing navigation contains 15 entries including Registration Reviews, not 12. This audit uses the actual source labels as found in `src/app/page.tsx`; prior references to “12 modules” should be treated as the earlier baseline count, not the current source count.

## Authority and data boundaries

- Global Administrator (Platform Owner) is the highest platform-level administrative and governance authority.
- Platform Administrators have only explicitly delegated permissions and cannot appoint themselves Global Administrator/Platform Owner or bypass protected ownership governance.
- Founding Owner is an organization-scoped protected governance position, not platform ownership.
- Platform-wide administrative authority does not automatically grant unrestricted access to private organization asset, custody, financial, maintenance or personnel records.
- Tenant isolation, authorization, approval controls and audit recording must be enforced by the backend; navigation visibility is not authorization.
- Site Settings covers public-site identity, branding, contact details and public-facing configuration. Security, access, subscription and organization-specific controls remain in their respective domains.

## Implementation status

This document defines the target information architecture and reconciliation direction. It does not claim that these modules, backend permissions, integrations, reports or operational workflows are implemented or tested.
