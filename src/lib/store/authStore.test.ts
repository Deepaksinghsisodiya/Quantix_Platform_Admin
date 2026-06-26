import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { PlatformUser } from '@/lib/types';

const mockUser: PlatformUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'Admin',
  department: 'Engineering',
  status: 'Active',
  lastLogin: null,
  mfaEnabled: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  permissions: [],
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      tokenExpiresAt: null,
      isAuthenticated: false,
      mfaPending: false,
      mfaChallengeToken: null,
    });
  });

  it('has null user initially', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
  });

  it('is not authenticated initially', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
  });

  it('has null token initially', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
  });

  describe('setToken', () => {
    it('sets the token and expiry', () => {
      useAuthStore.getState().setToken('jwt-token-123', '2026-04-02T00:00:00Z');
      const state = useAuthStore.getState();
      expect(state.token).toBe('jwt-token-123');
      expect(state.tokenExpiresAt).toBe('2026-04-02T00:00:00Z');
    });
  });

  describe('setUser', () => {
    it('sets the user and marks authenticated', () => {
      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.mfaPending).toBe(false);
    });
  });

  describe('setMfaPending', () => {
    it('sets MFA pending state with challenge token', () => {
      useAuthStore.getState().setMfaPending('mfa-challenge-abc');
      const state = useAuthStore.getState();
      expect(state.mfaPending).toBe(true);
      expect(state.mfaChallengeToken).toBe('mfa-challenge-abc');
    });
  });

  describe('logout', () => {
    it('clears user, token, and authentication', () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setToken('some-token', '2026-04-02T00:00:00Z');
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.tokenExpiresAt).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.mfaPending).toBe(false);
      expect(state.mfaChallengeToken).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('returns false when no user is set', () => {
      expect(useAuthStore.getState().hasPermission('dashboard', 'view')).toBe(false);
    });

    it('delegates to canAccess for authenticated user', () => {
      useAuthStore.getState().setUser(mockUser); // PlatformAdmin (top tier)
      expect(useAuthStore.getState().hasPermission('dashboard', 'view')).toBe(true);
      expect(useAuthStore.getState().hasPermission('settings', 'admin')).toBe(true);
    });

    it('respects role restrictions', () => {
      // 2026-05-18 (Pass 38): test against Operator (most-restricted of the locked 5 roles).
      const operatorUser: PlatformUser = { ...mockUser, role: 'Operator' };
      useAuthStore.getState().setUser(operatorUser);
      expect(useAuthStore.getState().hasPermission('dashboard', 'view')).toBe(true);
      expect(useAuthStore.getState().hasPermission('merchants', 'view')).toBe(false);
    });
  });
});
