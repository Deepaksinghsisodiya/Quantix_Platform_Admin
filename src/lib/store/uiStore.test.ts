import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      theme: 'system',
      sidebarCollapsed: false,
      sidebarOpen: false,
      activeModal: null,
    });
  });

  it('has system as initial theme', () => {
    expect(useUiStore.getState().theme).toBe('system');
  });

  it('has sidebar not collapsed initially', () => {
    expect(useUiStore.getState().sidebarCollapsed).toBe(false);
  });

  it('has sidebar closed initially', () => {
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it('has no active modal initially', () => {
    expect(useUiStore.getState().activeModal).toBeNull();
  });

  describe('setTheme', () => {
    it('sets theme to light', () => {
      useUiStore.getState().setTheme('light');
      expect(useUiStore.getState().theme).toBe('light');
    });

    it('sets theme to dark', () => {
      useUiStore.getState().setTheme('dark');
      expect(useUiStore.getState().theme).toBe('dark');
    });

    it('sets theme to system', () => {
      useUiStore.getState().setTheme('dark');
      useUiStore.getState().setTheme('system');
      expect(useUiStore.getState().theme).toBe('system');
    });
  });

  describe('toggleSidebar', () => {
    it('toggles sidebar collapsed state', () => {
      expect(useUiStore.getState().sidebarCollapsed).toBe(false);
      useUiStore.getState().toggleSidebar();
      expect(useUiStore.getState().sidebarCollapsed).toBe(true);
    });

    it('toggles back to false', () => {
      useUiStore.getState().toggleSidebar();
      useUiStore.getState().toggleSidebar();
      expect(useUiStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  describe('setSidebarOpen', () => {
    it('opens sidebar', () => {
      useUiStore.getState().setSidebarOpen(true);
      expect(useUiStore.getState().sidebarOpen).toBe(true);
    });

    it('closes sidebar', () => {
      useUiStore.getState().setSidebarOpen(true);
      useUiStore.getState().setSidebarOpen(false);
      expect(useUiStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('openModal / closeModal', () => {
    it('opens a modal by id', () => {
      useUiStore.getState().openModal('confirm-delete');
      expect(useUiStore.getState().activeModal).toBe('confirm-delete');
    });

    it('closes the modal', () => {
      useUiStore.getState().openModal('confirm-delete');
      useUiStore.getState().closeModal();
      expect(useUiStore.getState().activeModal).toBeNull();
    });
  });
});
