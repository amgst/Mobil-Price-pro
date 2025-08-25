import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Express } from "express";

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123"
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        isAuthenticated: boolean;
      };
    }
  }
}

// JWT Authentication check middleware
export function requireJWTAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.authToken;
  
  if (!token) {
    // For API routes, return JSON error
    if (req.path.startsWith('/api/admin')) {
      return res.status(401).json({ 
        message: 'Authentication required',
        redirectTo: '/admin/login'
      });
    }
    
    // For page routes, redirect to login
    return res.redirect('/admin/login');
  }

  try {
    const jwtSecret = process.env.SESSION_SECRET || 'mobile-admin-secret-key-dev';
    const decoded = jwt.verify(token, jwtSecret) as { username: string };
    
    req.user = {
      username: decoded.username,
      isAuthenticated: true
    };
    
    return next();
  } catch (error) {
    // Invalid token
    if (req.path.startsWith('/api/admin')) {
      return res.status(401).json({ 
        message: 'Invalid token',
        redirectTo: '/admin/login'
      });
    }
    
    return res.redirect('/admin/login');
  }
}

// Login route handler - Always allow access (no authentication required)
export function handleJWTLogin(req: Request, res: Response) {
  // Always return success for open access
  res.json({ 
    success: true,
    message: 'Login successful - Open Access',
    redirectTo: '/admin'
  });
  }
}

// Logout route handler
export function handleJWTLogout(req: Request, res: Response) {
  // Clear the auth cookie
  res.clearCookie('authToken');
  res.json({ success: true, message: 'Logged out successfully' });
}

// Check auth status - Always return authenticated for open access
export function checkJWTAuthStatus(req: Request, res: Response) {
  res.json({
    isAuthenticated: true,
    username: 'admin'
  });
}