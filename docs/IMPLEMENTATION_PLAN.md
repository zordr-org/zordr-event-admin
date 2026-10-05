# Implementation Plan

## 1. Audit Findings

### a. Repo Hygiene
- **Loose Docs & PDFs in Root**: `Zordr_API_Contract_v2.pdf`, `Zordr_Admin_Portal_Event_Module_Dev_Doc.pdf`, `api_contract.txt`, `dev_doc.txt`. These should be moved to a `docs/` folder.
- **tsbuildinfo**: `tsconfig.tsbuildinfo` is present. It is correctly ignored by `*.tsbuildinfo` in `.gitignore`, but can be cleaned up locally.
- **Untracked files**: `.env.example` and `.eslintrc.json` are untracked and should be added to git.
- **Admin_Screens/**: Exists in the project root as an untracked directory containing ~24MB of images. 

### b. Design Assets
- **Location**: `Admin_Screens/` should be moved to `docs/design/screens/`.
- **Git Impact**: The total size is ~24MB (16 PNGs at ~1.5MB each). This is perfectly fine to track in standard git without LFS, as it's a one-time addition.
- **Changes Needed**: Any references in prompts or markdown files (like `HANDOFF.md`) need to be updated to point to `docs/design/screens/`.

### c. Source Structure
- Currently organized primarily by file type (`src/components/auth`, `src/types`, `src/mocks`, `src/app/api`).
- Next.js route handlers (`src/app/api/*`) are being used to simulate the mock backend.
- `src/features/dashboard` exists but only contains `hooks.ts`.
- The abstractions are not correctly isolated per feature (e.g. `src/lib/validation/auth.ts`, `src/mocks/handlers.ts`, `src/types/dashboard.ts` are outside `src/features/`).

### d. Code Quality (SOLID)
- **S (Single Responsibility)**: The `client.ts` and `handlers.ts` files act as God objects for API calls and mocks.
- **O (Open/Closed)**: UI Components in features are fine, but API/Mock routing requires modifying a central `client.ts` and `handlers.ts` for every new feature.
- **I (Interface Segregation)**: Not strictly violated yet, but could be improved by decoupling feature interfaces.
- **D (Dependency Inversion)**: `client.ts` uses inline `if (USE_MOCK)` and Next.js route handlers (`/api/...`) to serve mock data over the network. We need a proper factory pattern (e.g., `const api = getAuthApi()`) that returns either `HttpAuthApi` or `MockAuthApi`, eliminating the need for `src/app/api/` route handlers.

### e. API Alignment Mismatches
1. **Base Path**: Contract specifies `/api/v1/...`, but `client.ts` uses `/admin/...` (or omits `/api/v1/`).
2. **Login/MFA Flow**: 
   - *Contract*: `POST /api/v1/auth/admin/login` accepts `mfaCode` optionally in the same request.
   - *Current Implementation*: Split into two steps (`/admin/auth/login` and `/admin/auth/mfa/verify`), which diverges from the API contract.
3. **Dashboard Summary**:
   - *Contract (`api_contract.txt`)*: Does NOT specify a dashboard summary endpoint. It only specifies Analytics endpoints (`GET /api/v1/admin/analytics/overview`).
   - *Dev Doc (`dev_doc.txt`)*: Specifies `GET /admin/dashboard/summary`.
   - *Current Implementation*: Uses `GET /admin/dashboard/summary?range=7d`. (This is a conflict between the API contract and Dev Doc).

---

## 2. Target Folder Tree
```text
zordr-event-admin/
├── docs/
│   ├── design/screens/         # Moved from Admin_Screens/
│   ├── dev_doc.pdf             
│   ├── api_contract.pdf        
│   ├── dev_doc.txt             
│   └── api_contract.txt        
├── src/
│   ├── app/                    # Routing only (no api/ routes for mocks anymore)
│   ├── components/
│   │   ├── ui/                 # shadcn primitives
│   │   ├── shared/             # App-wide UI (DataTable, ConfirmDialog, FormField, etc)
│   │   ├── shell/              # AdminShell, Sidebar, Topbar, etc
│   │   └── charts/             # AreaTrend, DualLineTrend
│   ├── config/                 # nav.ts, constants
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api.ts          # AuthApi interface, HttpAuthApi, MockAuthApi, factory
│   │   │   ├── components/     # LoginForm, MfaStep, ZordrLogo
│   │   │   ├── schemas.ts      # Zod validation
│   │   │   ├── types.ts        # Auth-specific types
│   │   │   └── index.ts        
│   │   ├── dashboard/
│   │   │   ├── api.ts          
│   │   │   ├── hooks.ts        
│   │   │   ├── types.ts        
│   │   │   └── index.ts        
│   │   └── (other modules when built)
│   ├── hooks/                  # Global hooks (usePermission, useDebounce, etc)
│   ├── lib/
│   │   ├── api/client.ts       # Core apiFetch utility only
│   │   ├── format.ts
│   │   ├── permissions.ts
│   │   └── utils.ts
│   ├── providers/              
│   └── types/                  # Cross-feature types (AdminUser, Module, Action, Permission)
```

## 3. Move/Rename Map
- `Zordr_API_Contract_v2.pdf` -> `docs/api_contract.pdf`
- `Zordr_Admin_Portal_Event_Module_Dev_Doc.pdf` -> `docs/dev_doc.pdf`
- `api_contract.txt` -> `docs/api_contract.txt`
- `dev_doc.txt` -> `docs/dev_doc.txt`
- `Admin_Screens/` -> `docs/design/screens/`
- `src/components/auth/` -> `src/features/auth/components/`
- `src/lib/validation/auth.ts` -> `src/features/auth/schemas.ts`
- `src/types/dashboard.ts` -> `src/features/dashboard/types.ts`
- `src/mocks/handlers.ts` -> Split into `src/features/auth/api.ts` (MockAuthApi) and `src/features/dashboard/api.ts` (MockDashboardApi).
- `src/app/api/admin/` -> **DELETED** (Mocks will be in-memory via the API interface, not network route handlers).

## 4. Refactor List (Ordered by Dependency)

### Step 1: Repo Hygiene & Documentation Move
- **Action**: Move loose docs and `Admin_Screens/` to `docs/`. Add untracked files to git. NOPE. gitignore this /docs folder.
- **Rationale**: Clean up root directory and track design assets.
- **Risk**: Low.

### Step 2: Feature Initialization (Auth & Dashboard)
- **Action**: Create `src/features/auth` and move auth components and schemas. Create `src/features/dashboard/types.ts` and move dashboard types.
- **Rationale**: Feature-based organization.
- **Risk**: Low (imports will need updating).

### Step 3: Dependency Inversion for API Layer
- **Action**: 
  - Delete `src/app/api/admin/*` route handlers.
  - Create `AuthApi` and `DashboardApi` interfaces.
  - Implement `HttpAuthApi` and `MockAuthApi` in `src/features/auth/api.ts`.
  - Implement `HttpDashboardApi` and `MockDashboardApi` in `src/features/dashboard/api.ts`.
  - Create a factory in each feature (`export const getAuthApi = () => ...`).
- **Rationale**: Fulfills SOLID (D) requirement. Removes `if (USE_MOCK)` from components/clients.
- **Risk**: Medium. Requires changing how hooks fetch data.

### Step 4: API Alignment Updates
- **Action**: Update `HttpAuthApi` to match the API contract (`POST /api/v1/auth/admin/login` with optional `mfaCode`). Update `client.ts` to prepend `/api/v1`.
- **Rationale**: Align exactly with `api_contract.txt`.
- **Risk**: Low.

### Step 5: Enforce Dependency Rules
- **Action**: Add `eslint-plugin-boundaries` to `.eslintrc.json` to enforce `app -> features -> components/shared -> components/ui -> lib` and prevent cross-feature imports.
- **Rationale**: Enforces architectural boundaries programmatically.
- **Risk**: Low.

## 5. Shared Abstractions

### To Introduce Now:
- `FormField`: A shared wrapper for RHF+Zod to reduce boilerplate in forms (like LoginForm).
- API Factory Pattern: `getApi()` per feature.
- Enforced Boundaries: via ESLint.

### Deliberately NOT Introduced Yet:
- `DataTable` / `FilterBar`: Wait until we actually build the Organizers/Events lists. The Dashboard uses a custom `Recent Activity` table, which might not be complex enough to warrant full TanStack Table extraction just yet.
- `ConfirmDialog`: Wait until we need it for Suspend/Reject actions.

## 6. Verification Steps
After each step, run:
1. `npm run lint` (or `npx eslint .`)
2. `npx tsc --noEmit`
3. `npm run build`
4. `npm run test` (or `npx vitest run`)

## 7. Open Questions
1. **API Discrepancy**: The API Contract (`api_contract.txt`) does not specify a Dashboard Summary endpoint, but the Dev Doc does (`/admin/dashboard/summary`). I plan to retain the `GET /api/v1/admin/dashboard/summary` endpoint to match the Dev Doc and the current UI needs. Is this acceptable?
2. **MFA Flow**: The API Contract combines Login and MFA into a single endpoint (`POST /api/v1/auth/admin/login` with `mfaCode`). Should we update the UI `MfaStep.tsx` to re-submit the password along with the MFA code, or should we just hold the password in state between steps?
3. **Admin_Screens Tracking**: Since it's ~24MB, tracking it in standard Git is fine. Does this work for you, or do you strictly want Git LFS?
