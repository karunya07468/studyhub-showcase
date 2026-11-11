import jwt from 'jsonwebtoken';
import { HttpError } from '../lib/errors.js';

export function createAuthMiddleware(secret) {
  return function authenticate(req, _res, next) {
    const value = req.get('authorization') || '';
    const token = value.startsWith('Bearer ') ? value.slice(7) : '';
    if (!token) return next(new HttpError(401, 'Sign in to continue.'));
    try {
      const payload = jwt.verify(token, secret);
      req.user = { id: String(payload.sub) };
      next();
    } catch {
      next(new HttpError(401, 'Your session expired. Please sign in again.'));
    }
  };
}
