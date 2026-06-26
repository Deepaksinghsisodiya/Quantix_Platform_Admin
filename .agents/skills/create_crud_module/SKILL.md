---
name: create_crud_module
description: Scaffolding, building, refactoring, or generating a CRUD module (with Add, Edit, Detail, List, Form, services, types) in the frontend application using Container-Presenter wrappers, Formik, Yup, and RTK Query.
---

# Scaffolding a CRUD Module in Quantix / TimeForge

When asked to create a CRUD module or add/modify a CRUD feature, follow this detailed protocol to ensure consistency with the existing design and architecture.

---

## 1. Directory Blueprint

Verify the layout requirement. If the module is simple, use the Standard structure; if complex (multiple roles, self-service portals, or sub-flows), use the Complex structure.

### Layout: Standard CRUD
```
src/modules/<ModuleName>/
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

### Layout: Complex CRUD / Multi-Feature Module
```
src/modules/<ModuleName>/
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

## 2. Reusable Component Dictionary & Usage (extracted from TimeForge)

All presentational components (Form, List, View) must strictly consume the following reusable components imported from `@/shared/components` or `@/shared/ui`.

### A. Form Fields (`@/shared/components/form`)
> [!IMPORTANT]
> All these form components are pre-wired to Formik using the `useField` hook internally.
> You **MUST NOT** pass `value`, `onChange`, or `onBlur` manually. Simply provide the `name` prop matching the Formik initialValues key.

#### 1. `ATMInputField`
Standard text, email, number, or password input.
```tsx
import { ATMInputField } from '@/shared/components/form/ATMInputField';
import { Mail } from 'lucide-react';

<ATMInputField
  name="email"
  label="Email Address"
  type="email"
  placeholder="Enter email address"
  required
  icon={<Mail size={16} />} // Optional left icon
/>
```

#### 2. `ATMSelectField`
Custom searchable dropdown.
```tsx
import { ATMSelectField } from '@/shared/components/form/ATMSelectField';

const options = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
];

<ATMSelectField
  name="status"
  label="Status"
  options={options}
  placeholder="Select Status"
  required
  searchable // Enables internal search filtering
  clearable  // Enables clearing option
/>
```

#### 3. `ATMSwitchField`
Formik-bound switch toggle.
```tsx
import { ATMSwitchField } from '@/shared/components/form/ATMSwitchField';

<ATMSwitchField
  name="isActive"
  label="Account Status"
  description="Enable or disable login access" // Optional
/>
```

#### 4. `ATMPhoneInputField`
Formatted country-aware phone field.
```tsx
import { ATMPhoneInputField } from '@/shared/components/form/ATMPhoneInputField';

<ATMPhoneInputField
  name="phone"
  label="Phone Number"
  required
/>
```

#### 5. `ATMMultiSelectField`
Multi-selection dropdown widget.
```tsx
import { ATMMultiSelectField } from '@/shared/components/form/ATMMultiSelectField';

<ATMMultiSelectField
  name="roleIds"
  label="Assigned Roles"
  options={roleOptions}
  placeholder="Select roles..."
/>
```

#### 6. `ATMTextAreaField`
Multiline text input.
```tsx
import { ATMTextAreaField } from '@/shared/components/form/ATMTextAreaField';

<ATMTextAreaField
  name="address"
  label="Street Address"
  placeholder="Enter full address"
  rows={3}
/>
```

#### 7. Other Form Fields:
- `ATMCheckboxField` (Props: `label`, `name`)
- `ATMDatePickerField` (Props: `label`, `name`, `placeholder`)
- `ATMTimePickerField` (Props: `label`, `name`, `placeholder`)

---

### B. Table Component (`@/shared/components/ATMTable/ATMTable`)
> [!IMPORTANT]
> The table is a full-featured component with search, server-side pagination, sorting, filters, and row actions.

