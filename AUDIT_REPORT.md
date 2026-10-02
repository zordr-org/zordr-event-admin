# Zordr Admin Portal — Rigorous Audit Report

## 1. Build & Test Health

- **Blocker (Build):** `npm run build` fails with `Property 'mockOrganizersList' is incompatible with index signature.` in `src/app/api/v1/admin/organizers/route.ts:8:13`.
  - *Fix:* Remove exports of `mockOrganizersList` and `mockDetailStore` from the route file. Next.js Route Handlers strictly forbid exporting anything other than supported HTTP methods (GET, POST, etc.) or config variables.
- **Bug (Tests):** `npx vitest run` results in 1 failed suite (`src/__tests__/orders.test.tsx`, 3 tests failing). The DOM queries for the "Export Selected" button are timing out, likely due to accessible naming mismatches caused by the SVG icon.
  - *Fix:* Update the test queries or ensure the `exportBtn` has a consistent `aria-label`.
- **Bug (Types):** Grep found 14 instances of `as any` bypassing the compiler, primarily in `src/__tests__/*`, but critically also in `src/components/shared/DataTable.tsx:80` (`(row as any)[col.accessorKey as string]`) and `src/features/events/api.ts`.
  - *Fix:* Replace `any` with strict typing or `unknown` type guards.
- **Nit (Lint):** `npm run lint` threw a warning for `src/features/orders/components/OrdersList.tsx:206` regarding missing dependencies (`allSelected`, `isIndeterminate`, `toggleAll`, `toggleOne`) in a `React.useMemo` array.
  - *Fix:* Provide the exhaustive dependency array.

## 2. Cross-Module Consistency Audit

- **Blocker (Architecture):** The Organizers module defines and maintains its mock dataset inside `src/app/api/v1/admin/organizers/route.ts`, duplicating or ignoring the mock logic that belongs in `src/features/organizers/api.ts`.
  - *Fix:* Move the canonical mock data structures back to `features/organizers/api.ts` so `MockOrganizersApi` and the route handlers operate on the exact same shared reference, matching the Events and Orders patterns.
- **Architecture (Open/Closed):** Hardcoded string manipulation bypasses the shared component map. In `OrganizersList.tsx:117` and `OrganizerDetailView.tsx:81`, the `status` is transformed via `status === 'suspended' ? 'Blocked' : row.status` before being passed to `StatusBadge`.
  - *Fix:* Move the 'suspended' alias mapping directly into `STATUS_MAP` within `StatusBadge.tsx` so logic doesn't leak into the view.
- **Consistency (Props):** All shared components (`ConfirmDialog`, `EmptyState`, etc.) are being consumed with their strictly defined prop shapes across all modules. The previous `EmptyState` mismatch was verified as resolved.
- **Consistency (URL State):** `useUrlState` correctly uses consistent keys (`page`, `limit`, `search`/`q`, `status`, `city`) across all lists.

## 3. Data Integrity Audit

- **Integrity (Orders):** The Orders mock seed (`mockOrdersList` in `src/features/orders/api.ts`) perfectly maps to the existing Events dataset (`evt-1` through `evt-18`) and the Organizers dataset (`org-1` through `org-8`). There are zero orphaned references.
- **Integrity (KPIs):** KPI metrics across Events and Orders are dynamically derived (e.g. `mockOrdersList.filter(o => o.paymentStatus === 'paid').length`), avoiding static/hardcoded mismatches.

## 4. Business-Rule Enforcement Audit (Server-Side)

- **Blocker (API):** `src/app/api/admin/orders/bulk-action/route.ts` fails to validate the `reason` payload server-side when `action === 'refund'`. The UI mandates it, but a raw API call can bypass the check.
  - *Fix:* Add `if (!reason) return NextResponse.json({error: "Reason required"}, {status: 400})` to the handler.
- **Blocker (API):** The Organizers module lacks POST route handlers for Suspending or Rejecting organizers (e.g. `api/v1/admin/organizers/[id]/suspend`). The UI works by calling the mock client abstraction, but the actual backend endpoints do not exist yet.
  - *Fix:* Scaffold these endpoints and ensure they enforce a non-empty `reason` payload server-side.
- **Integrity (Events):** Events correctly enforce checklist constraints on `/approve` and require a minimum `notes` length on `/send-back` and `/reject` server-side.

## 5. Visual / Layout Audit

- **Bug (Layout):** In `src/components/shared/DataTable.tsx`, the primary wrapper `<div className={cn("rounded-md border bg-card", className)}>` wraps the `<Table>` without applying `overflow-x-auto`. Wide column sets will break the page bounds on smaller viewports.
  - *Fix:* Add `overflow-x-auto` to the wrapper div.
- **Nit (Tokens):** Check for instances of hardcoded semantic Tailwind classes (e.g., `bg-emerald-50`) instead of utilizing explicit CSS variables mapping to `--success`, etc., if dark mode is planned.

## 6. SOLID Principles Review

- **S (Single Responsibility):** Both `EventReviewView.tsx` and `OrdersList.tsx` are monolithic orchestrators handling data-fetching triggers, URL sync, complex table configurations, bulk actions, and nested UI rendering. 
  - *Fix:* Consider pulling the `columns` definitions and the `FilterBar` / `BulkActionBar` handlers into separate files (e.g., `OrdersColumns.tsx`) to keep the main file strictly focused on assembly.
- **O (Open/Closed):** The `StatusBadge` serves as a great example of this principle, except where Organizers bypassed it (as noted in Section 2). 
- **L (Liskov Substitution):** `MockXxxApi` and `HttpXxxApi` implementations faithfully satisfy their interfaces (`OrdersApi`, `EventsApi`), ensuring components can substitute one for the other without knowing the difference.
- **I (Interface Segregation):** Component interfaces are properly scoped without accumulating "god props."
- **D (Dependency Inversion):** The architecture cleanly hides direct `fetch` calls behind `getOrdersApi()` factories in all features.

## 7. Turbopack Assessment

**Recommendation:** Try `npm run dev --turbo`. 
Currently, the standard Webpack `next dev` server takes significant time to cold start. Given there are no complex `next.config.js` webpack overrides present, the stack (Next.js 14 + Tailwind + standard App Router) is highly compatible with Turbopack. 
- *Next steps:* Change the `dev` script in `package.json` to `next dev --turbo`. If SVGs or specific pages error out due to missing loaders, revert back to Webpack.

---

## Top Priorities (Action Plan)

1. **Fix the Next.js build failure** by removing the exported arrays in `src/app/api/v1/admin/organizers/route.ts`.
2. **Resolve the split state architecture** in the Organizers module by moving mock data to `api.ts`.
3. **Add server-side reason validation** for bulk refunds in `orders/bulk-action/route.ts`.
4. **Scaffold missing POST routes** for Organizer Suspend/Reject actions.
5. **Fix `DataTable` horizontal scrolling** by adding `overflow-x-auto`.
6. **Patch the Open/Closed violation** for the `suspended` status directly inside `StatusBadge.tsx`.
7. **Fix the failing 3 Vitest tests** in `orders.test.tsx` by updating the RTL DOM queries.
8. **Eliminate the 14 `as any` assertions** across the codebase.
