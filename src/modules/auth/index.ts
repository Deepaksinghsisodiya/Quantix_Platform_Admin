// Pages
export { default as LoginPage } from './Login/LoginFormWrapper';
export { default as ForgotPasswordPage } from './ForgotPassword/ForgotPasswordWrapper';
export { default as ResetPasswordPage } from './ResetPassword/ResetPasswordWrapper';
export { default as ChangePasswordPage } from './ChangePassword/ChangePasswordWrapper';
export { default as MfaSetupPage } from './MFA/MFAWrapper';
export { default as VerifyOTPPage } from './VerifyOTP/VerifyOTPWrapper';
export { default as SessionExpiredPage } from './SessionExpired/SessionExpiredPage';
export { default as UnauthorizedPage } from './Unauthorized/UnauthorizedPage';
export { default as ForbiddenPage } from './Forbidden/ForbiddenPage';

// Route Guards
export { default as ProtectedRoute } from './routes/ProtectedRoute';
export { default as PublicRoute } from './routes/PublicRoute';

// Hooks
export { default as useAuth } from './hooks/useAuth';
export { default as useSession } from './hooks/useSession';
export { default as useTokenRefresh } from './hooks/useTokenRefresh';

// Providers
export { default as AuthProvider } from './AuthProvider';

// Services & Slices
export * from './services/authApi';
export * from './slices/authSlice';

// Components
export { default as AuthLayout } from './components/AuthLayout/AuthLayout';
export { default as OTPInputGroup } from './components/OTPInputGroup/OTPInputGroup';
export { default as PasswordStrengthMeter } from './components/PasswordStrengthMeter/PasswordStrengthMeter';
export { default as ChangePasswordModal } from './components/ChangePasswordModal';
export { default as ChangePasswordUI } from './components/ChangePasswordUI';

// Utils & Constants
export { default as tokenStorage } from './utils/tokenStorage';
export { default as sessionUtils } from './utils/sessionUtils';
export * from './constants/auth.constants';

// Explicitly export types from auth.types to avoid duplicate 'AuthState' export conflict
export type {
  Permission,
  User,
  LoginRequest,
  LoginResponse,
  MFAVerifyResponse,
  MfaSetupResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserSession,
  ApiResponse,
} from './types/auth.types';
