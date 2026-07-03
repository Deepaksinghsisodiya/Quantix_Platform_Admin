# Quantix Platform Admin - User Flow & API Documentation

This document provides a comprehensive overview of the **User Flows**, **Admin Routes**, **API Services**, and **Backend Endpoints** for the `Quantix.PlatformAdmin` application.

---

## 1. Architecture Overview

- **Routing Framework**: `react-router-dom` v6 with role-aware guards (`StaffGuard`, `MerchantGuard`, `RoleGuard`).
- **State Management & API Layer**: Axios-backed modular API client services located in `src/lib/api/` with automatic Bearer token management, 401 token refresh interceptors, and error handlers.
- **Role Permissions**: Fine-grained permissions check per module (`view`, `create`, `edit`, `delete`).

---

## 2. Flow-Wise Breakdown & API Mapping

### Flow 1: Auth & Account Security Management Flow
- **Admin Routes**:
  - `/login` - Platform login
  - `/forgot-password` - Request password reset
  - `/reset-password` - Reset password
  - `/change-password` - Update password
  - `/mfa/setup` - Multi-Factor Authentication setup
- **API File**: `src/lib/api/auth.ts`
- **API Endpoints**:
  - `POST /api/v1/auth/login` - Admin/Staff/Merchant authentication.
  - `POST /api/v1/auth/logout` - Logout session.
  - `GET /api/v1/auth/me` - Fetch current profile & assigned permissions.
  - `PUT /api/v1/auth/me/password` - Update password.
  - `POST /api/v1/auth/password/reset` - Initiate password reset.
  - `POST /api/v1/auth/password/reset/confirm` - Reset password with token.
  - `GET /api/v1/auth/mfa/setup` - Fetch MFA setup QR code.
  - `POST /api/v1/auth/mfa/enable` & `POST /api/v1/auth/mfa/disable` - Manage MFA state.
  - `POST /api/v1/auth/mfa/verify` - Verify 2FA token.

---

### Flow 2: Dashboard & Platform Overview Flow
- **Admin Routes**:
  - `/dashboard` - Role-aware dispatch dashboard (Admin, Ops, Finance, Content, Operator)
- **API File**: `src/lib/api/dashboard.ts`
- **API Endpoints**:
  - `GET /api/v1/dashboard/overview` - Platform high-level stats (total merchants, revenue, active bridges).
  - `GET /api/v1/dashboard/merchant-analytics` - Merchant onboarding & growth charts.
  - `GET /api/v1/dashboard/revenue-summary` - Daily/Monthly platform revenue summary.
  - `GET /api/v1/dashboard/pos-bridge-health` - POS bridge connectivity metrics.

---

### Flow 3: Merchant Management Flow
- **Admin Routes**:
  - `/merchants` - Merchant directory & search
  - `/merchants/register/enterprise` - Onboard Enterprise Merchant
  - `/merchants/register/standalone` - Onboard Standalone Merchant
  - `/merchants/signups` - Pending signup approval queue
  - `/merchants/:id` - Merchant detailed profile & configuration
  - `/merchants/deboarding` - Merchant deboarding queue & workflow
  - `/merchants/terminals` - Standalone local-only terminal registry & pairing codes
- **API Files**: `merchants.ts`, `signups.ts`, `deboarding.ts`, `terminals.ts`, `registration.ts`
- **API Endpoints**:
  - `GET /api/v1/merchants` - List merchants with filtering & pagination.
  - `GET /api/v1/merchants/{id}` - Fetch merchant details.
  - `POST /api/v1/merchants/enterprise` & `POST /api/v1/merchants/standalone` - Register new merchants.
  - `GET /api/v1/signups/queue` & `POST /api/v1/signups/approve` - Signup approval queue.
  - `GET /api/v1/deboarding/queue` - Deboarding workflows.
  - `GET /api/v1/terminals` & `POST /api/v1/terminals/pair` - Terminal pairing.

---

### Flow 4: User Administration & Session Security Flow
- **Admin Routes**:
  - `/users` - Platform user list & roles
  - `/users/add` - Add new internal user / staff
  - `/users/:id/edit` - Edit user permissions & roles
  - `/users/sessions` - Active user session monitoring & force revocation
- **API File**: `src/lib/api/users.ts`
- **API Endpoints**:
  - `GET /api/v1/users` - Get list of platform users.
  - `POST /api/v1/users` - Create platform user.
  - `PUT /api/v1/users/{id}` - Update user roles & status.
  - `GET /api/v1/users/sessions` - View active sessions.
  - `POST /api/v1/users/sessions/{sessionId}/revoke` - Revoke user session.

---

### Flow 5: Billing, Invoices & Revenue Collection Flow
- **Admin Routes**:
  - `/billing/invoices` - Global invoices list & status tracking
  - `/billing/plans` - Subscription plans management
  - `/billing/revenue` - Platform revenue report & analytics
- **API Files**: `billing.ts`, `revenueCollection.ts`
- **API Endpoints**:
  - `GET /api/v1/billing/invoices` - List invoices (Filter by status, date, merchant).
  - `GET /api/v1/billing/invoices/{id}` - Invoice details.
  - `GET /api/v1/billing/invoices/{id}/pdf` - Download invoice PDF.
  - `POST /api/v1/billing/invoices/{id}/mark-paid` - Mark invoice as paid.
  - `POST /api/v1/billing/invoices/{id}/void` - Void invoice.
  - `GET /api/v1/billing/revenue-report` - Download revenue report.
  - `GET /api/v1/billing/overdue-escalation` - Escalation list for overdue invoices.

