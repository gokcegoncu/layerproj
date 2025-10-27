/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import * as Validation from '../../src/modules/utils/validation.js';

describe('Validation', () => {
  describe('validateName', () => {
    it('should accept valid names', () => {
      expect(Validation.validateName('Valid Layer Name')).toBe(true);
      expect(Validation.validateName('Layer_123')).toBe(true);
      expect(Validation.validateName('A')).toBe(true);
    });

    it('should reject empty names', () => {
      expect(Validation.validateName('')).toBe(false);
      expect(Validation.validateName('   ')).toBe(false);
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(101);
      expect(Validation.validateName(longName)).toBe(false);
    });

    it('should reject names with dangerous patterns', () => {
      expect(Validation.validateName('<script>alert("xss")</script>')).toBe(false);
      expect(Validation.validateName('javascript:alert(1)')).toBe(false);
      expect(Validation.validateName('<img onerror="alert(1)">')).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<div>Hello<script>alert("xss")</script></div>';
      const result = Validation.sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click</div>';
      const result = Validation.sanitizeHtml(input);
      expect(result).not.toContain('onclick');
    });

    it('should preserve safe content', () => {
      const input = '<div class="test">Safe <strong>content</strong></div>';
      const result = Validation.sanitizeHtml(input);
      expect(result).toContain('Safe');
      expect(result).toContain('content');
    });
  });

  describe('isValidEmail', () => {
    it('should accept valid email addresses', () => {
      expect(Validation.isValidEmail('user@example.com')).toBe(true);
      expect(Validation.isValidEmail('test.user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(Validation.isValidEmail('invalid')).toBe(false);
      expect(Validation.isValidEmail('@example.com')).toBe(false);
      expect(Validation.isValidEmail('user@')).toBe(false);
    });
  });
});
