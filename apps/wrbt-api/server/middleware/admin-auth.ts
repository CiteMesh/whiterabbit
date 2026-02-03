import type { Request, Response, NextFunction } from 'express';
import type { User } from '../../shared/schema';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Admin Authentication Middleware
 * Verifies that user is logged in and has admin role
 *
 * IMPORTANT: This requires express-session to be configured
 * and a login system to be implemented. For now, this is a
 * placeholder that returns 401 to remind you to implement auth.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check for session-based authentication
  if (!req.session || !(req.session as any).userId) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access admin routes',
      code: 'ADMIN_AUTH_REQUIRED',
    });
  }

  // Check for admin role (you'll need to load user from session)
  const user = (req.session as any).user as User | undefined;

  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required',
      message: 'This route requires administrator privileges',
      code: 'ADMIN_ROLE_REQUIRED',
    });
  }

  req.user = user;
  next();
}

/**
 * Optional auth - allows both authenticated and unauthenticated access
 * but attaches user to request if authenticated
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && (req.session as any).userId) {
    req.user = (req.session as any).user as User;
  }
  next();
}
