import { Request, Response, NextFunction } from 'express';
import AuthService from '@src/services/auth';
import ArchetypeError from '@src/util/errors/ArchetypeError';
import { userModel } from '@src/models/user';

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

export async function adm(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): Promise<void> {
  try {
    const userSpecific = await userModel.findById(req.decoded?._id);
    const roles = userSpecific?.role;
    const isAdm = roles?.includes('adm');
    if (isAdm) {
      next();
    } else {
      throw new Error('required administrative role.');
    }
  } catch (error) {
    res
      .status?.(403)
      .send(ArchetypeError.pack({ code: 403, message: error.message }));
  }
}
