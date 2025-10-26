/**
 * Tests for helper utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle, generateUniqueId, formatNumber } from '../../src/modules/utils/helpers.js';

describe('Helper Utils', () => {
  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledOnce();
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should throttle function calls', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      expect(fn).toHaveBeenCalledOnce();

      throttledFn();
      throttledFn();
      expect(fn).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(100);
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateUniqueId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateUniqueId('layer');
      const id2 = generateUniqueId('layer');

      expect(id1).toMatch(/^layer-\d+-/);
      expect(id2).toMatch(/^layer-\d+-/);
      expect(id1).not.toBe(id2);
    });

    it('should use default prefix if not provided', () => {
      const id = generateUniqueId();
      expect(id).toMatch(/^id-\d+-/);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with specified decimals', () => {
      expect(formatNumber(3.14159, 2)).toBe('3.14');
      expect(formatNumber(100, 0)).toBe('100');
      expect(formatNumber(1.5, 3)).toBe('1.500');
    });
  });
});
