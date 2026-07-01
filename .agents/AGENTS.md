# AGENTS.md — Quantix Platform Admin

> Single source of truth for AI coding agents (Claude Code, Cursor, GitHub Copilot, Windsurf, ChatGPT, etc.) and human engineers working on **Quantix Platform Admin** — an Enterprise SaaS Multi-Tenant Admin Portal.
>
> Every line of generated or hand-written code in this repository MUST comply with this document. If a request conflicts with this document, this document wins unless a human explicitly overrides it in writing.

---

## 0. Tech Stack (Authoritative)

### 0.1 Approved Stack

| Concern | Library |
|---|---|
| UI Library | React 19 |
| Language | TypeScript (strict) |
| Build Tool | Vite |
| Global State / Server Cache | Redux Toolkit + RTK Query |
| HTTP Client (underlying RTK Query baseQuery) | Axios |
| Forms | Formik |
| Validation | Yup |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| Toasts | Sonner |
| Icons | Lucide React, React Icons |
| Tables | TanStack Table (wrapped by `ATMTable`) |
| Class merging | clsx + tailwind-merge |
| Dates | date-fns |
| Charts | Recharts (wrapped by chart components in `modules/dashboard/components/charts`) |
| CSV/Excel Export | SheetJS (`xlsx`) |
| PDF Export | `@react-pdf/renderer` (only for report/export generation, never for the `pdf` skill's document workflows) |
| HTML Sanitization | DOMPurify |
| Real-time updates | Native `WebSocket` wrapped by a single `socketClient.ts` singleton (see §9.5); polling via RTK Query `pollingInterval` is the fallback where a socket channel doesn't exist yet |
| Headless primitives | Headless UI (only when no ATM equivalent exists) |
| Unit/Component Testing | Vitest + React Testing Library |
| E2E Testing | Playwright |
| API Mocking (tests) | MSW |

### 0.2 Banned Libraries

These MUST NEVER appear in `package.json`, imports, or generated code:

- ❌ React Hook Form — use **Formik**
- ❌ Zod — use **Yup**
- ❌ Zustand — use **Redux Toolkit**
- ❌ TanStack Query (React Query) — use **RTK Query**
- ❌ Styled Components / Emotion / CSS Modules — use **Tailwind CSS**
- ❌ `axios` called directly inside components/hooks/services outside the single Axios instance + RTK Query `baseQuery`
- ❌ `alert()` / `confirm()` / `window.prompt()` — use **Sonner** + **ATMModal**
- ❌ `any` type (except in explicitly justified, commented edge cases reviewed by a lead)
- ❌ Raw MUI components or raw HTML `<input>`, `<select>`, `<button>` — use **ATM components**
- ❌ `dangerouslySetInnerHTML` with unsanitized input — see §9.6 (Sanitization Rule)
- ❌ Moment.js — use **date-fns**
- ❌ Any charting library other than Recharts (e.g. Chart.js, Nivo, Victory) without explicit human approval
- ❌ Cypress — use **Playwright** for E2E

If an AI agent is asked to use a banned library, it must refuse and propose the approved alternative.

---

## 1. Architecture Philosophy

Quantix follows:

- **Feature-First Architecture** — code is grouped by business feature, not by technical type.
- **Clean Architecture** — UI, business logic, and data access are layered and decoupled.
- **SOLID** — especially Single Responsibility and Dependency Inversion (components depend on hooks/services, not vice versa).
- **DRY** — no duplicated form fields, no duplicated fetch logic, no duplicated validation schemas.
- **KISS** — the simplest implementation that satisfies the requirement and the architecture wins.
- **Container–Presenter Pattern** — "Wrapper" (container) owns logic; "Form/View" (presenter) owns markup only.
- **Reusable Component Pattern** — every visual primitive is built once as an `ATM*` component and reused everywhere.

### 1.1 Layering Rule

```
Page  →  Wrapper (Container)  →  Form/View (Presenter)  →  ATM Components
```

Data flows down as props. Events flow up as callbacks. No layer skips another layer.

---

## 2. Root Folder Structure

```
src/
├── app/                      # App bootstrap: providers, root component, error boundaries
├── assets/                   # Images, fonts, static SVGs, lottie files
├── config/                   # Environment config, feature flags, app-wide constants
├── constants/                # Global constants (route paths, regex, enums shared app-wide)
├── hooks/                    # Global reusable hooks (not feature-specific)
├── layouts/                  # AppLayout, AuthLayout, DashboardLayout, BlankLayout
├── modules/                  # Feature-first modules (see §3)
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── permissions/
│   ├── clients/
│   ├── merchants/
│   ├── billing/
│   ├── settlement/
│   ├── compliance/
│   ├── helpdesk/
│   ├── notifications/
│   ├── reports/
│   ├── auditLogs/
│   ├── dashboard/
│   └── settings/
├── router/                   # Route definitions, route guards wiring, lazy imports
├── services/                 # Cross-module API setup: axios instance, base RTK Query api, socket client
├── shared/                   # Cross-feature reusable building blocks (see §6)
├── store/                    # Redux store config, root reducer, middleware
├── theme/                    # Tailwind theme tokens, design tokens, dark mode config
├── types/                    # Global TypeScript types/interfaces shared across modules
├── utils/                    # Pure utility functions (formatter, storage, jwt, sanitize, etc.)
├── main.tsx
└── vite-env.d.ts
```

### 2.1 Responsibility of Each Folder

- **app/** — Composes all global providers (Redux `Provider`, `ErrorBoundary`, `Toaster`, `ThemeProvider`, Router) into a single `<App />`. Nothing business-specific lives here.
- **assets/** — Static, non-code files only. No logic.
- **config/** — Reads `import.meta.env`, exposes typed config object (`API_BASE_URL`, `WS_BASE_URL`, `APP_ENV`, feature flags). Single point of environment access — never call `import.meta.env` directly elsewhere.
- **constants/** — App-wide constants that are not tied to one feature (e.g. `ROUTE_PATHS`, `REGEX_PATTERNS`, `DATE_FORMATS`, `HTTP_STATUS`).
- **hooks/** — Hooks reused by 2+ modules (`useDebounce`, `usePagination`, `useTable`, `useMediaQuery`, `useIdleTimer`). Feature-specific hooks stay inside the module.
- **layouts/** — Page shells (sidebar, header, footer) consumed by the router. Layouts render `<Outlet />`; they never fetch business data themselves beyond layout-level needs (user profile, notifications count).
- **modules/** — See §3.
- **router/** — `AppRouter.tsx`, `routes.config.ts`, route guard wiring (`ProtectedRoute`, `PublicRoute`, `PermissionRoute`). All lazy-loaded route components are declared here.
- **services/** — `axiosInstance.ts` (the one and only Axios instance), `baseApi.ts` (the root RTK Query `createApi` with `tagTypes`, injected into by every module's service file), and `socketClient.ts` (the one and only WebSocket client — see §9.5).
- **shared/** — See §6. The design system and cross-cutting UI/logic.
- **store/** — `store.ts` (configureStore), `rootReducer.ts`, persisted slices config.
- **theme/** — Tailwind config extensions, color tokens, spacing tokens, typography scale, dark/light theme variables.
- **types/** — Global types only (`ApiResponse<T>`, `PaginatedResponse<T>`, `User`, `Permission` if truly global). Module-specific types stay in the module.
- **utils/** — Pure, side-effect-light functions: `storage.ts`, `jwt.ts`, `dateFormatter.ts`, `errorParser.ts`, `permissionUtils.ts`, `numberFormatter.ts`, `sanitize.ts`.

---

## 3. Feature Module Rules

Every module under `src/modules/<feature>/` is **self-contained** and exposes a clean public API via `index.ts`.

### 3.1 Standard Module Structure

```
modules/users/
├── components/        # Presentational components used ONLY within this module
├── constants/          # Module-specific constants (e.g., USER_STATUS_OPTIONS)
├── hooks/              # Module-specific hooks (e.g., useUserPermissions)
├── pages/              # Route-level page components (thin)
├── services/           # RTK Query injected endpoints (userApi.ts)
├── types/              # Module-specific TS types/interfaces/DTOs
├── utils/              # Module-specific pure helpers
└── index.ts             # Barrel export — the ONLY way other modules import from this one
```

### 3.2 Cross-Module Import Rule

- A module MUST NOT import another module's internal files directly (e.g. `modules/billing/components/Foo` from `modules/users`).
- A module MAY only import from another module's `index.ts` barrel, and only what that barrel explicitly exports.
- Shared logic used by 2+ modules must be promoted to `shared/` or `hooks/`, not duplicated.
- Circular module dependencies are forbidden. If module A needs module B and B needs A, extract the shared piece into `shared/`.

### 3.3 Example Modules and Their Domain

| Module | Responsibility |
|---|---|
| `auth` | Login, MFA, password lifecycle, session, token management |
| `users` | Platform user CRUD, user-role assignment |
| `roles` | Role CRUD, role-permission mapping |
| `permissions` | Permission catalogue, permission groups |
| `clients` | Tenant/client onboarding and management |
| `merchants` | Merchant lifecycle, KYC, onboarding workflows |
| `billing` | Invoices, plans, subscriptions |
| `settlement` | Settlement cycles, payouts, reconciliation |
| `compliance` | KYC/AML checks, document verification |
| `helpdesk` | Support tickets, SLA tracking |
| `notifications` | In-app + email/SMS notification center (real-time via socket, see §9.5) |
| `reports` | Report generation, exports, scheduled reports |
| `auditLogs` | Immutable activity/audit trail viewer |
| `dashboard` | Aggregated widgets, KPIs, charts |
| `settings` | Org-level and account-level configuration |
| `navigation` | Sidebar menu config, permission-filtered nav tree (see §3.4) |

### 3.4 Sidebar / Navigation Configuration Schema

The sidebar is **data-driven**, never hardcoded JSX per item. A single typed config array lives at `modules/navigation/constants/sidebar.config.ts`:

```ts
// modules/navigation/types/navigation.types.ts
export interface SidebarNavItem {
  id: string;                     // stable unique key, e.g. "merchants"
  label: string;
  icon: IconName;                 // key into shared/icons barrel
  path?: string;                  // omit if this item only expands children
  permission?: string;            // gate key, e.g. "merchants.view" — omit if always visible
  children?: SidebarNavItem[];    // nested accordion items
  badgeCountSelector?: (state: RootState) => number; // optional live count (e.g. open tickets)
}

// modules/navigation/constants/sidebar.config.ts
export const SIDEBAR_CONFIG: SidebarNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: ROUTE_PATHS.DASHBOARD },
  {
    id: "merchants",
    label: "Merchants",
    icon: "Store",
    permission: "merchants.view",
    children: [
      { id: "merchants.list", label: "All Merchants", path: ROUTE_PATHS.MERCHANTS, permission: "merchants.view" },
      { id: "merchants.onboarding", label: "Onboarding", path: ROUTE_PATHS.MERCHANT_ONBOARDING, permission: "merchants.create" },
    ],
  },
  // ...
];
```

- `usePermission()` filters the tree recursively at render time inside `shared/components/layout/Sidebar` — a parent with zero visible children after filtering is hidden entirely, never shown as a dead-end expandable.
- The config is the **single source of truth**; adding a nav item never requires touching the Sidebar component itself, only `sidebar.config.ts`.
- Collapsed/expanded accordion state is local `useState` in the Sidebar component (or `uiSlice` if it must persist across sessions per §32.1), never re-derived from the route on every render.

---

## 4. Authentication Module (Special — Not CRUD)

All authentication logic lives **exclusively** inside `src/modules/auth/`. No other module, layout, or shared file may contain auth business logic, token logic, or storage logic.

### 4.1 Auth Module Folder Structure

```
modules/auth/
├── components/
│   ├── AuthLayout/
│   ├── OTPInputGroup/
│   ├── PasswordStrengthMeter/
│   └── IdleTimeoutModal/          # "You'll be logged out in 60s" warning
├── pages/
│   ├── Login/
│   │   ├── LoginWrapper.tsx       # Formik + Yup + RTK Query + navigation + toast
│   │   └── LoginForm.tsx          # pure presentational form
│   ├── MFA/
│   │   ├── MFAWrapper.tsx
│   │   └── MFAForm.tsx
│   ├── ForgotPassword/
│   ├── VerifyOTP/
│   ├── ResetPassword/
│   ├── ChangePassword/
│   ├── SessionExpired/
│   ├── Unauthorized/
│   └── Forbidden/
├── routes/
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useSession.ts
│   ├── useTokenRefresh.ts
│   └── useIdleTimer.ts             # tracks user inactivity, triggers IdleTimeoutModal
├── services/
│   └── authApi.ts                  # RTK Query injected endpoints
├── types/
│   └── auth.types.ts
├── constants/
│   └── auth.constants.ts
├── utils/
│   ├── tokenStorage.ts
│   └── sessionUtils.ts
├── interceptors/
│   └── authInterceptor.ts          # attaches token, handles 401 refresh flow
└── index.ts
```

### 4.2 Responsibility Breakdown

- **pages/** — One folder per auth screen: Login, MFA, Forgot Password, Verify OTP, Reset Password, Change Password, Session Expired, Unauthorized, Forbidden.
- **components/IdleTimeoutModal/** — Presentational countdown modal, driven entirely by props from `useIdleTimer`. Never fetches data or owns timers itself.
- **routes/ProtectedRoute.tsx** — Redirects to `/login` if no valid session; renders children/`<Outlet />` otherwise.
- **routes/PublicRoute.tsx** — Redirects authenticated users away from auth pages (e.g. logged-in user hitting `/login` → redirect to dashboard).
- **hooks/useAuth.ts** — Exposes `user`, `isAuthenticated`, `login`, `logout`, `hasPermission`.
- **hooks/useTokenRefresh.ts** — Encapsulates silent refresh-token logic, exposed for the Axios interceptor and for manual triggers.
- **hooks/useIdleTimer.ts** — Listens for user activity (mouse/keyboard/touch), starts a countdown after N minutes of inactivity (configurable via `config/`), exposes `isWarning`, `secondsRemaining`, `resetTimer`, `forceLogout`. Drives `IdleTimeoutModal`. On expiry, calls `logout()` and redirects to `/session-expired`.
- **services/authApi.ts** — All auth-related RTK Query endpoints (`login`, `verifyOtp`, `forgotPassword`, `resetPassword`, `changePassword`, `refreshToken`, `logout`).
- **utils/tokenStorage.ts** — Single source of truth for reading/writing access & refresh tokens (memory + secure storage strategy). No other file reads/writes tokens directly.
- **interceptors/authInterceptor.ts** — Registered once on the Axios instance in `services/axiosInstance.ts`; attaches `Authorization` header; on `401`, attempts silent refresh once, then force-logs-out on failure.

### 4.3 Auth Screen Layering (mandatory)

```
Page → Wrapper → Form → ATM Components
```

**Page responsibilities:**
- Renders the Wrapper. Nothing else. No hooks beyond `useDocumentTitle`-style cosmetic hooks if used.

**Wrapper responsibilities:**
- Formik setup (`initialValues`, `onSubmit`)
- Yup validation schema (or imports a shared schema)
- RTK Query mutation/query calls
- Sonner toast triggers (success/error)
- Navigation (`useNavigate`) after success
- Loading & error state derivation
- Token handling (delegates to `tokenStorage` / `useAuth`)
- "Remember Me" persistence logic
- All business rules (e.g., lockout after N attempts, redirect-back-to URL)

**Form responsibilities:**
- Pure UI rendering of fields using ATM components
- Receives `values`, `errors`, `touched`, `handleChange`, `handleBlur`, `handleSubmit`, `isSubmitting` as **props** from the Wrapper
- MUST NOT import Formik, Yup, RTK Query, or `useNavigate` directly
- MUST NOT call APIs
- MUST NOT contain business logic or validation rules

This separation guarantees Forms are 100% reusable/testable in isolation (e.g., in Storybook or unit tests) with mock props.

### 4.4 Never Bypass Auth Module Boundaries

Components outside `modules/auth` must **never** read authentication state directly via raw `useSelector` on the auth slice, and must **never** invoke the `logout` action directly. All auth state/actions are consumed exclusively through `useAuth()` (re-exported from `modules/auth`'s barrel). This keeps token/session logic single-sourced and prevents the dual-state drift (Redux vs. any other store) seen in past audits.

---

## 5. CRUD Module Rules

### 5.1 Standard CRUD Module

For simple entities (e.g., `roles`, `permissions`):

```
modules/roles/
├── components/
│   └── RoleStatusBadge.tsx
├── pages/
│   ├── List/
│   │   ├── RoleList.tsx
│   │   └── RoleListWrapper.tsx
│   ├── Add/
│   │   ├── AddRoleWrapper.tsx       
│   ├── Form/
│   │   ├── RoleForm.tsx
│   ├── Edit/
│   │   └── EditRoleWrapper.tsx
│   └── View/
│       ├── ViewRole.tsx
│       └── ViewRoleWrapper.tsx
├── services/
│   └── roleApi.ts
├── types/
│   └── role.types.ts
├── constants/
│   └── role.constants.ts
└── index.ts
```

- **List** — `RoleListWrapper` owns `useGetRolesQuery`, pagination state, filters, and renders `ATMTable` with column defs + a presentational table view.
- **Add/Edit** — Share a single `RoleForm.tsx` presenter; each has its own Wrapper handling `useCreateRoleMutation` / `useUpdateRoleMutation`, initial values (Edit pre-fills via `useGetRoleByIdQuery`), and navigation back to List on success.
- **View** — Read-only detail Wrapper, typically just a query + `ATMDetailGrid` presentational layout (no Formik needed unless inline-editing).

### 5.2 Complex CRUD Module

For entities with nested flows (e.g., `merchants` with multi-step onboarding):

```
modules/merchants/
├── components/
├── pages/
│   ├── List/
│   ├── Onboarding/
│   │   ├── steps/
│   │   │   ├── BusinessDetailsStep/
│   │   │   ├── KYCDocumentsStep/       # uses ATMFileUpload (see §7)
│   │   │   ├── BankDetailsStep/
│   │   │   └── ReviewStep/
│   │   ├── OnboardingPage.tsx
│   │   ├── OnboardingWrapper.tsx     # owns step state machine + Formik per step
│   │   └── OnboardingStepper.tsx     # presentational
│   ├── Detail/
│   │   ├── tabs/
│   │   │   ├── OverviewTab/
│   │   │   ├── DocumentsTab/
│   │   │   ├── TransactionsTab/
│   │   │   └── SettlementTab/
│   │   ├── MerchantDetailPage.tsx
│   │   └── MerchantDetailWrapper.tsx  # renders tabs via ATMTabbedLayout (see §7)
│   └── Edit/
├── services/
│   ├── merchantApi.ts
│   └── merchantOnboardingApi.ts
├── types/
│   ├── merchant.types.ts
│   └── merchantOnboarding.types.ts
├── constants/
├── utils/
└── index.ts
```

- Nested pages (tabs, steps) live under their parent page folder, never flattened into the module root.
- Each sub-module (e.g., `Onboarding`) may have its own `services`/`types` co-located if highly specific, otherwise shares the module-level `services/`.
- Detail pages with tabs: each tab is its own Wrapper + presenter pair, lazy-loaded if heavy, and the tab shell itself is built from the shared `ATMTabbedLayout` component (§7) — never a bespoke tab implementation per module.

---

## 6. Shared Folder Architecture

```
shared/
├── components/
│   ├── ui/              # ATM* design-system primitives (buttons, inputs, badges...)
│   ├── layout/           # PageHeader, Breadcrumbs, Sidebar, EmptyLayout pieces
│   ├── tables/           # ATMTable, column helpers, table toolbar, pagination controls
│   ├── forms/             # Generic Formik field wrappers (ATMInputField etc.), FormWrapper
│   ├── modals/            # ATMModal, ATMConfirmDialog, DrawerModal
│   └── skeletons/         # ATMTableSkeleton, ATMCardSkeleton, ATMPageSkeleton
├── hooks/                 # useDebounce, usePagination, useClickOutside, usePermission, useBulkAction
├── utils/                 # cn() (clsx+twMerge), arrayHelpers, objectHelpers, sanitize.ts
├── constants/              # shared regex, shared option lists, shared enums
├── types/                  # ApiResponse<T>, PaginatedResponse<T>, SelectOption
├── icons/                   # Centralized icon re-exports (wrap Lucide/React Icons)
├── providers/                # ThemeProvider, ToasterProvider, QueryDevtoolsProvider
└── guards/                    # PermissionGuard, RoleGuard, FeatureFlagGuard
```

### 6.1 Folder Responsibilities

- **components/ui/** — The design system. Every `ATM*` component lives here with its own subfolder containing `Component.tsx`, `Component.types.ts`, and `Component.test.tsx`.
- **components/layout/** — Structural, cross-page UI not tied to one feature (e.g. `PageHeader`, `Breadcrumbs`, `Sidebar` driven by `SIDEBAR_CONFIG` from §3.4).
- **components/tables/** — `ATMTable` wraps TanStack Table; exposes a typed `columns` API; handles sorting/pagination/selection UI chrome generically.
- **components/forms/** — Formik-aware field wrappers that bridge Formik's `useField`/`FieldProps` to ATM UI primitives (e.g. `ATMInputField` = `ATMInput` + Formik error/touched wiring).
- **components/modals/** — `ATMModal` (base), `ATMConfirmDialog` (built on ATMModal for destructive actions), `DrawerModal` (slide-in panel variant).
- **components/skeletons/** — Loading placeholders matching the shape of real content, used during RTK Query `isLoading`.
- **hooks/** — Cross-feature hooks not auth/table specific in nature but reused broadly, including `useBulkAction` (§23.1).
- **utils/** — Pure helper functions with zero React dependency, usable in services or components alike, including `sanitize.ts` (§9.6).
- **icons/** — A single `Icons.ts` barrel re-exporting curated icon names from Lucide/React Icons, so icon usage stays consistent and tree-shakeable.
- **providers/** — App-wide context providers composed in `app/AppProviders.tsx`.
- **guards/** — Declarative permission/role/feature-flag gating components, e.g. `<PermissionGuard permission="users.create"><ATMButton/></PermissionGuard>`.

---

## 7. Reusable ATM Component Catalogue

All UI MUST be built from `ATM*` components. Raw HTML inputs/buttons or raw MUI components are forbidden in feature code.

| Component | Purpose |
|---|---|
| `ATMInputField` | Text input bound to Formik |
| `ATMPasswordField` | Password input with show/hide toggle |
| `ATMSelectField` | Single-select dropdown bound to Formik |
| `ATMTextAreaField` | Multiline text input bound to Formik |
| `ATMPhoneInputField` | Phone number input with country code |
| `ATMCheckbox` | Single checkbox, Formik-aware |
| `ATMRadioGroup` | Radio button group, Formik-aware |
| `ATMSwitch` | Toggle switch, Formik-aware |
| `ATMMultiSelect` | Multi-select with chips/tags |
| `ATMFileUpload` | Drag-and-drop / click-to-browse file upload, Formik-aware, supports progress + preview |
| `ATMButton` | Primary button with variants & loading state |
| `ATMIconButton` | Icon-only button |
| `ATMTable` | TanStack Table wrapper with pagination/sorting/selection |
| `ATMPageHeader` | Page title, breadcrumb, action slot |
| `ATMCard` | Generic content card container |
| `ATMModal` | Base modal/dialog |
| `ATMConfirmDialog` | Destructive-action confirmation, built on `ATMModal` |
| `ATMFormGrid` | Responsive grid layout wrapper for form fields (auto column-span rules across breakpoints), used inside every multi-field Form presenter |
| `ATMTabbedLayout` | Standard tab shell for Detail pages with tabs (§5.2); handles active-tab state, keyboard nav, lazy tab content, and URL sync |
| `ATMDetailGrid` | Standard read-only key/value detail layout for View pages (§5.1); renders label/value pairs in a responsive grid with consistent typography |
| `ATMBadge` | Status/label pill |
| `ATMTooltip` | Hover tooltip |
| `ATMLoader` | Spinner |
| `ATMEmptyState` | "No content yet" illustration + CTA |
| `ATMNoData` | "No data found" for tables/lists |
| `ATMOTPInput` | OTP digit input group |

### 7.1 Design System Rules

1. Every `ATM*` component accepts a `className` prop merged via `cn()` (`clsx` + `tailwind-merge`) — never overridden, always merged.
2. Every `ATM*` component is fully typed; no `any` props.
3. Field-level ATM components (`ATMInputField`, `ATMSelectField`, `ATMFileUpload`, etc.) internally use Formik's `useField` and automatically render error/touched state — Wrappers never manually wire `error={errors.x && touched.x}` per field.
4. New visual patterns repeated 2+ times MUST be extracted into a new `ATM*` component before reuse, not copy-pasted.
5. ATM components must support `disabled`, `loading` (where relevant), and forward `ref` where DOM access is needed.
6. ATM components live under `shared/components/ui/<ComponentName>/` with co-located types and tests.
7. `ATMFileUpload` enforces file-size and MIME-type limits passed in as props (sourced from `constants/` per §32.5) and never silently accepts an out-of-policy file — it surfaces a Formik field error instead.

---

## 8. RTK Query Standards

### 8.1 Base API Slice

`src/services/baseApi.ts`:

```ts
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({ axiosInstance }),
  tagTypes: [
    "User", "Role", "Permission", "Client", "Merchant",
    "Billing", "Settlement", "Compliance", "Ticket",
    "Notification", "Report", "AuditLog", "Auth",
  ],
  endpoints: () => ({}),
});
```

- Only **one** `createApi` root instance exists app-wide.
- Every module injects endpoints into this root via `injectEndpoints`, never creates a new `createApi`.
- `baseQuery` is a custom `axiosBaseQuery` adapter so the existing Axios instance (with interceptors) is reused, rather than RTK Query's default `fetchBaseQuery`.

### 8.2 Tag Types & Invalidation

- Every entity has a corresponding tag type (`"User"`, `"Role"`, etc.).
- `LIST` tags pattern for collections: `{ type: "User", id: "LIST" }`.
- Item tags pattern: `{ type: "User", id }`.
- `providesTags`: queries provide both the `LIST` tag and per-item tags.
- `invalidatesTags`: mutations invalidate the `LIST` tag (and the specific item tag on update/delete).

### 8.3 Module Service Example

`modules/users/services/userApi.ts`:

```ts
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<User>, GetUsersParams>({
      query: (params) => ({ url: "/users", method: "GET", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => ({ url: `/users/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation<User, CreateUserDTO>({
      query: (body) => ({ url: "/users", method: "POST", data: body }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUser: builder.mutation<User, { id: string; body: UpdateUserDTO }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: "PUT", data: body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "User", id }, { type: "User", id: "LIST" }],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "User", id }, { type: "User", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
```

### 8.4 Optimistic Updates

Used for high-frequency, low-risk mutations (e.g., toggling a status switch):

```ts
toggleUserStatus: builder.mutation<void, { id: string; isActive: boolean }>({
  query: ({ id, isActive }) => ({ url: `/users/${id}/status`, method: "PATCH", data: { isActive } }),
  async onQueryStarted({ id, isActive }, { dispatch, queryFulfilled }) {
    const patch = dispatch(
      userApi.util.updateQueryData("getUsers", undefined, (draft) => {
        const user = draft.data.find((u) => u.id === id);
        if (user) user.isActive = isActive;
      })
    );
    try {
      await queryFulfilled;
    } catch {
      patch.undo();
      toast.error("Failed to update status");
    }
  },
}),
```

### 8.5 Error Handling at the API Layer

- `axiosBaseQuery` normalizes Axios errors into RTK Query's `{ error: { status, data } }` shape.
- Wrappers read `error` from the mutation/query hook result and pass it through the centralized `parseApiError()` util before toasting.
- 422 validation errors from the backend are mapped to Formik field errors via `setErrors()` inside the Wrapper's `onSubmit` catch block — never silently swallowed.

### 8.6 Naming Conventions

- Endpoint names: camelCase verbs — `getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`, `toggleUserStatus`.
- File names: `<entity>Api.ts` (e.g. `userApi.ts`, `merchantOnboardingApi.ts`).
- Hooks auto-generated by RTK Query are consumed as-is (`useGetUsersQuery`), never manually wrapped unless adding cross-cutting logic (in which case create `use<Entity>List.ts` in module `hooks/`).

### 8.7 Polling Fallback for Near-Real-Time Data

Where a WebSocket channel (§9.5) doesn't yet exist for a given data type, use RTK Query's built-in `pollingInterval` rather than inventing a custom interval/timer:

```ts
useGetOpenTicketsQuery(undefined, { pollingInterval: 30_000 });
```

Polling is a temporary/fallback pattern; once a socket channel is available for that data, migrate off polling.

---

## 9. Axios Rules

### 9.1 Single Instance

`src/services/axiosInstance.ts` is the **only** place `axios.create()` is called.

```ts
export const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});
```

### 9.2 Interceptors

- **Request interceptor** — attaches `Authorization: Bearer <accessToken>` from `tokenStorage`; attaches tenant/org header if multi-tenant context is active.
- **Response interceptor** —
  - On `401`: attempts a single silent token refresh via `useTokenRefresh`'s underlying refresh call; retries the original request once; on second failure, clears session and redirects to `/session-expired`.
  - On `403`: redirects to `/forbidden` or shows a toast, depending on whether it's a full-page action or an inline action.
  - On network/timeout errors: surfaces a generic "Network error, please try again" toast via the centralized error parser; does not crash the UI.
  - On `5xx`: surfaces a generic "Something went wrong" toast; logs to monitoring (Sentry/Datadog hook point).

### 9.3 Retry Policy

- GET requests may be retried once automatically on network failure (exponential backoff, max 1 retry) via an axios-retry style interceptor.
- POST/PUT/PATCH/DELETE are **never** auto-retried (avoid duplicate side effects) — the user must manually resubmit.

### 9.4 Rules

- No module is allowed to import `axios` directly. All HTTP calls go through RTK Query, which internally uses `axiosInstance`.
- File upload calls (multipart) still go through RTK Query mutations using `axiosBaseQuery`, with `FormData` as the body, and are surfaced in the UI via `ATMFileUpload`'s progress prop.

### 9.5 Real-Time / WebSocket Strategy

- `src/services/socketClient.ts` is the **only** place a WebSocket connection is opened. It is a singleton, connected once after login (token attached as a query param or first-message auth handshake) and torn down on logout.
- `socketClient.ts` exposes a minimal typed pub/sub API: `subscribe(channel, handler)` / `unsubscribe(channel, handler)` — modules never touch the raw `WebSocket` instance.
- Modules that need live data (e.g. `notifications`, `auditLogs` live-tail) subscribe inside a module-specific hook (e.g. `useNotificationSocket.ts`) that dispatches into RTK Query's cache via `baseApi.util.updateQueryData`, keeping sockets and RTK Query cache in sync rather than maintaining a parallel state source.
- Reconnection uses exponential backoff (capped) and surfaces a non-blocking "reconnecting..." indicator; it never blocks the UI or shows a hard error for a transient drop.
- Where no socket channel exists yet for a given feature, fall back to RTK Query polling (§8.7) rather than inventing a bespoke interval.

### 9.6 Sanitization Rule (Security-Critical)

- `dangerouslySetInnerHTML` MUST NEVER be used with raw, unsanitized input — whether from the API, user input, or any external source.
- Any HTML that must be rendered (rich-text content, formatted notification bodies, etc.) MUST first pass through `shared/utils/sanitize.ts`, a thin wrapper around **DOMPurify**:

```ts
// shared/utils/sanitize.ts
import DOMPurify from "dompurify";

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
}
```

```tsx
// Correct usage — never skip sanitizeHtml()
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(notification.bodyHtml) }} />
```

- Code review and AI agents must treat any new `dangerouslySetInnerHTML` usage without a preceding `sanitizeHtml()` call as a blocking issue, not a style nitpick.
- Prefer rendering plain text/structured React elements over raw HTML wherever the content doesn't genuinely require rich formatting.

---

## 10. Form Rules (Formik Only)

### 10.1 Wrapper Owns Formik

```tsx
// LoginWrapper.tsx
const LoginWrapper = () => {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const formik = useFormik<LoginFormValues>({
    initialValues: { email: "", password: "", rememberMe: false },
    validationSchema: loginValidationSchema,
    onSubmit: async (values, { setErrors }) => {
      try {
        const result = await login(values).unwrap();
        tokenStorage.setTokens(result.accessToken, result.refreshToken);
        toast.success("Welcome back!");
        navigate(ROUTE_PATHS.DASHBOARD);
      } catch (err) {
        const parsed = parseApiError(err);
        if (parsed.fieldErrors) setErrors(parsed.fieldErrors);
        else toast.error(parsed.message);
      }
    },
  });

  return <LoginForm {...formik} isLoading={isLoading} />;
};
```

### 10.2 Form Is Pure

```tsx
// LoginForm.tsx
interface LoginFormProps extends FormikProps<LoginFormValues> {
  isLoading: boolean;
}

const LoginForm = ({ values, errors, touched, handleChange, handleBlur, handleSubmit, isLoading }: LoginFormProps) => (
  <form onSubmit={handleSubmit} className="space-y-4">
    <ATMInputField name="email" label="Email" value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email ? errors.email : undefined} />
    <ATMPasswordField name="password" label="Password" value={values.password} onChange={handleChange} onBlur={handleBlur} error={touched.password ? errors.password : undefined} />
    <ATMButton type="submit" loading={isLoading} fullWidth>Sign In</ATMButton>
  </form>
);
```

### 10.3 Best Practices

- `initialValues` always fully typed via a `<FormName>FormValues` interface — never inferred loosely.
- Use `enableReinitialize: true` only for Edit forms hydrating from async data.
- Prefer field-level ATM wrapper components (`ATMInputField`) that internally consume `useField` over manually wiring `values`/`errors`/`handleChange` in large forms — both patterns are acceptable, but be consistent within a module.
- Multi-field forms lay out fields inside `ATMFormGrid` rather than ad-hoc `<div className="grid ...">` markup, so column-span/breakpoint behavior stays consistent app-wide.
- Async submit errors always go through `parseApiError()`; field-level 422 errors map to `setErrors`, non-field errors go to `toast.error`.
- Never put `await fetch/axios` calls inside the Form component — only inside the Wrapper's `onSubmit`.

---

## 11. Validation Rules (Yup Only)

### 11.1 Location

- Module-specific schemas: `modules/<feature>/utils/<feature>.validation.ts` or co-located in the Wrapper file if trivial and not reused.
- Cross-module shared schemas (e.g., password rules, email rules, phone rules): `shared/utils/validationSchemas.ts`.

### 11.2 Example

```ts
// modules/auth/utils/auth.validation.ts
export const loginValidationSchema = Yup.object({
  email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
  password: Yup.string().min(8, "Minimum 8 characters").required("Password is required"),
});
```

### 11.3 Naming Convention

- File suffix: `.validation.ts`
- Export name: `<screenName>ValidationSchema` (e.g. `loginValidationSchema`, `addUserValidationSchema`).
- Reusable field-level rules: `emailRule`, `passwordRule`, `phoneRule` exported from `shared/utils/validationRules.ts` and composed into screen schemas with `Yup.object({ email: emailRule, ... })`.

---

## 12. TypeScript Rules

### 12.1 Strict Mode (tsconfig)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 12.2 `any` Is Banned

Use `unknown` + type guards/narrowing instead. If truly unavoidable (rare third-party typing gap), mark with:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- justification: <reason>
```

### 12.3 Interfaces vs Types

- **`interface`** for object shapes meant to be extended/implemented (component props, entity models, DTOs).
- **`type`** for unions, intersections, mapped/utility types, and function signatures.

### 12.4 DTOs & API Response Types

```ts
// modules/users/types/user.types.ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  roleId: string;
  createdAt: string;
}

export interface CreateUserDTO {
  fullName: string;
  email: string;
  roleId: string;
}

export type UpdateUserDTO = Partial<CreateUserDTO>;

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}
```

### 12.5 Generic API Types (global)

```ts
// types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
```

### 12.6 Folder Structure for Types

- Global: `src/types/`
- Module-specific: `modules/<feature>/types/<feature>.types.ts`
- Component-specific props that aren't reused: co-located in the component file as `<ComponentName>Props`.

---

## 13. Routing Rules

### 13.1 Route Config

`router/routes.config.ts` defines a typed route tree; `router/AppRouter.tsx` consumes it with `createBrowserRouter`.

```ts
export const ROUTE_PATHS = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  USERS: "/users",
  USER_ADD: "/users/add",
  USER_EDIT: (id: string) => `/users/${id}/edit`,
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "*",
} as const;
```

### 13.2 Guards

- `<PublicRoute>` — wraps auth pages; redirects authenticated users to dashboard.
- `<ProtectedRoute>` — wraps all authenticated pages; redirects unauthenticated users to login (preserving `redirectTo`).
- `<PermissionRoute permission="users.view">` — wraps pages requiring a specific RBAC permission; renders `<Forbidden />` if missing.

### 13.3 Lazy Loading

Every page-level route component is `React.lazy`-imported and wrapped in `<Suspense fallback={<ATMPageSkeleton />}>` at the router level — never inside individual pages.

### 13.4 Nested Routes

Module detail pages with tabs use nested routes (`/merchants/:id`, `/merchants/:id/documents`, `/merchants/:id/transactions`) rendering via `<Outlet />` inside a shared `MerchantDetailLayout`, itself built on `ATMTabbedLayout` (§7).

### 13.5 404 / Unauthorized / Forbidden

- `404` → `auth/pages/NotFound` (or a top-level `shared` page) for unmatched routes.
- `401` semantics → `Unauthorized` page (not logged in trying to deep-link).
- `403` semantics → `Forbidden` page (logged in, lacks permission).

---

## 14. Services Rules

- Every module's `services/<entity>Api.ts` contains **only** `injectEndpoints` calls against `baseApi`.
- No UI logic, no toast calls, no navigation inside services — those belong in Wrappers.
- Services may contain query-param-building helpers and response-shaping `transformResponse` functions, since that's data-layer concerns.
- One file per entity; do not merge unrelated entities into one service file.

---

## 15. Hooks Rules

### 15.1 Global Reusable Hooks (`shared/hooks` or `hooks/`)

| Hook | Purpose |
|---|---|
| `usePagination` | Page/limit state + handlers, URL-synced |
| `useDebounce` | Debounce a fast-changing value (search input) |
| `useSearch` | Combines debounce + query param sync for search bars |
| `useTable` | Wires TanStack Table state (sorting, selection) for `ATMTable` |
| `useAuth` | Auth state/actions (re-exported from `modules/auth`) |
| `usePermission` | `hasPermission(key)`, `hasAnyPermission([...])` |
| `useClickOutside` | Detect outside clicks (for dropdowns/modals) |
| `useMediaQuery` | Responsive breakpoint detection |
| `useBulkAction` | Generic selected-rows + bulk-mutation orchestration for `ATMTable` (§23.1) |
| `useIdleTimer` | Inactivity tracking for session-timeout warning (re-exported from `modules/auth`) |

### 15.2 Rules

- Hooks are named `use<Thing>` and live in `hooks/` (global) or `modules/<feature>/hooks/` (feature-specific).
- A hook that calls an API must use RTK Query hooks internally — never raw `axios`/`fetch`.
- Business hooks (decision logic) are separate from UI hooks (DOM/measurement logic); don't mix concerns in one hook.
- Every non-trivial hook has a colocated `.test.ts` using `renderHook` from RTL.

---

## 16. Utility Rules

| File | Responsibility |
|---|---|
| `utils/storage.ts` | Typed wrapper over `localStorage`/`sessionStorage` (get/set/remove/clear with JSON parsing) |
| `modules/auth/utils/tokenStorage.ts` | Token-specific storage (delegates to `storage.ts` but auth-owned) |
| `utils/dateFormatter.ts` | `formatDate`, `formatDateTime`, `formatRelativeTime` (wraps date-fns) |
| `utils/numberFormatter.ts` | Currency, percentage, large-number (K/M/B) formatting |
| `utils/errorParser.ts` | `parseApiError(error): { message, fieldErrors? }` — the single funnel for all API errors |
| `utils/permissionUtils.ts` | `hasPermission`, `hasAnyPermission`, `hasAllPermissions` pure functions |
| `shared/utils/sanitize.ts` | `sanitizeHtml(dirty): string` — the single funnel for any HTML rendered via `dangerouslySetInnerHTML` (§9.6) |
| `modules/reports/utils/exportToCsv.ts` | Wraps SheetJS to export `ATMTable` data / report data to `.xlsx`/`.csv` |
| `modules/reports/utils/exportToPdf.ts` | Wraps `@react-pdf/renderer` to export report data to `.pdf` |
| `constants/regex.ts` | Shared regex patterns (email, phone, PAN, GSTIN, etc.) |
| `shared/utils/cn.ts` | `cn(...inputs) = twMerge(clsx(inputs))` — used by every ATM component |

All utils are pure functions, fully unit-tested, and free of React/Redux imports (except `cn.ts`, which has zero React dependency too).

---

## 17. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Component files | PascalCase | `UserListTable.tsx` |
| Component folders | PascalCase | `UserListTable/` |
| Hooks | camelCase, `use` prefix | `useUserPermissions.ts` |
| Utils/helpers | camelCase | `formatCurrency.ts` |
| Types/Interfaces | PascalCase | `interface UserProfile {}` |
| Type aliases for unions | PascalCase | `type UserStatus = "ACTIVE" \| "INACTIVE"` |
| Enums | PascalCase name, UPPER_SNAKE members | `enum UserStatus { ACTIVE = "ACTIVE" }` |
| Constants | UPPER_SNAKE_CASE | `const MAX_FILE_SIZE_MB = 5` |
| Functions | camelCase, verb-first | `calculateSettlementAmount()` |
| Props interfaces | `<Component>Props` | `interface ATMButtonProps {}` |
| RTK Query endpoints | camelCase verb-noun | `getUsers`, `createUser`, `toggleUserStatus` |
| RTK Query hooks | auto-generated | `useGetUsersQuery`, `useCreateUserMutation` |
| Redux slices | camelCase, `<feature>Slice` | `uiSlice`, `sessionSlice` |
| Slice actions | camelCase | `setSidebarOpen`, `clearSession` |
| Test files (unit/component) | `<name>.test.ts(x)` | `LoginForm.test.tsx` |
| Test files (E2E) | `<flow>.spec.ts` | `login.spec.ts` |
| Validation schema files | `<feature>.validation.ts` | `user.validation.ts` |
| Service files | `<entity>Api.ts` | `merchantApi.ts` |
| Module barrel | `index.ts` | re-exports public API only |
| CSS class ordering | Tailwind: layout → spacing → typography → color → state | `flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100` |

---

## 18. Import Rules

- **Absolute imports only**, configured via `tsconfig.json` `paths` + Vite `resolve.alias`:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@modules/*": ["modules/*"],
      "@shared/*": ["shared/*"],
      "@hooks/*": ["hooks/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"]
    }
  }
}
```

- Never use deep relative imports like `../../../../shared/components/ui/ATMButton`. Use `@shared/components/ui/ATMButton`.
- Same-folder/sibling relative imports (`./LoginForm`) are fine and preferred over absolute for files within the same component folder.
- Every module/folder meant to be consumed externally exposes an `index.ts` barrel; consumers import from the barrel, not internal files, **except** within the same module where direct relative imports are fine.
- Avoid barrel files for very large shared folders if they cause circular import issues or hurt tree-shaking/build performance — prefer scoped barrels per component group (e.g. `shared/components/ui/index.ts`) over one giant root barrel.

---

## 19. Styling Rules (Tailwind Only)

- No inline `style={{}}` except for truly dynamic values impossible in Tailwind (e.g. computed chart heights, drag-and-drop transforms).
- No CSS Modules, no Styled Components, no Emotion.
- Class composition always via `cn()` (`clsx` + `tailwind-merge`), never string concatenation.
- Design tokens (colors, spacing, radii, shadows) are defined once in `theme/tailwind.config.ts` extensions — never hardcode hex colors or magic px values in components.
- **Spacing** — use Tailwind's spacing scale exclusively (`gap-2`, `p-4`, `space-y-3`); no arbitrary `p-[13px]` unless justified by a design spec.
- **Typography** — use predefined type scale classes from `theme` (e.g. `text-heading-lg`, `text-body-sm` custom utilities) rather than ad-hoc `text-[15px] font-[550]`.
- **Responsive design** — mobile-first; base classes target mobile, then layer `sm:`, `md:`, `lg:`, `xl:` for larger breakpoints. Admin panel primary target is desktop (≥1280px) but must remain usable down to tablet (≥768px).
- **Dark mode** (if enabled) — use Tailwind's `dark:` variant driven by the `ThemeProvider`, never separate dark-specific component files.

---

## 20. Toast Rules

- **Sonner** is the only toast mechanism. `alert()`/`confirm()` are forbidden.
- A single `<Toaster />` is mounted once in `app/AppProviders.tsx`.
- Standard usage:
  - `toast.success(message)` — successful mutation.
  - `toast.error(message)` — failed mutation/query, derived from `parseApiError()`.
  - `toast.loading(message)` / `toast.promise(promise, {...})` — for long-running actions (exports, bulk operations).
- Toast messages are short, user-facing, and never expose raw stack traces or internal error codes — `parseApiError()` maps technical errors to friendly copy.
- Destructive confirmations (delete, deactivate) use `ATMConfirmDialog` (built on `ATMModal`), **not** a toast and **not** `window.confirm()`.

---

## 21. Error Handling

### 21.1 Centralized Parser

`utils/errorParser.ts`:

```ts
export interface ParsedApiError {
  message: string;
  fieldErrors?: Record<string, string>;
  statusCode?: number;
}

export function parseApiError(error: unknown): ParsedApiError {
  // Normalizes RTK Query / Axios error shapes into a single, predictable structure.
  // Maps 422 -> fieldErrors, 401/403/404/500/timeout -> friendly message.
}
```

### 21.2 Status Code Strategy

| Status | Handling |
|---|---|
| `400` | Toast generic "Invalid request" or field errors if provided |
| `401` | Axios interceptor: silent refresh attempt → retry → else redirect to Session Expired |
| `403` | Redirect to `Forbidden` page (page-level) or inline toast (action-level) |
| `404` | Render `NotFound`/empty state, or toast "Resource not found" for actions |
| `422` | Map to Formik `setErrors`; no toast unless there's also a top-level message |
| `429` | Toast "Too many requests, please slow down" |
| `500` | Toast "Something went wrong, please try again"; log to monitoring |
| Timeout | Toast "Request timed out"; offer retry affordance where applicable |
| Network error | Toast "No internet connection" / "Network error" |

### 21.3 Retry

- Read (GET) failures may expose a "Retry" affordance in the UI (e.g. on `ATMEmptyState`/error boundary) that re-triggers the RTK Query `refetch()`.
- Write (mutation) failures never auto-retry; user re-submits explicitly.

### 21.4 Error Boundaries

- A top-level `<AppErrorBoundary>` in `app/` catches render-time crashes and shows a fallback screen with a "Reload" action.
- Optionally, route-level error boundaries around heavy modules (e.g. `reports`) to isolate crashes.

---

## 22. Loading Rules

| Context | Pattern |
|---|---|
| Initial page load (route-level) | `ATMPageSkeleton` via `<Suspense>` |
| Table data loading | `ATMTableSkeleton` (matches column count) |
| Card/widget loading | `ATMCardSkeleton` |
| Button submit state | `ATMButton loading` prop (spinner replaces label, button disabled) |
| Form-level submit | Wrapper derives `isSubmitting`/`isLoading` from RTK Query mutation hook, passed to Form |
| Background/non-blocking fetch | Small inline `ATMLoader` near the affected widget, rest of page stays interactive |

Rules:
- Never block the entire page for a non-critical, localized fetch.
- Skeletons must visually approximate final content layout to avoid layout shift.
- Every async button action shows a loading state — no silent multi-second waits with no feedback.

---

## 23. Tables (TanStack Table + ATMTable)

- All tabular data uses `ATMTable`, which wraps `@tanstack/react-table`.
- **Column Definitions** — declared per-module in `modules/<feature>/constants/<feature>.columns.tsx`, typed via `ColumnDef<T>`.
- **Pagination** — server-side by default (admin datasets are large); `ATMTable` accepts `pageIndex`, `pageSize`, `pageCount`, `onPageChange` controlled externally by the Wrapper via `usePagination`.
- **Sorting** — server-side sort state lifted to the Wrapper, passed as query params to RTK Query; `ATMTable` is "controlled" for sorting too (no client-side re-sort of paginated data).
- **Filtering** — column filters and a global search box live in a `TableToolbar` (presentational), with filter state owned by the Wrapper and synced to RTK Query query params (and optionally URL search params).
- **Actions column** — a dedicated `actions` column rendering `ATMIconButton`s (edit/delete/view), gated by `<PermissionGuard>`.
- **Selection** — row selection (checkboxes) enabled via TanStack's row selection state when bulk actions are required; selected IDs lifted to the Wrapper for bulk mutation calls via `useBulkAction` (§23.1).
- Empty/error states inside tables render `ATMNoData` (no results) distinctly from `ATMEmptyState` (true zero-state, e.g. "no clients yet, add one").

### 23.1 Bulk Actions Pattern

Any table supporting bulk operations (bulk deactivate, bulk delete, bulk export) uses the shared `useBulkAction` hook instead of a bespoke per-module implementation:

```ts
// shared/hooks/useBulkAction.ts
export function useBulkAction<TId extends string>(options: {
  selectedIds: TId[];
  action: (ids: TId[]) => Promise<void>;
  confirmMessage?: string;
  successMessage: string;
}) {
  // Owns: confirm-dialog open state, isSubmitting, calling `action`,
  // toast.success/error, and clearing selection on success.
  // Returns: { execute, isSubmitting, isConfirmOpen, openConfirm, closeConfirm }
}
```

```tsx
// RoleListWrapper.tsx
const { execute, isSubmitting, isConfirmOpen, openConfirm, closeConfirm } = useBulkAction({
  selectedIds,
  action: (ids) => bulkDeactivateRoles(ids).unwrap(),
  confirmMessage: "Deactivate the selected roles?",
  successMessage: "Roles deactivated",
});
```

- The Wrapper never manually orchestrates confirm-dialog + loading + toast + selection-clear logic inline — that's what `useBulkAction` centralizes, preventing drift between modules' bulk-action UX.
- The confirmation itself always renders via `ATMConfirmDialog`, never `window.confirm()`.

---

## 24. Permissions (RBAC)

### 24.1 Model

- `User` → has one or more `Role`s → each `Role` has a set of `Permission` keys (e.g. `"users.view"`, `"users.create"`, `"merchants.approve"`).
- Permission keys follow `"<module>.<action>"` convention.

### 24.2 Enforcement Layers

1. **Route Guard** — `<PermissionRoute permission="users.view">` blocks entire pages.
2. **Component Guard** — `<PermissionGuard permission="users.create">{children}</PermissionGuard>` hides/disables UI fragments.
3. **Hook** — `usePermission()` exposes `hasPermission`, `hasAnyPermission`, `hasAllPermissions` for imperative checks (e.g. inside column action renderers).
4. **Navigation** — the sidebar config (§3.4) is filtered through the same `usePermission()` so nav visibility, route access, and in-page action visibility are always derived from one permission source, never three separate ad-hoc checks.

### 24.3 Hide vs Disable

- **Hide** when the user should not know the action exists at all (e.g. "Approve Merchant" for a support-tier role).
- **Disable** (with a tooltip explaining why) when the user should be aware the action exists but currently can't perform it (e.g. "Delete" disabled because the record is in a locked state, unrelated to permission — that's a business-state disable, not a permission disable. Permission-based denial generally prefers **hide** over disable to avoid confusing users with capabilities they'll never have).

### 24.4 Best Practices

- Never rely on frontend permission checks alone — backend must enforce the same rules; frontend RBAC is UX, not security.
- Permission lists are fetched once at login/session-bootstrap and cached in Redux (`authSlice` or a dedicated `permissionsSlice`), not re-fetched per route.

---

## 25. Performance

- **Lazy Loading** — every route-level page component via `React.lazy`; heavy modules (reports, charts) additionally lazy-load their chart libraries.
- **Code Splitting** — natural by-route splitting via lazy imports; large third-party libs (Recharts, `@react-pdf/renderer`, SheetJS) dynamically `import()`ed only when the feature is used.
- **Memoization** — `React.memo` for presentational components receiving stable props inside large lists (table rows, card grids); `useMemo` for expensive derived data (e.g. column defs depending on permissions); `useCallback` for handlers passed to memoized children.
- **Suspense** — used at route boundaries and for lazy-loaded heavy widgets (charts) with skeleton fallbacks.
- **Virtualization** — required for any list/table rendering 200+ rows client-side at once (rare given server-side pagination, but applicable to things like permission checklists or audit log live-tail views) — use a virtualization-friendly pattern within `ATMTable`'s body when needed.
- Avoid premature optimization: only memoize when profiling (React DevTools Profiler) shows measurable re-render cost.

---

## 26. Accessibility

- All ATM interactive components are keyboard-navigable (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Esc` where relevant).
- `ATMModal`/`ATMConfirmDialog`/`ATMTabbedLayout` trap focus while open (modals) or manage roving tabindex (tabs), and restore focus to the triggering element on close.
- All form fields have associated `<label>` (via ATM field components) and `aria-invalid`/`aria-describedby` wired to error messages.
- Icon-only buttons (`ATMIconButton`) always have an `aria-label`.
- Color is never the only signal for state (status badges pair color with text/icon).
- Sufficient color contrast per WCAG AA, validated against `theme/` tokens.
- Toasts are announced via `aria-live="polite"` regions (Sonner default behavior preserved, not overridden).

---

## 27. Testing

### 27.1 Stack

- **Vitest** — unit/component test runner, assertions, mocking.
- **React Testing Library** — component rendering/interaction, user-centric queries.
- **MSW** — mocks RTK Query network calls at the network boundary, not by mocking hooks directly.
- **Playwright** — end-to-end tests against a running build, covering critical user flows (login, create merchant, bulk deactivate, etc.).

### 27.2 Folder/Naming Convention

- Co-located unit/component tests: `Component.tsx` + `Component.test.tsx` in the same folder.
- Hook tests: `useThing.ts` + `useThing.test.ts`.
- MSW handlers: `modules/<feature>/__mocks__/<feature>.handlers.ts`, aggregated in a root `mocks/server.ts`.
- E2E specs: top-level `e2e/` folder, one file per critical flow, named `<flow>.spec.ts` (e.g. `e2e/login.spec.ts`, `e2e/merchant-onboarding.spec.ts`). E2E specs are **not** co-located with source, since they cross module boundaries by nature.

### 27.3 What to Test

- **Forms (presentational)** — render with mock Formik props, assert field rendering and `onChange`/`onBlur`/`onSubmit` callbacks fire correctly. No API/Formik internals needed since Forms don't own them.
- **Wrappers** — render with MSW-mocked API, assert loading → success/error states, toast calls (mock `sonner`), navigation calls (mock `react-router-dom`'s `useNavigate`).
- **Hooks** — `renderHook`, assert returned state/handlers behave correctly across inputs.
- **Utils** — pure unit tests, full branch coverage for `errorParser`, `permissionUtils`, `sanitize`, formatters.
- **ATM components** — render variants (sizes, states: disabled/loading/error), snapshot only for stable visual primitives, behavior assertions for interactive ones.
- **E2E (Playwright)** — the handful of business-critical flows end-to-end: login + MFA, merchant onboarding happy path, bulk deactivate with confirm, permission-gated route redirect. Not every CRUD screen needs an E2E spec — reserve E2E for flows where a Vitest/RTL gap would let a real regression through (multi-step, cross-module, or auth-dependent flows).

### 27.4 Best Practices

- Query by role/label text (`getByRole`, `getByLabelText`) over `data-testid` where possible; reserve `data-testid` for elements with no accessible semantics.
- No testing of implementation details (internal state, private functions) — test observable behavior only.
- Each PR touching a Wrapper or Form must include/update its corresponding test file.
- E2E specs run against a seeded test environment/mock backend, never against production data.

---

## 28. Git Standards

### 28.1 Branch Naming

```
feature/<module>-<short-description>     e.g. feature/users-bulk-deactivate
fix/<module>-<short-description>          e.g. fix/auth-refresh-token-loop
chore/<short-description>                 e.g. chore/upgrade-vite-6
refactor/<module>-<short-description>     e.g. refactor/merchants-onboarding-steps
hotfix/<short-description>                e.g. hotfix/login-crash-safari
```

### 28.2 Commit Messages (Conventional Commits)

```
<type>(<scope>): <short summary>

<optional body>

<optional footer>
```

Types: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`, `perf`, `style`.
Example: `feat(users): add bulk deactivate action with confirm dialog`

### 28.3 PR Checklist

- [ ] Follows Page → Wrapper → Form layering
- [ ] No banned libraries introduced
- [ ] No `any` types
- [ ] Uses `ATM*` components, not raw HTML/MUI
- [ ] RTK Query tags correctly invalidate affected lists
- [ ] Yup validation covers all required/edge cases
- [ ] Error states (401/403/404/422/500/network) handled
- [ ] Loading states present for every async action
- [ ] Permissions gated via guards, not ad-hoc conditionals
- [ ] Absolute imports used; no deep relative paths
- [ ] Any `dangerouslySetInnerHTML` usage goes through `sanitizeHtml()`
- [ ] Tests added/updated for Wrapper, Form, hooks, and utils touched (+ E2E spec if a new critical flow was introduced)
- [ ] No console.logs / commented-out code left behind
- [ ] Accessibility: labels, aria attributes, keyboard nav verified

### 28.4 Code Review Checklist

- [ ] Module boundaries respected (no cross-module deep imports)
- [ ] No duplicated logic that should be a shared hook/component
- [ ] Naming conventions followed throughout
- [ ] Types are precise (no unnecessary `unknown`/`any`/over-broad unions)
- [ ] Tailwind classes ordered/composed via `cn()`, no inline styles
- [ ] No business logic inside presentational Form/View components
- [ ] Toasts and error messages are user-friendly, not raw technical errors
- [ ] Performance: no obviously unnecessary re-renders or missing memoization on hot paths
- [ ] Tests are meaningful (assert behavior, not implementation)
- [ ] No raw `useSelector` on auth slice or raw `logout` dispatch outside `modules/auth` (§4.4)

---

## 29. AI Agent Rules (Critical Section)

These rules are binding for every AI coding agent operating on this repository.

1. Never mix business logic inside presentational (Form/View) components.
2. Never call an API (RTK Query hook or otherwise) inside a Presentational/Form component — only inside a Wrapper.
3. Always generate a Wrapper component for any screen that involves data fetching, mutation, or navigation.
4. Always use Formik for forms — never React Hook Form.
5. Always use Yup for validation — never Zod.
6. Always use RTK Query for server state — never TanStack Query, never raw `fetch`/`axios` in components.
7. Always use `ATM*` components for UI — never raw HTML form elements or raw MUI components.
8. Always generate full TypeScript types/interfaces for props, DTOs, and API responses — never leave implicit `any`.
9. Always use strict TypeScript; never disable strict checks to "make it compile."
10. Never use `any`; use `unknown` with narrowing, or a precise type/generic instead.
11. Never introduce React Hook Form, Zod, Zustand, TanStack Query, Moment.js, or a second charting/E2E library, even if asked — explain the approved alternative instead.
12. Never use inline styles except for truly dynamic, non-Tailwind-expressible values.
13. Never duplicate code that already exists as a shared hook/util/ATM component — reuse or extend it.
14. Always create a reusable `ATM*` component when a UI pattern repeats more than once.
15. Always use barrel exports (`index.ts`) at module boundaries; never deep-import another module's internals.
16. Always follow feature-first architecture; never scatter one feature's files across unrelated top-level folders.
17. Always keep authentication logic (tokens, session, auth API calls) inside `modules/auth`; never leak it into `shared/`, layouts, or other modules — and never read auth state via raw `useSelector` or dispatch `logout` directly outside `modules/auth` (§4.4).
18. Always route API errors through `parseApiError()`; never show raw error objects or stack traces to the user.
19. Always show a loading state for any async user action (button, form, table, page).
20. Always gate permission-sensitive UI with `PermissionGuard`/`PermissionRoute`; never hardcode role checks inline with magic strings scattered around — use `usePermission`.
21. Always use Sonner for notifications; never `alert()`/`confirm()`.
22. Always use absolute imports (`@modules/...`, `@shared/...`); never deep relative imports (`../../../../`).
23. Always colocate unit/component tests with the Wrapper/Form/hook/util being added or changed; add a Playwright spec under `e2e/` when introducing a new business-critical flow.
24. When generating a new CRUD module, always scaffold the full standard structure (`pages/List`, `Add`, `Edit`, `View`, `services`, `types`, `constants`, `index.ts`) even if some screens start minimal — never silently omit a layer.
25. When extending RTK Query, always add proper `tagTypes`/`providesTags`/`invalidatesTags` — never leave stale-cache bugs by omitting invalidation.
26. When uncertain whether something is feature-specific or shared, default to feature-specific first; promote to `shared/` only once reused by a second module (avoid premature abstraction).
27. Never silently introduce a new state-management pattern (e.g., Context for server data, local component state for cross-page data) when Redux/RTK Query already owns that concern.
28. Never generate code that bypasses the Page → Wrapper → Form layering "for simplicity" — simplicity must be achieved within the architecture, not by abandoning it.
29. Always prefer composition over prop-drilling more than 2 levels — lift state to the nearest Wrapper or relevant Redux slice instead.
30. Always write self-documenting code with precise names over excessive comments; comments explain *why*, not *what*.
31. Never render HTML via `dangerouslySetInnerHTML` without first passing it through `sanitizeHtml()` (§9.6) — treat any exception as a blocking security issue.
32. Never open a raw `WebSocket` or a second socket connection anywhere outside `services/socketClient.ts`; always subscribe via its typed pub/sub API (§9.5).
33. Always build tab shells from `ATMTabbedLayout` and read-only detail screens from `ATMDetailGrid` — never hand-roll a bespoke tabs or key/value layout implementation per module.
34. Always route bulk table operations through `useBulkAction` (§23.1) — never hand-roll per-module confirm+loading+toast+selection-clear orchestration.
35. Always add new sidebar entries via `SIDEBAR_CONFIG` (§3.4) — never hardcode a new nav item directly inside the Sidebar component.

---

## 30. Do's and Don'ts

### ✅ Do

- Do keep Pages dumb — one line rendering the Wrapper.
- Do colocate Add/Edit shared form UI into a single `Form` component reused by both Wrappers.
- Do use `ATMPageSkeleton`/`ATMTableSkeleton` for every loading boundary.
- Do centralize all permission keys as constants (`PERMISSIONS.USERS_CREATE`) rather than raw strings sprinkled everywhere.
- Do keep RTK Query `tagTypes` exhaustive and accurate.
- Do write Yup schemas that mirror backend validation rules exactly (lengths, formats, required-ness).
- Do use `date-fns` for all date math/formatting — never native `Date` string manipulation or `moment.js`.
- Do use `clsx`/`tailwind-merge` (`cn()`) for every conditional class.
- Do add new shared primitives to `shared/components/ui` the moment a pattern is reused.
- Do keep module `index.ts` exports minimal and intentional (only what other modules truly need).
- Do sanitize any HTML before rendering it via `dangerouslySetInnerHTML` (§9.6).
- Do use `useBulkAction` for any new bulk-operation UI (§23.1).

### ❌ Don't

- Don't fetch data inside a Form/View component.
- Don't put Formik/Yup/RTK Query imports in a Form/View component.
- Don't use `useState` to track server data that RTK Query already caches.
- Don't hardcode API URLs — always go through `config.API_BASE_URL` + relative paths in services.
- Don't hardcode role/permission strings inline in JSX conditionals.
- Don't create a new `createApi` instance per module — inject into the single `baseApi`.
- Don't use `window.confirm`/`alert` for destructive actions — use `ATMConfirmDialog`.
- Don't write CSS files, `.module.css`, or `styled-components` — Tailwind only.
- Don't leave `console.log` statements in committed code.
- Don't catch errors and do nothing (silent failure) — always surface via toast or inline error UI.
- Don't import a sibling module's internal component/service file directly — go through its barrel.
- Don't add a library not listed in §0.1 without explicit human approval.
- Don't render unsanitized HTML via `dangerouslySetInnerHTML` (§9.6).
- Don't open a second WebSocket connection outside `socketClient.ts` (§9.5).
- Don't read auth state or dispatch `logout` directly outside `modules/auth` (§4.4).

---

## 31. Folder Templates

### 31.1 CRUD Module Template

```
modules/<feature>/
├── components/
├── pages/
│   ├── List/<Feature>ListPage.tsx, <Feature>ListWrapper.tsx
│   ├── Add/Add<Feature>Page.tsx, Add<Feature>Wrapper.tsx, <Feature>Form.tsx
│   ├── Edit/Edit<Feature>Page.tsx, Edit<Feature>Wrapper.tsx
│   └── View/View<Feature>Page.tsx, View<Feature>Wrapper.tsx
├── services/<feature>Api.ts
├── types/<feature>.types.ts
├── constants/<feature>.constants.ts, <feature>.columns.tsx
├── utils/<feature>.validation.ts
└── index.ts
```

### 31.2 Auth Module Template

See §4.1 in full.

### 31.3 Dashboard Module Template

```
modules/dashboard/
├── components/
│   ├── widgets/
│   │   ├── RevenueWidget/
│   │   ├── ActiveMerchantsWidget/
│   │   └── PendingApprovalsWidget/
│   └── charts/
│       ├── RevenueTrendChart/          # Recharts, dynamically imported
│       └── SettlementVolumeChart/      # Recharts, dynamically imported
├── pages/
│   ├── DashboardPage.tsx
│   └── DashboardWrapper.tsx
├── hooks/useDashboardFilters.ts
├── services/dashboardApi.ts
├── types/dashboard.types.ts
├── constants/dashboard.constants.ts
└── index.ts
```

### 31.4 Settings Module Template

```
modules/settings/
├── pages/
│   ├── GeneralSettings/
│   ├── SecuritySettings/
│   ├── NotificationSettings/
│   ├── TeamSettings/
│   └── BillingSettings/
├── components/SettingsNav.tsx, SettingsLayout.tsx
├── services/settingsApi.ts
├── types/settings.types.ts
└── index.ts
```

### 31.5 Shared Module Template

See §6 in full.

### 31.6 Navigation Module Template

```
modules/navigation/
├── constants/sidebar.config.ts     # SIDEBAR_CONFIG (see §3.4)
├── types/navigation.types.ts       # SidebarNavItem
├── hooks/useFilteredSidebar.ts     # applies usePermission() over SIDEBAR_CONFIG
└── index.ts
```

---

## 32. Environment & Configuration

### 32.1 Env File Convention

```
.env.development       # local dev defaults, safe to commit as .env.example
.env.staging            # staging API/WS URLs, feature flags
.env.production          # production API/WS URLs
.env.local                # gitignored — personal overrides, never committed
```

- Vite mode flags (`--mode staging`) select which `.env.<mode>` file loads.
- `config/index.ts` is the only file reading `import.meta.env.*`; it exposes a typed, validated config object (throw at boot if a required var is missing, don't silently fall back to `undefined` in production builds).
- Secrets (API keys) never live in frontend env files beyond public, client-safe keys — anything sensitive stays server-side.

### 32.2 Redux Persistence Strategy

- `redux-persist` (or an equivalent lightweight persistence layer) is applied **selectively**, not to the whole store.
- Persisted: `uiSlice` (sidebar collapsed state, theme preference).
- Session-only (never persisted): `authSlice`/`sessionSlice` tokens (delegate to `tokenStorage`'s own strategy, not `redux-persist`), any in-flight form/wizard state.
- New slices default to **not persisted** unless explicitly justified in the PR description.

### 32.3 Multi-Tenancy Header

- Tenant/org context is sent via a dedicated header, `X-Org-Id`, attached in the Axios request interceptor (§9.2) alongside the `Authorization` header — sourced from the active session's org claim, never from a URL param or client-editable field alone.
- If the backend later moves this into the JWT claim instead, only `axiosInstance.ts`'s interceptor changes — no module code should read/attach org context itself.

### 32.4 Monitoring / Observability

- A single hook point exists in `app/AppProviders.tsx` (error boundary) and `services/axiosInstance.ts` (5xx/network interceptor branch) for wiring a monitoring SDK (Sentry, Datadog RUM, or equivalent).
- Until a provider is chosen, these hook points log to `console.error` with a structured `{ context, error }` shape so swapping in a real SDK later is a one-line change per hook point, not a refactor.

### 32.5 File Upload Limits

- Global defaults live in `constants/fileUpload.constants.ts`: `MAX_FILE_SIZE_MB`, `ALLOWED_DOCUMENT_MIME_TYPES`, `ALLOWED_IMAGE_MIME_TYPES`.
- Per-document-type overrides (e.g. KYC PAN card vs. bank statement) are passed as props into `ATMFileUpload` from the owning module's constants, composed on top of the global defaults — never hardcoded inline in a component.

### 32.6 i18n

- No i18n library is adopted yet. All user-facing strings are still hardcoded English in components.
- If/when localization is scoped, this section will specify the library (e.g. `react-i18next`) and the translation-key file convention; until then, agents should not preemptively wrap strings in a translation function.

---

## 33. Known Gaps / What This Document Intentionally Leaves Open

Even at this depth, the following are deliberately left for follow-up decisions (call these out when generating code that touches them, rather than guessing silently):

1. **i18n** — see §32.6; no internationalization library is specified yet.
2. **Monitoring/Observability provider** — hook points exist (§32.4) but the actual SDK (Sentry/Datadog/LogRocket) is not yet chosen.
3. **Design Tokens Source of Truth** — whether `theme/` tokens are hand-authored or generated from a Figma token export (e.g. Style Dictionary) is undecided.
4. **CI/CD Pipeline** — lint/test/build gates, preview deployments, and versioning strategy are out of scope for this document; cover in a separate `CONTRIBUTING.md`/CI config.
5. **API Versioning** — whether `baseURL` includes `/v1/` and how breaking backend changes are coordinated with frontend releases.
6. **Feature Flags** — `config/` is set up to hold flags conceptually, but the flag provider (LaunchDarkly, home-grown, env-based) is unspecified.
7. **Storybook** — ATM component documentation/visual testing via Storybook is recommended but not mandated; add if the team adopts it.
8. **Socket auth handshake details** — §9.5 specifies a singleton client and pub/sub API, but the exact auth handshake (token-in-query-param vs. first-message auth vs. cookie-based) needs backend confirmation.

---

*This document is a living standard. Any change to architecture, banned/approved libraries, or naming conventions must be proposed as a PR to this file and reviewed before AI agents or engineers adopt the new convention.*

<!-- http://localhost:5104/swagger/v1/swagger.json -->