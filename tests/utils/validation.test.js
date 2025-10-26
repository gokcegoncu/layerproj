/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import { validateName, sanitizeInput, validateLayerName, validateGroupName } from '../../src/modules/utils/validation.js';

describe('Validation Utils', () => {
  describe('validateName', () => {
    it('should accept valid names', () => {
      expect(validateName('Layer 1')).toBe(true);
      expect(validateName('Test Group')).toBe(true);
      expect(validateName('Valid-Name_123')).toBe(true);
    });

    it('should reject empty names', () => {
      expect(validateName('')).toBe(false);
      expect(validateName('   ')).toBe(false);
    });

    it('should reject names longer than max length', () => {
      const longName = 'a'.repeat(101);
      expect(validateName(longName, 100)).toBe(false);
    });

    it('should reject dangerous patterns', () => {
      expect(validateName('<script>')).toBe(false);
      expect(validateName('test<img>')).toBe(false);
      expect(validateName('javascript:')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('');
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello World');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('should limit length', () => {
      expect(sanitizeInput('abc', 2)).toBe('ab');
    });
  });

  describe('validateLayerName', () => {
    it('should validate layer names', () => {
      expect(validateLayerName('My Layer')).toBe(true);
      expect(validateLayerName('')).toBe(false);
    });
  });

  describe('validateGroupName', () => {
    it('should validate group names', () => {
      expect(validateGroupName('My Group')).toBe(true);
      expect(validateGroupName('')).toBe(false);
    });
  });
});
