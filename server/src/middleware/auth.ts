import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AuthTokenPayload } from '../utils/types.js';
import jwt from 'jsonwebtoken';

export function requireAccessAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const accessToken = req.cookies?.['access_token'];
    if (!accessToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as AuthTokenPayload;

    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.authUser = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function requiredRole(role: 'admin') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.authUser || req.authUser.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}
