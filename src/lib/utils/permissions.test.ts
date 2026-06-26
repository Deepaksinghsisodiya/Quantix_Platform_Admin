import { describe, it, expect } from 'vitest';
import { canAccess, getAccessibleModules, ROLE_PERMISSIONS } from './permissions';

// 2026-05-18 (Pass 38): rewritten for the locked 5-role model.

describe('canAccess', () => {
  describe('Admin', () => {
    it('can access everything including settings admin', () => {
      expect(canAccess('Admin', 'settings', 'admin')).toBe(true);
      expect(canAccess('Admin', 'merchants', 'delete')).toBe(true);
      expect(canAccess('Admin', 'billing', 'create')).toBe(true);
      expect(canAccess('Admin', 'users', 'admin')).toBe(true);
      expect(canAccess('Admin', 'settings', 'view')).toBe(true);
    });
  });

  describe('OperationsManager', () => {
    it('owns merchant lifecycle (CRUD + admin)', () => {
      expect(canAccess('OperationsManager', 'merchants', 'view')).toBe(true);
      expect(canAccess('OperationsManager', 'merchants', 'create')).toBe(true);
      expect(canAccess('OperationsManager', 'merchants', 'edit')).toBe(true);
      expect(canAccess('OperationsManager', 'merchants', 'delete')).toBe(true);
    });

    it('owns tokens with CRUD (folded in from retired token_manager)', () => {
      expect(canAccess('OperationsManager', 'tokens', 'view')).toBe(true);
      expect(canAccess('OperationsManager', 'tokens', 'create')).toBe(true);
      expect(canAccess('OperationsManager', 'tokens', 'delete')).toBe(true);
    });

    it('owns compliance with CRUD', () => {
      expect(canAccess('OperationsManager', 'compliance', 'view')).toBe(true);
      expect(canAccess('OperationsManager', 'compliance', 'edit')).toBe(true);
    });

    it('cannot modify billing or content', () => {
      expect(canAccess('OperationsManager', 'billing', 'edit')).toBe(false);
      expect(canAccess('OperationsManager', 'content', 'view')).toBe(false);
    });
  });

  describe('FinanceManager', () => {
    it('can access billing with CRUD', () => {
      expect(canAccess('FinanceManager', 'billing', 'view')).toBe(true);
      expect(canAccess('FinanceManager', 'billing', 'create')).toBe(true);
      expect(canAccess('FinanceManager', 'billing', 'edit')).toBe(true);
      expect(canAccess('FinanceManager', 'billing', 'delete')).toBe(true);
    });

    it('can access commission with CRUD', () => {
      expect(canAccess('FinanceManager', 'commission', 'view')).toBe(true);
      expect(canAccess('FinanceManager', 'commission', 'edit')).toBe(true);
    });

    it('can view tokens but not edit them (OpsMgr scope)', () => {
      expect(canAccess('FinanceManager', 'tokens', 'view')).toBe(true);
      expect(canAccess('FinanceManager', 'tokens', 'create')).toBe(false);
    });

    it('cannot access support or content', () => {
      expect(canAccess('FinanceManager', 'support', 'view')).toBe(false);
      expect(canAccess('FinanceManager', 'content', 'view')).toBe(false);
    });
  });

  describe('ContentManager', () => {
    it('can access content with CRUD', () => {
      expect(canAccess('ContentManager', 'content', 'view')).toBe(true);
      expect(canAccess('ContentManager', 'content', 'create')).toBe(true);
      expect(canAccess('ContentManager', 'content', 'edit')).toBe(true);
      expect(canAccess('ContentManager', 'content', 'delete')).toBe(true);
    });

    it('can view dashboard', () => {
      expect(canAccess('ContentManager', 'dashboard', 'view')).toBe(true);
    });

    it('cannot access merchants or billing', () => {
      expect(canAccess('ContentManager', 'merchants', 'view')).toBe(false);
      expect(canAccess('ContentManager', 'billing', 'view')).toBe(false);
    });
  });

  describe('Operator', () => {
    it('owns helpdesk with CRUD', () => {
      expect(canAccess('Operator', 'support', 'view')).toBe(true);
      expect(canAccess('Operator', 'support', 'create')).toBe(true);
      expect(canAccess('Operator', 'support', 'edit')).toBe(true);
      expect(canAccess('Operator', 'support', 'delete')).toBe(true);
    });

    it('can view dashboard', () => {
      expect(canAccess('Operator', 'dashboard', 'view')).toBe(true);
    });

    it('does not see merchants / billing / commission by default (Admin grants overlay)', () => {
      expect(canAccess('Operator', 'merchants', 'view')).toBe(false);
      expect(canAccess('Operator', 'billing', 'view')).toBe(false);
      expect(canAccess('Operator', 'commission', 'view')).toBe(false);
    });
  });

  describe('Per-user activity grants (server-issued permissions)', () => {
    it('overrides the role matrix when permissions are present', () => {
      expect(canAccess('Operator', 'merchants', 'view', ['merchants.view'])).toBe(true);
      expect(canAccess('Operator', 'commission', 'view', ['commission.view'])).toBe(true);
    });

    it('returns false when permission is not granted', () => {
      expect(canAccess('Admin', 'merchants', 'view', ['unrelated.permission'])).toBe(false);
    });

    it('treats `*` as wildcard', () => {
      expect(canAccess('Operator', 'merchants', 'delete', ['*'])).toBe(true);
    });

    it('treats `module.admin` as catch-all for that module', () => {
      expect(canAccess('Operator', 'merchants', 'view', ['merchants.admin'])).toBe(true);
      expect(canAccess('Operator', 'merchants', 'delete', ['merchants.admin'])).toBe(true);
    });
  });

  it('returns false for unknown module', () => {
    expect(canAccess('Admin', 'nonexistent', 'view')).toBe(false);
  });

  it('returns false for unknown action', () => {
    expect(canAccess('Admin', 'dashboard', 'superpower' as any)).toBe(false);
  });
});

