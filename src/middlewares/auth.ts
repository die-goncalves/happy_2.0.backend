import { Request, Response, NextFunction } from 'express';
import AuthService from '@src/services/auth';

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  const bearer = req.headers?.authorization;
  const token = bearer?.replace('Bearer', '').trim();

  const decoded = AuthService.decodeToken(token as string);
  req.decoded = decoded;
  next();
}
