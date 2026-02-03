import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { Bot } from '../../shared/schema';

// Extend Express Request to include bot
declare global {
  namespace Express {
    interface Request {
      bot?: Bot;
    }
  }
}

/**
 * Bot Authentication Middleware
 * Verifies Authorization: Bearer <token> header
 */
export async function botAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing bot token',
      message: 'Include Authorization: Bearer <token> header',
      code: 'BOT_AUTH_REQUIRED',
    });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const bot = await storage.getBotByToken(token);

    if (!bot) {
      // Log failed attempt
      await storage.logBotRequest({
        bot_id: null,
        endpoint: req.path,
        method: req.method,
        status_code: 403,
        ip_address: req.ip || req.socket.remoteAddress || 'unknown',
        user_agent: req.headers['user-agent'] || null,
        response_time_ms: 0,
      });

      return res.status(403).json({
        error: 'Invalid bot token',
        message: 'Token not recognized or bot is not approved',
        code: 'BOT_TOKEN_INVALID',
      });
    }

    if (bot.status !== 'approved') {
      return res.status(403).json({
        error: 'Bot not approved',
        status: bot.status,
        message: bot.status === 'revoked'
          ? 'Bot access has been revoked'
          : 'Bot registration is still pending approval',
        code: 'BOT_NOT_APPROVED',
      });
    }

    // Attach bot to request
    req.bot = bot;

    // Log successful request on finish
    const startTime = Date.now();
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      storage.logBotRequest({
        bot_id: bot.id,
        endpoint: req.path,
        method: req.method,
        status_code: res.statusCode,
        ip_address: req.ip || req.socket.remoteAddress || 'unknown',
        user_agent: (req.headers['user-agent'] as string | undefined) ?? null,
        response_time_ms: responseTime,
      }).catch(err => console.error('Failed to log bot request:', err));
    });

    next();
  } catch (error) {
    console.error('Bot auth error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'Internal server error during authentication',
      code: 'BOT_AUTH_ERROR',
    });
  }
}

/**
 * Rate limiting middleware (simple in-memory, replace with Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimitByIP(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let rateLimit = rateLimitMap.get(ip);

    if (!rateLimit || now > rateLimit.resetAt) {
      rateLimit = { count: 0, resetAt: now + windowMs };
      rateLimitMap.set(ip, rateLimit);
    }

    rateLimit.count++;

    if (rateLimit.count > maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${maxRequests} requests per ${windowMs / 1000}s`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((rateLimit.resetAt - now) / 1000),
      });
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - rateLimit.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimit.resetAt / 1000));

    next();
  };
}
