# Zordr Admin Portal

Internal back-office web application for the Zordr events marketplace. Used by Zordr staff to manage organizers, events, orders, settlements, refunds, support, analytics, and internal employee access.

This is the frontend only. It talks to a separate backend API and does not contain any server-side business logic beyond route handlers used for mocking during development.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS with CSS custom properties |
| Component primitives | Radix UI via shadcn patterns |
| Forms | React Hook Form + Zod |
| Server state | TanStack Query v5 |
| Icons | lucide-react |
| Testing | Vitest + Testing Library |
| Mock API | Next.js Route Handlers |

---

## Prerequisites

- Node.js 18 or later
- npm 9 or later

---

## Getting Started

Copy the example environment file and fill in values:

```bash
cp .env.example .env.local
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000. The root redirects to `/login`.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the real backend API | `https://api.zordr.com/api/v1` |
| `NEXT_PUBLIC_USE_MOCK_API` | Set to `true` to use built-in mock route handlers instead of the real backend | `true` |

When `NEXT_PUBLIC_USE_MOCK_API=true`, all API calls are routed to Next.js route handlers under `/api/admin/*`. No external server is needed.

**Simulating edge cases for Dashboard:**
You can simulate loading, error, and empty states for the dashboard by adding a `simulate` query parameter to the mock endpoint `/api/admin/dashboard/summary`:
- `?simulate=slow`: Adds a 2-second delay to the response.
- `?simulate=error`: Returns a 500 error response.
- `?simulate=empty`: Returns a payload with empty arrays.

---

## Mock Credentials

These only work when `NEXT_PUBLIC_USE_MOCK_API=true`.

| Email | Password | Outcome |
|---|---|---|
| admin@zordr.com | Test@1234 | Login succeeds, redirect to /dashboard |
| mfa@zordr.com | Test@1234 | MFA step appears, valid code is `123456` |
| locked@zordr.com | Test@1234 | 423 response, account locked for 30 seconds |
| any other email | any password | 401 invalid credentials |

### Role-Based Access Control (RBAC) Mocks

You can switch the mock user role by setting the `zordr_dev_role` cookie in your browser's dev tools or modifying the fallback in `src/mocks/handlers.ts`. 

Available roles:
- `super_admin`: Full access to everything.
- `finance_exec`: View access to analytics, full access to settlements and refunds.
- `support_exec`: View access to orders, customers, and dashboard. Full view/create/edit for support.
- `marketing_exec`: View access to dashboard, events, customers, and analytics.

---

## Scripts

```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Production build
npm run start      # Start production server (requires build first)
npm run lint       # Run ESLint
npm test           # Run all tests once
npm run test:watch # Run tests in watch mode
```

---

## Project Structure

