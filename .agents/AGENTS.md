# Quantix Admin Modular CRUD Folder Structure Rule

All CRUD modules created or refactored within this project must strictly adhere to the following architecture and folder conventions. This rule applies to any feature module (e.g., `merchants`, `clients`, `users`, `billing`, `compliance`, `helpdesk`, etc.).

## 1. Directory Structure

Depending on whether a module is a Standard CRUD (single main entity) or a Complex CRUD (multiple sub-entities/views/portals), it must follow one of these folder layouts:

### Layout A: Standard CRUD (e.g., `clients`)
For typical entities that have a single list, form, and detail view.
```
src/modules/<module_name>/
├── Add/
│   └── Add<Name>Wrapper.tsx      # Container component for creation
├── Edit/
│   └── Edit<Name>Wrapper.tsx     # Container component for editing
├── Form/
│   └── <Name>Form.tsx            # Dumb presentational form (shared by Add and Edit)
├── List/
│   ├── <Name>List.tsx            # Dumb table presentation UI (uses ATMTable)
│   └── <Name>ListWrapper.tsx     # Container component for list queries & state
├── View/
│   ├── <Name>View.tsx            # Dumb detail view presentation UI
│   └── <Name>ViewWrapper.tsx     # Container component for detail queries
├── services/
│   └── <name>Api.ts              # RTK Query slice API
├── types/
│   └── <name>.types.ts           # DTOs and TypeScript interfaces
└── index.ts                      # Module entry point exporting public elements
```

### Layout B: Complex CRUD / Multi-Feature Module (e.g., `merchants`)
For modules containing multiple sub-services, multiple workflows/registration queues, or client-side self-service pages.
```
src/modules/<module_name>/
├── Add/                          # Multiple Creation/Registration Portals
│   ├── EnterpriseRegisterWrapper.tsx
│   └── StandaloneRegisterWrapper.tsx
├── Detail/                       # Multiple Detail/Tabular Sub-Views
│   ├── MerchantDetailWrapper.tsx
│   ├── DeboardingQueueWrapper.tsx
│   └── MerchantTerminalsWrapper.tsx
├── List/                         # Main tabular lists
│   ├── MerchantList.tsx          # Presentational UI
│   └── MerchantListWrapper.tsx   # Container for listing
├── pages/                        # Optional: Sibling pages / Sub-portals
│   └── merchant/                 # Nested routes / Portal pages
│       ├── MerchantDashboardPage.tsx
│       ├── MerchantWalletPage.tsx
│       └── components/           # Private components for these pages only
├── services/                     # Multiple RTK Query slices if needed
│   ├── merchantApi.ts            # Defines admin actions
│   └── merchantSelfApi.ts        # Defines self-service/client actions
├── types/                        # TypeScript definitions
│   └── merchant.types.ts         # Module DTOs and shapes
└── index.ts                      # Entry point for the module
```

---

## 2. Architectural Guidelines & Best Practices

### Container-Presenter Separation
- **Wrappers (`*Wrapper.tsx`)**:
  - Acts as the controller/container.
  - Fetches data using RTK Query hooks.
  - Manages Formik setup (validation schema using `Yup`, `initialValues`, submit handler).
  - Handles API mutations with proper toast notifications (`toast.success`, custom error parsing / `toastApiError`).
  - Accesses routers/params (`useNavigate`, `useParams`).
  - Renders the dumb component, passing data and callbacks as props.
  - Implements state helpers like `usePagination` and `useGetAll` for lists.
- **Presenter Components (`*Form.tsx`, `*List.tsx`, `*View.tsx`, `*Page.tsx`)**:
  - Presentational (dumb) components.
  - Must NOT contain RTK Query hooks, routing logic, or data-mutating logic directly.
  - Receives all dynamic values, loading/fetching states, form values, and event handlers as props.
  - Implements JSX/styling using standard UI components and layout systems.

### Forms & Validation
- Standard forms use Formik.
- The `*Form.tsx` component should consume `formikProps` of type `FormikProps<FormValues>`.
- Keep field controls mapped to the formik context (e.g. `<ATMInputField name="email" value={values.email} onChange={handleChange} ... />` or wrapping `ATM*` components directly).
- Define validation schemas using `Yup` inside the container wrapper file or a shared `*.validation.ts` file in the module directory.

### Table Pagination & Listing
- Wrap lists in a `*ListWrapper.tsx`.
- Use the `usePagination` hook to manage pagination, sorting, search string, and other filters.
- Use the `useGetAll` hook to handle data fetching and pass standard items/counts to the presentational `<Name>List` component.
- The table component must render using `<ATMTable />` from the shared library.

### Shared UI Component Integration
Always use standard project shared UI elements when generating components:
- Form fields: `ATMInputField`, `ATMSelectField`, `ATMSwitchField`, `ATMPhoneInputField`, `ATMMultiSelectField`, `ATMTextAreaField` from `@/shared/components/form`.
- Buttons: `ATMButton` and `ATMIconButton` from `@/shared/ui/ATMButton` / `@/shared/ui/ATMIconButton`.
- Badges: `ATMBadge`, `StatusBadge` from `@/shared/ui/ATMBadge`.
- Table: `ATMTable` from `@/shared/components/ATMTable/ATMTable`.
- Headers: `ATMPageHeader` from `@/shared/components/ATMPageHeader`.

> [!WARNING]
> Do NOT use raw components from `src/components/ui/` (like standard `Button.tsx`, `Badge.tsx`, `Input.tsx`, `Modal.tsx`) for building form inputs, buttons, tables, badges, or headers in CRUD modules. Those components are legacy or external layouts. Always prioritize their corresponding `ATM*` equivalents from `@/shared/ui` and `@/shared/components` to maintain strict UI/UX and binding consistency.

### Authentication & Sessions
- Always use the unified custom hook `useAuth` from `@/shared/hooks/useAuth` to retrieve the current user, session statuses, roles, and executing the logout action.
- Do NOT read authentication state directly via `useSelector` or invoke `logout` action raw in separate module components.

