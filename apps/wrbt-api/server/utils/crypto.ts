import { randomBytes, randomInt } from 'crypto';

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
 * Hash an API key for storage (using bcrypt in production)
 * For now, returns plain text (REPLACE IN PRODUCTION)
 */
export function hashApiKey(key: string): string {
  // TODO: Use bcrypt.hash(key, 10) in production
  return key;
}

/**
 * Compare API key with hashed version
 * For now, simple comparison (REPLACE IN PRODUCTION)
 */
export function compareApiKey(key: string, hash: string): boolean {
  // TODO: Use bcrypt.compare(key, hash) in production
  return key === hash;
}
