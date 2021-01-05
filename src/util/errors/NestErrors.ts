import { Response } from 'express';
import mongoose from 'mongoose';
import logger from '@src/logger';
import ArchetypeError from '@src/util/errors/ArchetypeError';

export abstract class NestErrors {
  protected sendValidationErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    logger.error(error);
    if (error instanceof mongoose.Error.ValidationError) {
      res
        .status(422)
        .send(ArchetypeError.pack({ code: 422, message: error.message }));
    } else {
      res
        .status(500)
        .send(ArchetypeError.pack({ code: 500, message: error.message }));
    }
  }

  protected sendUnauthorizedErrorResponse(res: Response, error: Error): void {
    logger.error(error);
    res
      .status(401)
      .send(ArchetypeError.pack({ code: 401, message: error.message }));
  }
}
