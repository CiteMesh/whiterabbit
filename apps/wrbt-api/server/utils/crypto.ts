import { randomBytes, randomInt } from 'crypto';
import bcrypt from 'bcrypt';

// bcrypt configuration
const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
const USE_BCRYPT = process.env.USE_BCRYPT === 'true' || process.env.NODE_ENV === 'production';

/**
 * Generate a secure uppercase pairing code for bot registration
 * Format: "ABCDEFGH" (6-8 uppercase characters A-Z)
 * Security: ~308 million combinations for 6 chars, ~208 billion for 8 chars
 *
 * @param length - Code length (6-8 characters, defaults to 8)
 * @returns Uppercase alphabetic pairing code
 */
export function generatePairingCode(length: number = 8): string {
  if (length < 6 || length > 8) {
    throw new Error('Pairing code length must be between 6 and 8 characters');
  }

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    // Use cryptographically secure random bytes to index into alphabet
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }

  return code;
}

/**
 * Calculate pairing code expiry timestamp (1 hour from now)
 * @returns Date object 1 hour in the future
 */
export function getPairingCodeExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);
  return expiry;
}

/**
 * Check if a pairing code has expired
 * @param expiresAt - Expiry timestamp from database
 * @returns true if expired, false if still valid
 */
export function isPairingCodeExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
}

/**
 * Generate a secure API key for bots
 * Format: "wrbt_" + 32 random hex characters
 * Example: "wrbt_a1b2c3d4e5f6..."
 */
export function generateApiKey(): string {
  const randomHex = randomBytes(16).toString('hex');
  return `wrbt_${randomHex}`;
}

/**
 * Generate a random UUID (fallback if database doesn't support gen_random_uuid())
 */
export function generateUUID(): string {
  return randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

/**
 * Hash an API key for storage using bcrypt
 *
 * In development (USE_BCRYPT=false), stores plain text for easier debugging.
 * In production (NODE_ENV=production or USE_BCRYPT=true), uses bcrypt.
 *
 * @param key - Plain text API key to hash
 * @returns Hashed key or plain text (development only)
 */
export function hashApiKey(key: string): string {
  if (USE_BCRYPT) {
    return bcrypt.hashSync(key, SALT_ROUNDS);
  } else {
    console.warn('⚠️ DEVELOPMENT MODE: Using plain-text token storage. Set USE_BCRYPT=true or NODE_ENV=production for bcrypt.');
    return key;
  }
}

/**
 * Compare API key with hashed version
 *
 * @param key - Plain text API key from request
 * @param hash - Hashed key from database
 * @returns true if keys match
 */
export function compareApiKey(key: string, hash: string): boolean {
  if (USE_BCRYPT) {
    return bcrypt.compareSync(key, hash);
  } else {
    // Development mode: plain text comparison
    return key === hash;
  }
}
