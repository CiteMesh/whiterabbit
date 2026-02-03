import { randomBytes, randomInt } from 'crypto';
import bcrypt from 'bcrypt';

// bcrypt configuration
const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
const USE_BCRYPT = process.env.USE_BCRYPT === 'true' || process.env.NODE_ENV === 'production';

/**
 * Generate a 6-digit pairing code for bot registration
 * Format: "123456"
 */
export function generatePairingCode(): string {
  return String(randomInt(100000, 999999));
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