```
src/
  app/
    (auth)/
      login/
        page.tsx         Login page (two-panel layout)
      layout.tsx         Auth group layout (no chrome)
    (admin)/
      layout.tsx         Admin group layout (shell with Sidebar & Topbar)
      dashboard/
        page.tsx         Dashboard page
      organizers/
        page.tsx         Organizers placeholder
      events/
        page.tsx         Events placeholder
      orders/
        page.tsx         Orders placeholder
      customers/
        page.tsx         Customers placeholder
      settlements/
        page.tsx         Settlements placeholder
      refunds/
        page.tsx         Refunds placeholder
      support/
        page.tsx         Support placeholder
      analytics/
        page.tsx         Analytics placeholder
      employees/
        page.tsx         Employees placeholder
      roles/
        page.tsx         Roles placeholder
      settings/
        page.tsx         Settings placeholder
    api/
      admin/
        auth/
          login/route.ts         Mock: POST /api/admin/auth/login
          mfa/verify/route.ts    Mock: POST /api/admin/auth/mfa/verify
          me/route.ts            Mock: GET /api/admin/auth/me
          logout/route.ts        Mock: POST /api/admin/auth/logout
        dashboard/
          summary/route.ts       Mock: GET /api/admin/dashboard/summary
    globals.css          Tailwind base, design tokens as CSS custom properties
    layout.tsx           Root layout: Inter font, QueryProvider
    page.tsx             Redirects / to /login

  components/
    auth/
      LoginForm.tsx      Login form with all error states and MFA transition
      MfaStep.tsx        TOTP 6-digit verification step
      ZordrLogo.tsx      Zordr wordmark component
    charts/
      AreaTrend.tsx      Reusable Recharts area chart
      DualLineTrend.tsx  Reusable Recharts dual-line chart
    shell/
      AdminShell.tsx
      Sidebar.tsx
      ...
    ui/
      ...

  features/
    dashboard/
      hooks.ts           TanStack Query hooks (e.g. useDashboardSummary)
      button.tsx         Button primitive (CVA variants)
      input.tsx          Input primitive
      label.tsx          Label primitive (Radix)

  lib/
    api/
      client.ts          Typed fetch wrapper, ZordrApiError, auth endpoints
    validation/
      auth.ts            Zod schemas for login and MFA forms
    utils.ts             cn() helper (clsx + tailwind-merge)

  middleware.ts          Route guard: redirects unauthenticated users to /login,
                         authenticated users away from /login to /dashboard

  mocks/
    handlers.ts          Mock scenario logic shared by route handlers

  providers/
    QueryProvider.tsx    TanStack QueryClient provider

  __tests__/
    LoginForm.test.tsx   10 tests covering validation, success, 401, 423, MFA, a11y
    setup.ts             Testing Library jest-dom matchers
```

---

## Authentication Model

The backend sets an httpOnly cookie named `zordr_admin_session` on successful login. The frontend never reads or writes this cookie directly. Session presence is checked server-side in `src/middleware.ts` to enforce route access.

Password is never logged, stored in state, or placed in a URL parameter.

---

## Design Tokens

Tokens are defined as CSS custom properties in `src/app/globals.css` and referenced in `tailwind.config.js`. All colors use HSL values.

| Token | HSL | Hex equivalent |
|---|---|---|
| Brand green | 145 73% 44% | #1DBF63 |
| Brand hover | 145 73% 38% | #199F52 |
| Brand light (tint) | 145 60% 96% | #EBF8F1 |
| Dark navy | 213 58% 11% | #0D1B2A |
| Page background | 150 30% 97% | #F7FBF8 |
| Muted foreground | 220 9% 46% | #6B7280 |
| Input background | 220 14% 96% | #F3F4F6 |
| Border | 220 13% 91% | #E5E7EB |
| Destructive | 0 84% 60% | #EF4444 |

Font: Inter (Google Fonts, loaded via next/font).
Border radius base: 8px. Card: 12px (rounded-xl). Button: 8px (rounded-lg).

---

## Connecting the Real Backend

1. Set `NEXT_PUBLIC_USE_MOCK_API=false` in `.env.local`.
2. Set `NEXT_PUBLIC_API_URL` to the backend base URL, e.g. `https://api.zordr.com/api/v1`.
3. The backend must:
   - Accept `POST /admin/auth/login` with `{ email, password }` in the request body.
   - Return `{ mfaRequired: false, user: {...} }` on success with an httpOnly `zordr_admin_session` cookie.
   - Return `{ mfaRequired: true, challengeId: string }` to trigger MFA.
   - Return `{ code, message }` with status 401, 423, or 429 on failure.
   - Accept `POST /admin/auth/mfa/verify` with `{ challengeId, code }`.

---

## Running Tests

```bash
npm test
```

Output should show 10 passing tests across:
- Validation (email required, email format, password required, password min-length)
- Success flow (redirect to /dashboard)
- 401 error (generic message, no field reveal)
- 423 locked (banner shown, form disabled)
- Network error (status 0)
- MFA flow (MFA step renders on mfaRequired response)
- Accessibility (show/hide toggle aria-pressed state)