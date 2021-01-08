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
      const identifiedError = this.manyMongooseValidationError(error);
      res
        .status(identifiedError.code)
        .send(ArchetypeError.pack(identifiedError));
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

  protected sendNotFoundErrorResponse(res: Response, error: Error): void {
    logger.error(error);
    res
      .status(404)
      .send(ArchetypeError.pack({ code: 404, message: error.message }));
  }

  private manyMongooseValidationError(
    error: mongoose.Error.ValidationError
  ): { code: number; message: string } {
    const keys = Object.keys(error.errors)[0];
    const kinds = error.errors[`${keys}`].kind;
    switch (kinds) {
      case 'required':
        return { code: 422, message: error.message };
      case 'duplicate':
        return { code: 409, message: error.message };
      default:
        return { code: 400, message: error.message };
    }
  }
}
