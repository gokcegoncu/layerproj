/**
 * Tests for AppState module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppState } from '../../src/modules/core/state.js';

describe('AppState', () => {
  beforeEach(() => {
    // Reset state before each test
    AppState.reset();
  });

  describe('get and set', () => {
    it('should get and set state values', () => {
      AppState.set('activeLayerId', 'layer-1');
      expect(AppState.get('activeLayerId')).toBe('layer-1');
    });

    it('should return null for unset values', () => {
      expect(AppState.get('activeLayerId')).toBeNull();
    });

    it('should update existing values', () => {
      AppState.set('activeLayerId', 'layer-1');
      AppState.set('activeLayerId', 'layer-2');
      expect(AppState.get('activeLayerId')).toBe('layer-2');
    });
  });

  describe('state change notifications', () => {
    it('should dispatch event on state change', () => {
      const listener = vi.fn();
      document.addEventListener('state:changed', listener);

      AppState.set('isDrawingMode', true);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            key: 'isDrawingMode',
            newValue: true,
            oldValue: false,
          }),
        })
      );

      document.removeEventListener('state:changed', listener);
    });
  });

  describe('update', () => {
    it('should update multiple state values at once', () => {
      AppState.update({
        activeLayerId: 'layer-1',
        activeGroupId: 'group-1',
        isDrawingMode: true,
      });

      expect(AppState.get('activeLayerId')).toBe('layer-1');
      expect(AppState.get('activeGroupId')).toBe('group-1');
      expect(AppState.get('isDrawingMode')).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      AppState.set('activeLayerId', 'layer-1');
      AppState.set('isDrawingMode', true);

      AppState.reset();

      expect(AppState.get('activeLayerId')).toBeNull();
      expect(AppState.get('isDrawingMode')).toBe(false);
    });
  });
});
