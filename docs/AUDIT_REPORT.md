# Audit Report: Zordr Admin Portal

## 1. Repository Map (Largest 20 files in `src/`)

```
src/features/events/api.ts (382 lines)
src/features/settlements/components/SettlementsList.tsx (341 lines)
src/features/orders/components/OrdersList.tsx (331 lines)
src/features/events/components/EventReviewView.tsx (296 lines)
src/app/(admin)/dashboard/page.tsx (291 lines)
src/features/auth/components/LoginForm.tsx (282 lines)
src/features/employees/components/EmployeesList.tsx (257 lines)
src/mocks/store.ts (242 lines)
src/features/customers/components/CustomersList.tsx (241 lines)
src/features/settlements/api.ts (238 lines)
src/features/events/components/EventsList.tsx (234 lines)
src/features/organizers/components/OrganizersList.tsx (233 lines)
src/features/roles/components/RoleEditorModal.tsx (232 lines)
src/features/organizers/api.ts (220 lines)
src/__tests__/events.test.tsx (212 lines)
src/features/orders/api.ts (206 lines)
src/features/analytics/components/AnalyticsDashboard.tsx (203 lines)
src/features/organizers/components/OrganizerDetailView.tsx (200 lines)
src/features/events/components/EventContentPanel.tsx (196 lines)
src/features/roles/components/RolesList.tsx (172 lines)
```

## 2. Findings Table

| ID | Severity | Category | File:line | Problem | Proposed fix | Safe-to-auto-fix |
|---|---|---|---|---|---|---|
| 1 | Critical | Build | `src/app/api/admin/employees/[id]/route.ts` (and others) | Import of `NextResponse` from `next` instead of `next/server` causes build failure. | Change import path to `next/server`. | Yes |
| 2 | Critical | Build | `src/app/api/admin/employees/[id]/route.ts` (and others) | `Module not found: Can't resolve '@/mocks/handlers'` | Ensure correct import for the auth helpers (e.g. `import { requireAuth } from '@/mocks/store'` or create `handlers.ts`). | Yes |
| 3 | Medium | TypeScript | `src/features/employees/components/EmployeesList.tsx:83` | Type error: `variant` does not exist on `StatusBadgeProps`. | Add/update the `variant` property in `StatusBadgeProps`. | Yes |
| 4 | Medium | TypeScript | `src/features/employees/components/EmployeesList.tsx:239` | Type error: `columns` does not exist on `TableSkeletonProps`. | Refactor to use proper `TableSkeletonProps` (e.g., passing a generic `columns` config if required by component). | Yes |
| 5 | Medium | TypeScript | `src/features/employees/components/EmployeesList.tsx:244` | Type error: `pagination` does not exist on `DataTableProps<Employee>`. | Update `DataTableProps` to accept pagination or handle pagination in the container. | Yes |
| 6 | High | Hygiene / .gitignore | `.gitignore` | Ignored `/docs/` entirely which untracked `CONTRACT_GAPS.md` and `api_contract.pdf`. | Removed `/docs/` from `.gitignore`. | Yes (Done) |
| 7 | Low | Hygiene / Editor Config | `src/app/(admin)/dashboard/zordr-event-admin.code-workspace` | VS Code workspace file was tracked in `src/`. | Ran `git rm --cached` on the workspace file. | Yes (Done) |
| 8 | Low | Hygiene / Stray Files | `docs/api_contract.txt` | Duplicate `.txt` of the contract was present in `docs/`. | Deleted the stray text copy. | Yes (Done) |
| 9 | Low | Hygiene / `.env.example` | `.env.example` | Missing descriptive comments per variable requirement. | Added descriptions for `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_USE_MOCK_API`. | Yes (Done) |
| 10 | Medium | Linting | `src/__tests__/*-ui.test.tsx` | ESLint errors: `Component definition is missing display name`. | Add `displayName` to test wrappers or disable rule for tests. | Yes |
| 11 | Low | Dependencies | `package.json` | `depcheck` lists unused dependencies: `@radix-ui/react-toast`, `msw`. | Verify usage; remove if truly unused. | No (Wait) |
| 12 | Medium | SOLID / Single Responsibility | Various `api.ts` files | Multiple `api.ts` files exceed 200 lines, suggesting heavy mock data handling alongside API definitions. | Split mock logic into `mock.ts` or `store.ts` per feature. | No (Wait) |
| 13 | High | SOLID / Duplication | Multiple Modules | Pagination logic, filter bars, loading states, and KPI strips are heavily duplicated across lists (Orders, Settlements, Customers, etc.). | Abstract common filter, pagination, and status patterns into shared shell components/hooks. | No (Wait) |
| 14 | High | Folder Structure | `src/components/ui/` vs `src/components/shell/` | Needs verification to ensure no business logic or feature components live here. | Audit and relocate any incorrectly placed components. | No (Wait) |
| 15 | Medium | Security / Vercel Risks | `middleware.ts` | Verify cookie accessibility and proper matching (e.g. exclusion of `_next/static`). | Ensure middleware properly handles cross-domain cookie quirks if needed. | No (Wait) |

