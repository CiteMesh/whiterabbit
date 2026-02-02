import { Router } from 'express';
import { storage } from '../storage';
import { generatePairingCode, generateApiKey, hashApiKey } from '../utils/crypto';
import { rateLimitByIP } from '../middleware/bot-auth';

const router = Router();

/**
 * POST /api/bots/register
 * Register a new bot and receive a pairing code
 *
 * Body: { name, contact_email?, user_agent? }
 * Response: { pairing_code, status_url, expires_at }
 */
router.post(
  '/register',
  rateLimitByIP(3, 3600000), // 3 requests per hour per IP
  async (req, res) => {
    try {
      const { name, contact_email, user_agent } = req.body;

      // Validation
      if (!name || typeof name !== 'string' || name.trim().length < 3) {
        return res.status(400).json({
          error: 'Invalid name',
          message: 'Name must be at least 3 characters',
          code: 'VALIDATION_ERROR',
        });
      }

      if (contact_email && typeof contact_email !== 'string') {
        return res.status(400).json({
          error: 'Invalid email',
          code: 'VALIDATION_ERROR',
        });
      }

      // Generate pairing code
      const pairingCode = generatePairingCode(); // "123456"
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      // Create bot
      const bot = await storage.createBot({
        name: name.trim(),
        contact_email: contact_email?.trim(),
        user_agent: user_agent || req.headers['user-agent'],
        pairing_code: pairingCode,
        pairing_expires_at: expiresAt,
      });

      return res.status(201).json({
        pairing_code: pairingCode,
        status_url: `/api/bots/status/${pairingCode}`,
        expires_at: expiresAt.toISOString(),
        message: 'Pairing code generated. Poll status_url to check approval.',
        instructions: [
          '1. Share this pairing code with the WRBT_01 administrator',
          '2. Wait for admin approval (check status_url)',
          '3. Once approved, you will receive an API token',
          '4. Use the token in Authorization: Bearer <token> header',
        ],
      });
    } catch (error) {
      console.error('Bot registration error:', error);
      return res.status(500).json({
        error: 'Registration failed',
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

/**
 * GET /api/bots/status/:code
 * Check the status of a bot registration by pairing code
 *
 * Response:
 * - pending: { status: "pending", message: "..." }
 * - approved: { status: "approved", bot_id, token, tier }
 * - revoked: { status: "revoked", message: "..." }
 * - expired: { error: "..." }
 */
router.get(
  '/status/:code',
  rateLimitByIP(60, 3600000), // 60 requests per hour
  async (req, res) => {
    try {
      const { code } = req.params;

      const bot = await storage.getBotByPairingCode(code);

      if (!bot) {
        return res.status(404).json({
          error: 'Invalid pairing code',
          message: 'Pairing code not found',
          code: 'NOT_FOUND',
        });
      }

      // Check if expired
      if (bot.pairing_expires_at && new Date() > bot.pairing_expires_at) {
        return res.status(410).json({
          error: 'Pairing code expired',
          message: 'This pairing code has expired. Please register again.',
          code: 'EXPIRED',
        });
      }

      // Handle different statuses
      if (bot.status === 'approved') {
        // Generate token if not already set
        let token = bot.token;
        if (!token) {
          token = generateApiKey(); // "wrbt_a1b2c3d4..."
          await storage.updateBot(bot.id, {
            token: hashApiKey(token),
          });
        }

        return res.json({
          status: 'approved',
          bot_id: bot.id,
          token, // IMPORTANT: Only shown once!
          tier: bot.tier,
          approved_at: bot.approved_at?.toISOString(),
          message: 'Bot approved! Save this token securely - it will not be shown again.',
          instructions: [
            'Use this token in all API requests:',
            'Authorization: Bearer ' + token,
            '',
            'Example:',
            'curl -H "Authorization: Bearer ' + token + '" https://wrbt.example.com/api/documents',
          ],
        });
      }

      if (bot.status === 'revoked') {
        return res.json({
          status: 'revoked',
          revoked_at: bot.revoked_at?.toISOString(),
          reason: bot.revoked_reason,
          message: 'Bot registration was revoked by administrator',
          code: 'REVOKED',
        });
      }

      // Status: pending
      return res.json({
        status: 'pending',
        requested_at: bot.created_at.toISOString(),
        expires_at: bot.pairing_expires_at?.toISOString(),
        message: 'Awaiting administrator approval. Poll this endpoint to check status.',
      });
    } catch (error) {
      console.error('Status check error:', error);
      return res.status(500).json({
        error: 'Status check failed',
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

export default router;
