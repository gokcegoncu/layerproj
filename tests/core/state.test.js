/**
 * Tests for application state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AppState } from '../../src/modules/core/state.js';

describe('AppState', () => {
  beforeEach(() => {
    // Reset state before each test
    AppState.set('activeLayerId', null);
    AppState.set('activeGroupId', null);
    AppState.set('isDrawingMode', false);
  });

  describe('get and set', () => {
    it('should get and set state values', () => {
      AppState.set('activeLayerId', 'layer-1');
      expect(AppState.get('activeLayerId')).toBe('layer-1');
    });

    it('should return undefined for non-existent keys', () => {
      expect(AppState.get('nonExistent')).toBeUndefined();
    });
  });

  describe('state change notifications', () => {
    it('should notify listeners on state change', (done) => {
      const listener = (event) => {
        expect(event.detail.key).toBe('isDrawingMode');
        expect(event.detail.newValue).toBe(true);
        expect(event.detail.oldValue).toBe(false);
        done();
      };

      document.addEventListener('state:changed', listener);
      AppState.set('isDrawingMode', true);
      document.removeEventListener('state:changed', listener);
    });
  });

  describe('getAll', () => {
    it('should return all state values', () => {
      AppState.set('activeLayerId', 'layer-1');
      AppState.set('activeGroupId', 'group-1');

      const state = AppState.getAll();
      expect(state.activeLayerId).toBe('layer-1');
      expect(state.activeGroupId).toBe('group-1');
    });
  });
});