describe('getAccessibleModules', () => {
  it('returns all modules for Admin', () => {
    const modules = getAccessibleModules('Admin');
    expect(modules).toContain('dashboard');
    expect(modules).toContain('merchants');
    expect(modules).toContain('billing');
    expect(modules).toContain('tokens');
    expect(modules).toContain('commission');
    expect(modules).toContain('support');
    expect(modules).toContain('content');
    expect(modules).toContain('settings');
    expect(modules).toHaveLength(13);
  });

  it('returns correct modules for OperationsManager', () => {
    const modules = getAccessibleModules('OperationsManager');
    expect(modules).toContain('dashboard');
    expect(modules).toContain('merchants');
    expect(modules).toContain('tokens');
    expect(modules).toContain('compliance');
    expect(modules).not.toContain('content');
  });

  it('returns correct modules for FinanceManager', () => {
    const modules = getAccessibleModules('FinanceManager');
    expect(modules).toContain('billing');
    expect(modules).toContain('commission');
    expect(modules).toContain('reports');
    expect(modules).not.toContain('support');
    expect(modules).not.toContain('content');
  });

  it('returns correct modules for ContentManager', () => {
    const modules = getAccessibleModules('ContentManager');
    expect(modules).toContain('dashboard');
    expect(modules).toContain('content');
    expect(modules).toHaveLength(2);
  });

  it('returns correct modules for Operator', () => {
    const modules = getAccessibleModules('Operator');
    expect(modules).toContain('dashboard');
    expect(modules).toContain('support');
    expect(modules).toHaveLength(2);
  });
});

// Sanity check that ROLE_PERMISSIONS holds entries for exactly the 5 locked roles.
describe('ROLE_PERMISSIONS shape', () => {
  it('declares all 5 locked roles', () => {
    const roles = Object.keys(ROLE_PERMISSIONS).sort();
    expect(roles).toEqual([
      'Admin',
      'ContentManager',
      'FinanceManager',
      'OperationsManager',
      'Operator',
    ]);
  });
});
