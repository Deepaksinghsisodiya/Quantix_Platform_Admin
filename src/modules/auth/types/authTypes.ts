// ── Auth Types ────────────────────────────────────────────────────────────────

export interface Permission {
  module: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface User {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  isPasswordChanged: boolean;
  profilePicture?: string | null;
  profilePictureUrl?: string | null;
  avatar?: string | null;
  departmentName?: string | null;
  designationName?: string | null;
  clientId?: string | null;
  permissions: Permission[];
  permissionsVersion: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  mfaRequired: boolean;
  mfaChallengeToken?: string;
  token?: string;
  expiresAt?: string;
  mfaSetupRequired?: boolean;
  mustChangePassword?: boolean;
  permissions?: readonly string[];
  accessToken?: string;
  user?: User;
}

export interface MFAVerifyResponse {
  token: string;
  expiresAt: string;
  user: User;
  permissions?: readonly string[];
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUri: string;
  backupCodes: readonly string[];
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserSession {
  id: string;
  deviceName?: string;
  deviceType?: string;
  ipAddress?: string;
  loginAt: string;
  isActive: boolean;
}

export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  isLoading: boolean;
  isInitialized: boolean;
}