---

### Flow 6: Token Catalog & Pricing Management Flow
- **Admin Routes**:
  - `/tokens` - POS feature token catalog
  - `/tokens/pricing` - Manage token tier pricing
- **API File**: `src/lib/api/tokens.ts`
- **API Endpoints**:
  - `GET /api/v1/billing/token-pricing` - Fetch token pricing list.
  - `POST /api/v1/billing/token-pricing` - Create token pricing tier.
  - `PUT /api/v1/billing/token-pricing/{id}` - Update pricing tier.
  - `DELETE /api/v1/billing/token-pricing/{id}` - Delete pricing tier.

---

### Flow 7: Content Management (CMS) Flow
- **Admin Routes**:
  - `/content/blog` - Manage blog posts
  - `/content/categories` - Manage categories
  - `/content/authors` - Manage authors
- **API File**: `src/lib/api/content.ts`
- **API Endpoints**:
  - `GET /api/v1/blog/posts` - List posts.
  - `POST /api/v1/blog/posts` - Create new post.
  - `PUT /api/v1/blog/posts/{id}` - Update post.
  - `DELETE /api/v1/blog/posts/{id}` - Delete post.
  - `POST /api/v1/blog/posts/{id}/publish` - Publish post.
  - `POST /api/v1/blog/posts/{id}/archive` - Archive post.
  - `GET / POST / PUT / DELETE /api/v1/blog/categories` - Manage categories.
  - `GET / POST / PUT / DELETE /api/v1/blog/authors` - Manage authors.

---

### Flow 8: Compliance, Audit Logs & Security Events Flow
- **Admin Routes**:
  - `/audit/logs` - System audit log viewer
  - `/audit/security-events` - Security event monitoring
  - `/compliance` - Compliance export & reports
- **API Files**: `audit.ts`, `compliance.ts`
- **API Endpoints**:
  - `GET /api/v1/audit/logs` - Fetch system audit trail with filters.
  - `GET /api/v1/audit/logs/export` - Export audit logs.
  - `GET /api/v1/audit/security-events` - Get security events.
  - `GET /api/v1/audit/compliance-export` - Generate compliance export report.

---

### Flow 9: Merchant Self-Service Portal Flow
- **Admin Routes** (Accessible by `Merchant` role users):
  - `/merchant/dashboard` - Merchant operational dashboard
  - `/merchant/wallet` - Merchant wallet balance & history
  - `/merchant/tokens` - Merchant active tokens & purchase history
  - `/merchant/invoices` - Merchant billing & invoices
  - `/merchant/downloads` - Desktop POS bridge installer downloads
  - `/merchant/profile` - Merchant business profile settings
- **API File**: `src/lib/api/merchantSelf.ts`, `wallet.ts`
- **API Endpoints**:
  - `GET /api/v1/billing/invoices/merchant/{merchantId}` - Merchant-specific invoices.
  - `GET /api/v1/bridge/{merchantId}/config` - POS Bridge configuration.
  - `GET /api/v1/wallet/{merchantId}` - Merchant wallet balance.

---

## 3. Complete Admin API Summary List

| Module | HTTP Method | Endpoint Path | Description / Purpose |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Staff & Merchant Login |
| **Auth** | `POST` | `/api/v1/auth/logout` | Session Logout |
| **Auth** | `GET` | `/api/v1/auth/me` | Current Profile & Permissions |
| **Auth** | `PUT` | `/api/v1/auth/me/password` | Change Password |
| **Auth** | `POST` | `/api/v1/auth/password/reset` | Request Reset Password |
| **Auth** | `GET/POST` | `/api/v1/auth/mfa/*` | Setup, Enable, Disable, Verify MFA |
| **Merchants** | `GET` | `/api/v1/merchants` | List all merchants |
| **Merchants** | `POST` | `/api/v1/merchants/enterprise` | Onboard Enterprise merchant |
| **Merchants** | `POST` | `/api/v1/merchants/standalone` | Onboard Standalone merchant |
| **Merchants** | `GET` | `/api/v1/signups/queue` | Pending signup approvals |
| **Users** | `GET/POST` | `/api/v1/users` | List and create platform users |
| **Billing** | `GET` | `/api/v1/billing/invoices` | Manage invoices |
| **Billing** | `POST` | `/api/v1/billing/invoices/{id}/mark-paid` | Mark invoice as paid |
| **Billing** | `POST` | `/api/v1/billing/invoices/{id}/void` | Void invoice |
| **Billing** | `GET` | `/api/v1/billing/revenue-report` | Platform Revenue Report |
| **Billing** | `GET/POST` | `/api/v1/billing/token-pricing` | Token Catalog Pricing |
| **Blog CMS** | `GET/POST` | `/api/v1/blog/posts` | Manage blog posts |
| **Blog CMS** | `POST` | `/api/v1/blog/posts/{id}/publish` | Publish post |
| **Audit** | `GET` | `/api/v1/audit/logs` | Audit Logs |
| **Audit** | `GET` | `/api/v1/audit/security-events` | Security Events |
| **Audit** | `GET` | `/api/v1/audit/compliance-export` | Export compliance data |
