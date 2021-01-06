import { Request, Response, NextFunction } from 'express';
import AuthService from '@src/services/auth';
import ArchetypeError from '@src/util/errors/ArchetypeError';

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  try {
    const bearer = req.headers?.authorization;
    const token = bearer?.replace('Bearer', '').trim();

    const decoded = AuthService.decodeToken(token as string);
    req.decoded = decoded;
    next();
  } catch (error) {
    res
      .status?.(401)
      .send(ArchetypeError.pack({ code: 401, message: error.message }));
  }
}
