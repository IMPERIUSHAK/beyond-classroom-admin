import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as AdminPayload;
    if (payload.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
