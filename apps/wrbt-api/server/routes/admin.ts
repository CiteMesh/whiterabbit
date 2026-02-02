import { Router } from 'express';
import { storage } from '../storage';
import { generateApiKey, hashApiKey } from '../utils/crypto';

const router = Router();

// Helper to safely extract string from params
function getString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

/**
 * TODO: Add admin authentication middleware
 * For now, these endpoints are unprotected (development only)
 * In production, use Passport.js session auth
 */

/**
 * GET /api/admin/bots
 * List all bots with optional status filter
 *
 * Query params:
 * - status: pending|approved|revoked (optional)
 */
router.get('/bots', async (req, res) => {
  try {
    const status = getString(req.query.status);

    const bots = await storage.getAllBots();

    // Filter by status if provided
    const filtered = status
      ? bots.filter(bot => bot.status === status)
      : bots;

    res.json({
      bots: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Admin get bots error:', error);
    res.status(500).json({
      error: 'Failed to fetch bots',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /api/admin/bots/:id/approve
 * Approve a pending bot and generate API token
 *
 * Response: { status, token, message }
 */
router.post('/bots/:id/approve', async (req, res) => {
  try {
    const botId = getString(req.params.id);
    if (!botId) {
      return res.status(400).json({ error: 'Missing bot ID' });
    }

    const bot = await storage.getBotById(botId);

    if (!bot) {
      return res.status(404).json({
        error: 'Bot not found',
        code: 'NOT_FOUND',
      });
    }

    if (bot.status === 'approved') {
      return res.status(400).json({
        error: 'Bot already approved',
        code: 'ALREADY_APPROVED',
      });
    }

    // Generate API token
    const apiKey = generateApiKey();
    const hashedToken = hashApiKey(apiKey);

    // Update bot status
    await storage.updateBot(botId, {
      status: 'approved',
      token: hashedToken,
      approved_at: new Date(),
      pairing_code: null, // Clear pairing code after approval
      pairing_expires_at: null,
    });

    res.json({
      status: 'approved',
      token: apiKey, // Show token ONCE
      bot_id: botId,
      message: 'Bot approved. Save this token - it will not be shown again!',
    });
  } catch (error) {
    console.error('Admin approve bot error:', error);
    res.status(500).json({
      error: 'Failed to approve bot',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /api/admin/bots/:id/revoke
 * Revoke a bot's access
 *
 * Response: { status, message }
 */
router.post('/bots/:id/revoke', async (req, res) => {
  try {
    const botId = getString(req.params.id);
    if (!botId) {
      return res.status(400).json({ error: 'Missing bot ID' });
    }

    const bot = await storage.getBotById(botId);

    if (!bot) {
      return res.status(404).json({
        error: 'Bot not found',
        code: 'NOT_FOUND',
      });
    }

    if (bot.status === 'revoked') {
      return res.status(400).json({
        error: 'Bot already revoked',
        code: 'ALREADY_REVOKED',
      });
    }

    // Update bot status
    await storage.updateBot(botId, {
      status: 'revoked',
      revoked_at: new Date(),
    });

    res.json({
      status: 'revoked',
      bot_id: botId,
      message: 'Bot access revoked',
    });
  } catch (error) {
    console.error('Admin revoke bot error:', error);
    res.status(500).json({
      error: 'Failed to revoke bot',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * GET /api/admin/bots/:id
 * Get detailed bot information including request history
 */
router.get('/bots/:id', async (req, res) => {
  try {
    const botId = getString(req.params.id);
    if (!botId) {
      return res.status(400).json({ error: 'Missing bot ID' });
    }

    const bot = await storage.getBotById(botId);

    if (!bot) {
      return res.status(404).json({
        error: 'Bot not found',
        code: 'NOT_FOUND',
      });
    }

    // Get recent requests
    const requests = await storage.getBotRequests(botId, 50);

    res.json({
      bot,
      recent_requests: requests,
    });
  } catch (error) {
    console.error('Admin get bot details error:', error);
    res.status(500).json({
      error: 'Failed to fetch bot details',
      code: 'INTERNAL_ERROR',
    });
  }
});

export default router;