```tsx
import { ATMTable } from '@/shared/components/ATMTable/ATMTable';
import type { ATMTableColumn, RowAction } from '@/shared/components/ATMTable/ATMTable';
import { StatusBadge } from '@/shared/ui/ATMBadge';

// 1. Column Definition
const columns: ATMTableColumn<User>[] = [
  {
    key: 'name',
    header: 'Full Name',
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
  },
  {
    key: 'status',
    header: 'Status',
    renderCell: (val) => <StatusBadge status={val} />,
  },
];

// 2. Row Actions Definition
const rowActions = (row: User): RowAction<User>[] => [
  {
    label: 'View Details',
    onClick: (r) => handleView(r.id),
  },
  {
    label: 'Delete Record',
    variant: 'danger',
    onClick: (r) => handleDelete(r.id),
    hidden: (r) => r.role === 'Admin', // Optional conditional hiding
  },
];

// 3. Render Table
<ATMTable
  columns={columns}
  data={data}
  isLoading={isLoading}
  isFetching={isFetching}
  searchValue={searchValue}
  onSearchChange={onSearchChange}
  searchPlaceholder="Search by name or email..."
  pagination={{
    page: page,
    pageSize: pageSize,
    totalCount: totalCount,
    onPageChange: onPageChange,
    onPageSizeChange: onPageSizeChange,
  }}
  rowActions={rowActions}
  onRowClick={(row) => handleView(row.id)}
/>
```

---

### C. Standard UI Elements (`@/shared/ui/`)

#### 1. `ATMButton`
```tsx
import { ATMButton } from '@/shared/ui/ATMButton';
import { Save } from 'lucide-react';

<ATMButton
  type="submit"
  variant="primary" // 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size="md"         // 'sm' | 'md' | 'lg'
  isLoading={isSubmitting}
  icon={Save}
  iconPosition="left"
>
  Save Changes
</ATMButton>
```

#### 2. `ATMIconButton`
For compact clickable actions.
```tsx
import { ATMIconButton } from '@/shared/ui/ATMIconButton';
import { Trash2 } from 'lucide-react';

<ATMIconButton
  icon={Trash2}
  variant="danger" // 'default' | 'danger' | 'success' | 'ghost'
  size="sm"        // 'sm' | 'md' | 'lg'
  tooltip="Delete Record"
  onClick={handleDelete}
/>
```

#### 3. `ATMBadge` and `StatusBadge`
`StatusBadge` automatically matches colors (green for success, red for danger, blue/indigo for pending/processing, orange for warning) based on strings.
```tsx
import { StatusBadge } from '@/shared/ui/ATMBadge';

<StatusBadge status="active" />  // Renders green 'Active' badge with checkmark icon
<StatusBadge status="pending" /> // Renders primary blue 'Pending' badge with clock icon
```

#### 4. `ATMPageHeader`
The universal top bar with title, breadcrumbs, actions, and back buttons.
```tsx
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { Plus } from 'lucide-react';

<ATMPageHeader
  title="Client Directory"
  subtitle="Manage onboarded companies and project access"
  breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Clients' }]}
  action={{
    label: 'Add Client',
    icon: Plus,
    onClick: () => navigate('/clients/add'),
  }}
/>
```

---

## 3. Standard Code Implementation Patterns

### Standard Form Wrapper Container (Add/Edit)
Wrappers setup Formik and Yup schemas, execute mutations, and use toast helper actions:
```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { useCreateClientMutation } from '../services/clientApi';
import ClientForm, { ClientFormValues } from '../Form/ClientForm';

export const clientSchema = Yup.object().shape({
  name: Yup.string().required('Client name is required').min(2, 'Name too short'),
  email: Yup.string().required('Email is required').email('Enter valid email'),
  isActive: Yup.boolean().default(true),
});

const initialValues: ClientFormValues = {
  name: '',
  email: '',
  isActive: true,
};

export const AddClientWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [createClient] = useCreateClientMutation();

  const handleSubmit = async (values: ClientFormValues, { setSubmitting }: any) => {
    try {
      await createClient(values).unwrap();
      toast.success('Client created successfully');
      navigate('/clients');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create client');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={clientSchema}
      onSubmit={handleSubmit}
    >
      {(formikProps) => (
        <ClientForm
          title="Create New Client"
          formikProps={formikProps}
          onCancel={() => navigate('/clients')}
        />
      )}
    </Formik>
  );
};
```

---

### D. Central Authentication Hook (`useAuth`)
Retrieve session details, current user data, role scopes, and handle the logout flow:
```typescript
import { useAuth } from '@/shared/hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, logout, isAdmin, isMerchant } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.displayName}!</p>
      {isAdmin && <button>Admin Dashboard</button>}
      <button onClick={logout}>Sign Out</button>
    </div>
  );
};
```

