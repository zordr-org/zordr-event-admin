# Zordr Admin Portal - Contract Gaps

This document consolidates all identified gaps between the Zordr Events Platform API Contract and the administrative requirements of the frontend Admin Portal.

## Roles Module
* **Missing Permission Matrix**: `GET /admin/roles` returns no permission matrix.
* **Missing Role Detail Endpoint**: There is no `GET /admin/roles/{id}` endpoint. The role editor cannot load existing permissions to populate the UI.
  * *Frontend Workaround*: Uses a mock adapter `getRolePermissions(id)` to load the matrix.
  * *Proposed Endpoint*: `GET /admin/roles/{id}` returning `{ id, name, description, type, isDeletable, permissions: [{ module, canView, canCreate, canEdit, canDelete, canExport }] }`.

## Auth Module
* **MFA Workflow Mismatch**: The contract defines `POST /auth/admin/login` with an optional `mfaCode` in the same request, returning `{ accessToken, refreshToken, employee, mfaRequired }`. Our mock implementation uses a more standard two-step flow: `/admin/auth/login` followed by `/admin/auth/mfa/verify` using a `challengeId` and an `httpOnly` cookie.
  * *Proposed Action*: Either the frontend adapts to the single-request flow, or the backend updates the contract to support the two-step challenge-response flow.
* **Session Introspection**: No session-introspection endpoint exists.
  * *Frontend Workaround*: Uses a mock `GET /admin/auth/me`.

## Dashboard Module
* **Missing Summary Endpoint**: The contract only defines `/admin/analytics/overview`. There is no dedicated `/admin/dashboard/summary` endpoint to fetch the dashboard-specific aggregates.
  * *Frontend Workaround*: Uses a mock `/api/admin/dashboard/summary` endpoint.

## Employees Module
* **Missing Endpoints**:
  * No `GET /admin/employees/{id}` to fetch a specific employee's details.
  * No `POST /admin/employees/{id}/resend-invite` to resend an invitation email.
  * No `POST /admin/employees/{id}/revoke-invite` to revoke a pending invitation.
  * No `POST /admin/employees/{id}/deactivate` endpoint that accepts a reason.
  * No audit log listing endpoint for employee actions.
  * *Frontend Workaround*: Renders resend/revoke as disabled actions with tooltips indicating backend support is pending.

## Settings Module
* **Logo Upload**: There is no endpoint for uploading the organization logo. The `PATCH /admin/settings` endpoint only accepts a `logoUrl` string, but there is no admin equivalent of the organizer's pre-signed upload URL endpoint.
  * *Frontend Workaround*: The UI renders a URL text field with a preview, rather than a file upload dropzone.

## Organizers Module
* **Update Organizer**: The design for the Organizer Detail screen includes an "Update Organizer" button, but the contract does not define an endpoint for updating an organizer from the Admin panel (only `PUT /api/v1/organizer/profile` exists for the Organizer Portal).
  * *Frontend Workaround*: Button is rendered disabled with a tooltip.
* **Bank Detail Reveal**: The spec mentions a bank detail "reveal" functionality that is audit-logged, however, there is no dedicated reveal API endpoint listed in the contract.
  * *Frontend Workaround*: The bank details tab utilizes existing data without an explicit reveal step.

## Support Module
* **Missing Thread Endpoint**: No `GET /api/v1/admin/support/{id}` or equivalent thread endpoint exists to fetch ticket messages.
  * *Frontend Workaround*: Uses a mock adapter `getTicketThread`.
* **Missing Capabilities**:
  * No assign-to-agent endpoint (agents cannot claim or be assigned tickets).
  * No priority update endpoint (support tickets cannot have their priority changed by an admin).
  * No internal-notes endpoint (only public messages are supported; internal team notes cannot be attached to a ticket).
* **PII Scoping**: Field-level scoping of requester PII across roles is not specified (e.g., whether marketing should see less PII when viewing support tickets).

## Analytics Module
* **No Comparison Metrics**: The `overview` endpoint currently provides no delta/comparison versus the previous period, preventing the display of growth trends on the KPI cards.
* **Parallel Trends Calls**: The `trends` endpoint only accepts one metric per call, requiring 3 parallel calls from the dashboard.
  * *Proposed Action*: Add a batch option to the backend for efficiency.
* **Field-level Scoping**: Roles like `marketing_exec` shouldn't see GMV or settlement breakdowns, but the backend must enforce this at the endpoint level to avoid exposing financial data.
