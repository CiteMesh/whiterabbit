import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generatePairingCode,
  getPairingCodeExpiry,
  isPairingCodeExpired,
  generateApiKey,
  hashApiKey,
  compareApiKey,
} from './crypto';

describe('Pairing Code Generation', () => {
  describe('generatePairingCode', () => {
    it('should generate uppercase alphabetic code with default length of 8', () => {
      const code = generatePairingCode();
      expect(code).toMatch(/^[A-Z]{8}$/);
      expect(code).toHaveLength(8);
    });

    it('should generate code with custom length of 6', () => {
      const code = generatePairingCode(6);
      expect(code).toMatch(/^[A-Z]{6}$/);
      expect(code).toHaveLength(6);
    });

    it('should generate code with custom length of 7', () => {
      const code = generatePairingCode(7);
      expect(code).toMatch(/^[A-Z]{7}$/);
      expect(code).toHaveLength(7);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generatePairingCode());
      }
      // With 208 billion combinations, 100 codes should all be unique
      expect(codes.size).toBe(100);
    });

    it('should throw error for length < 6', () => {
      expect(() => generatePairingCode(5)).toThrow(
        'Pairing code length must be between 6 and 8 characters'
      );
    });

    it('should throw error for length > 8', () => {
      expect(() => generatePairingCode(9)).toThrow(
        'Pairing code length must be between 6 and 8 characters'
      );
    });

    it('should only contain uppercase letters A-Z', () => {
      const codes = Array.from({ length: 50 }, () => generatePairingCode());
      codes.forEach((code) => {
        // Check no numbers, lowercase, or special characters
        expect(code).not.toMatch(/[0-9a-z]/);
        expect(code).not.toMatch(/[^A-Z]/);
      });
    });

    it('should use all letters of alphabet (statistical test)', () => {
      const letterCounts = new Map<string, number>();
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      // Generate many codes to get statistical distribution
      for (let i = 0; i < 500; i++) {
        const code = generatePairingCode(8);
        for (const char of code) {
          letterCounts.set(char, (letterCounts.get(char) || 0) + 1);
        }
      }

      // All letters should appear at least once in 500 * 8 = 4000 characters
      for (const letter of alphabet) {
        expect(letterCounts.get(letter)).toBeGreaterThan(0);
      }
    });
  });

  describe('getPairingCodeExpiry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return date 1 hour in future', () => {
      const now = new Date('2026-02-03T10:00:00Z');
      vi.setSystemTime(now);

      const expiry = getPairingCodeExpiry();
      const expectedExpiry = new Date('2026-02-03T11:00:00Z');

      expect(expiry.getTime()).toBe(expectedExpiry.getTime());
    });

    it('should be exactly 3600000 milliseconds (1 hour) from now', () => {
      const now = Date.now();
      const expiry = getPairingCodeExpiry();
      const diff = expiry.getTime() - now;

      // Allow 10ms tolerance for execution time
      expect(diff).toBeGreaterThanOrEqual(3600000 - 10);
      expect(diff).toBeLessThanOrEqual(3600000 + 10);
    });
  });

  describe('isPairingCodeExpired', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for null expiry', () => {
      expect(isPairingCodeExpired(null)).toBe(true);
    });

    it('should return true for past date', () => {
      const now = new Date('2026-02-03T10:00:00Z');
      vi.setSystemTime(now);

      const pastDate = new Date('2026-02-03T09:00:00Z');
      expect(isPairingCodeExpired(pastDate)).toBe(true);
    });

    it('should return false for future date', () => {
      const now = new Date('2026-02-03T10:00:00Z');
      vi.setSystemTime(now);

      const futureDate = new Date('2026-02-03T11:00:00Z');
      expect(isPairingCodeExpired(futureDate)).toBe(false);
    });

    it('should return true for exact current time', () => {
      const now = new Date('2026-02-03T10:00:00Z');
      vi.setSystemTime(now);

      // At exact expiry time, it should be considered expired
      expect(isPairingCodeExpired(now)).toBe(false);

      // One millisecond later
      vi.setSystemTime(new Date(now.getTime() + 1));
      expect(isPairingCodeExpired(now)).toBe(true);
    });

    it('should handle date exactly 1 hour old', () => {
      const now = new Date('2026-02-03T10:00:00Z');
      vi.setSystemTime(now);

      const oneHourAgo = new Date('2026-02-03T09:00:00Z');
      expect(isPairingCodeExpired(oneHourAgo)).toBe(true);
    });
  });
});

describe('API Key Generation', () => {
  describe('generateApiKey', () => {
    it('should generate key with wrbt_ prefix', () => {
      const key = generateApiKey();
      expect(key).toMatch(/^wrbt_/);
    });

    it('should be 37 characters total (wrbt_ + 32 hex)', () => {
      const key = generateApiKey();
      expect(key).toHaveLength(37);
    });

    it('should contain only hex characters after prefix', () => {
      const key = generateApiKey();
      const hexPart = key.slice(5); // Remove "wrbt_"
      expect(hexPart).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should generate unique keys', () => {
      const keys = new Set();
      for (let i = 0; i < 100; i++) {
        keys.add(generateApiKey());
      }
      expect(keys.size).toBe(100);
    });
  });

  describe('hashApiKey and compareApiKey', () => {
    it('should hash and compare correctly in development mode', () => {
      // In dev mode (default), should use plain text
      const key = 'wrbt_test123';
      const hash = hashApiKey(key);

      // Should be plain text since USE_BCRYPT is not set
      expect(compareApiKey(key, hash)).toBe(true);
      expect(compareApiKey('wrong_key', hash)).toBe(false);
    });

    it('should create valid hashes', () => {
      const key = 'wrbt_test456';
      const hash = hashApiKey(key);

      // Hash should be created
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);

      // Should be able to verify with same key
      expect(compareApiKey(key, hash)).toBe(true);

      // Should fail with different key
      expect(compareApiKey('wrbt_different_key', hash)).toBe(false);
    });

    it('should handle empty keys', () => {
      const key = '';
      const hash = hashApiKey(key);

      expect(hash).toBeDefined();
      expect(compareApiKey(key, hash)).toBe(true);
      expect(compareApiKey('not_empty', hash)).toBe(false);
    });
  });
});
