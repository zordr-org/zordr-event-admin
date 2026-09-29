# Handoff Document: Zordr Admin Portal - Admin Shell

Date: 2026-09-29
Scope: Admin Shell (Sidebar, Topbar, Layout, Mock RBAC) and 12 Module Placeholders
Status: Complete and tested

---

## What Was Built

### Housekeeping Fixes
- `dashboard` was moved into the `(admin)` route group so it gets the shell layout correctly.
- Added a stub `forgot-password` page inside the `(auth)` group, which just contains basic UI matching the design system (no actual API wiring yet, as it's a stub).

### Nav Config
- Created `src/config/nav.ts` as the single source of truth for the admin shell sidebar.
- Contains the 11 main modules (+ roles, which is accessible from employees) mapped to lucide-react icons and routes.

### Auth Session + RBAC
- Added `AdminUser` types and module-level permission definitions in `src/types/auth.ts`.
- `SessionProvider.tsx` added using TanStack Query to fetch the authenticated user session from the `/api/admin/auth/me` endpoint.
- Included `can(module, action)` helper inside the session context for conditional UI rendering.
- Created `<Can>` component to conditionally render parts of the UI based on permissions (UX only, backend still needs to enforce).
- Updated `src/middleware.ts` to redirect unauthenticated users away from `/(admin)` routes, and added `roles` to the protected route list.
- Configured 401 response handling globally inside `src/lib/api/client.ts` or `QueryClient` defaults to redirect to login.

### Shell Components
- Built out the layout in `src/app/(admin)/layout.tsx` incorporating `AdminShell.tsx`.
- Developed `Sidebar.tsx`, `Topbar.tsx`, and `CommandPalette.tsx` adhering to the design specifications (colors, spacing, icons, collapsible state stored in `localStorage`).
- Constructed shared building blocks (`PageHeader`, `KpiCard`, `StatusBadge`, `EmptyState`, `TableSkeleton`) inside `src/components/shell`.

### Placeholder Pages
- Scaffolded 12 placeholder pages (e.g. `organizers/page.tsx`, `events/page.tsx`, `roles/page.tsx`, etc.) to prove the routing and RBAC gating. If a user does not have permission, the `AdminShell` renders a 403 Forbidden screen gracefully.

---

## Known Issues / Intentional Omissions

**Roles module**: The 'Roles' module does not have a top-level sidebar item by design. It's accessible via the Employees screen. It was added as a placeholder page route (`/roles`).

**Mock Backend limitation**: Role switching relies on the `zordr_dev_role` cookie or defaults to `super_admin`.

**Dashboard Chart Tooltips**: The recharts tooltips are implemented but may need further styling refinement to completely match the exact shadow/border radius of the design, although they closely approximate it using tokens.

---

## Open Questions

**Field-level scoping**: The spec indicates that roles like Support should see minimal financial data. Currently, the Dashboard shows GMV and financial KPIs to everyone with `dashboard/view` permission, as hiding it dynamically on the frontend based on role isn't robust. This must be raised with the backend team to enforce field-level scoping on the `/api/admin/dashboard/summary` endpoint (i.e. omit financial data for roles that shouldn't see it).

**Missing Organizer Endpoints**: 
1. The design for the Organizer Detail screen includes an "Update Organizer" button, but `docs/api_contract.pdf` (and `.txt`) does **not** define an endpoint for updating an organizer from the Admin panel (only the Organizer Portal has `PUT /api/v1/organizer/profile`). I have listed this under Open Questions and will render the button disabled with a tooltip until backend support is added.
2. The spec mentions a bank detail "reveal" functionality that is audit-logged, however, there is **no dedicated reveal API endpoint** listed in the contract. I have left the bank details tab utilizing the existing data and will add this functionality once the backend specifies the endpoint.

---

## Files Modified/Created

- `src/middleware.ts`
- `src/config/nav.ts`
- `src/providers/SessionProvider.tsx`
- `src/app/(admin)/roles/page.tsx`
- (Various shell components and placeholders)

---

## Next Steps

With the shell in place, the next phase is to build the actual content for the 12 modules, starting with the **Dashboard** and **Organizers** modules. Ensure you leverage the shared components like `PageHeader` and `KpiCard`.