## 3. Tool Output Summaries

### `npx madge --circular --extensions ts,tsx src`
Processed 223 files (10.7s) (79 warnings). **No circular dependency found!**

### `npm run lint`
Failed with 3 errors: `Component definition is missing display name react/display-name` (all in UI test wrapper functions).

### `npx tsc --noEmit` & `npm run build`
Both commands fail. Primary failures:
- `error TS2724: '"next"' has no exported member named 'NextResponse'. Did you mean 'NextApiResponse'?`
- `error TS2307: Cannot find module '@/mocks/handlers' or its corresponding type declarations.`
- Several `TS2322` property mismatch errors on shared UI components (`StatusBadgeProps`, `TableSkeletonProps`, `DataTableProps`) in `EmployeesList.tsx` and `RolesList.tsx`.

### `npx depcheck`
- **Unused dependencies**: `@radix-ui/react-toast`, `msw`
- **Unused devDependencies**: `@vitest/coverage-v8`, `autoprefixer`, `postcss`, `prettier`, `tailwindcss` *(Note: Tailwind/PostCSS deps are false positives)*.

### Secrets Leaks Scan
Scanned via `git grep` for `password|secret|api_key|token`. Found expected `mock-token` instances, test configurations, and `VALID_PASSWORD` values in mock components. **No real production credentials or sensitive API keys leaked.**

---
*End of Phase 1 Report. Awaiting approval of findings before proceeding with Phases 3-6.*

## 4. Phase 1 Extended Findings (Step B)

### `npx knip` Output
Knip reported several unused items that can be cleaned up during refactoring:
- **Unused Files (9)**: `src/components/ui/badge.tsx`, `src/components/ui/separator.tsx`, `src/features/*/index.ts` (customers, events, orders, organizers, refunds, settlements), and `src/hooks/usePermission.ts`.
- **Unused Dependency**: `@radix-ui/react-separator` (since `separator.tsx` is unused).
- **Unused devDependencies**: `@vitest/coverage-v8`, `prettier`.
- **Unused Exports (27)**: Various UI component variants/subcomponents (e.g., `DialogTrigger`, `DropdownMenuGroup`, `TableFooter`), routing/config constants (`PATH_TO_MODULE`, query keys), and some unused utility functions (`usePreview`, `isTerminalStatus`, `useExportSettlements`).
- **Unused Exported Types (19)**: Several prop interfaces for UI components and data interfaces in feature modules.

### Route-by-Route Build Output (Next 14)
All routes successfully built. The first-load JS is well-optimized.
- **Global First Load JS**: 87.4 kB (Shared)
- **Static vs Dynamic**: 
  - All `page.tsx` routes are prerendered as **Static** (○), ranging from ~3 kB to ~12 kB in individual route size.
  - The `dashboard` and `customers` pages are slightly heavier at ~236 kB and ~137 kB total first-load JS.
  - Most API routes and dynamic routes (e.g., `events/[id]/review`, `organizers/[id]`) are **Dynamic** (ƒ).
  - Middleware compiled successfully to 26.7 kB.

### Tracked Files that should not be tracked
- Currently, there are no unexpected tracked files. In Step A, the `.code-workspace` file and `api_contract.txt` were removed, and the `docs/` folder was properly tracked. Tests (`page.test.tsx`) are co-located with pages, which is acceptable in the App Router if configured properly, though moving them to `src/__tests__/` would match the other test files.

### Vercel Checklist Items (Pre-Upgrade Assessment)
These items from Phase 5 are assessed on the current Next 14 build:
1. **Edge Runtime (`middleware.ts`)**: Currently runs on the Edge runtime in Next 14. This will need to be migrated to `proxy.ts` on Node runtime in Next 16.
2. **Cross-Domain Cookies**: The current `middleware.ts` might have issues with cross-domain cookies on Vercel depending on how subdomains are structured. This will be re-evaluated when migrating to `proxy.ts`.
3. **Route Handler Caching**: Next 14 caches GET handlers by default unless dynamic functions are used. We will verify that mock handlers rely correctly on dynamic behavior (like `force-dynamic` which was added in Step A) because Next 15+ changes GET handlers to be dynamic by default.
4. **Build Bundler Mismatch**: Next 14 uses Turbopack for `dev` (enabled in `package.json` with `--turbo`) but defaults to Webpack for `build`. This mismatch is largely resolved in Next 16 as Turbopack becomes the default for both.

---
*End of Step B Report. Ready for Next 16 Upgrade.*
