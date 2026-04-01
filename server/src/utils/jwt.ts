import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

export function createAccessToken(userId: string, role: string) {
  return jwt.sign(
    {
      userId,
      role: role,
      type: 'access',
    },
    process.env.ACCESS_TOKEN_SECRET || 'ACCESS_TOKEN_SECRET',
    {
      expiresIn: '10m',
    },
  );
}

export function createRefreshToken(userId: string, role: string) {
  return jwt.sign(
    {
      userId,
      role: role,
      type: 'refresh',
    },
    process.env.REFRESH_TOKEN_SECRET || 'REFRESH_TOKEN_SECRET',
    {
      expiresIn: '7d',
    },
  );
}

export function createCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}
