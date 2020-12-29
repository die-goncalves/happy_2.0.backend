import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class BaseController {
  protected sendErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).send({ code: 400, message: error.message });
    } else {
      res.status(500).send({ code: 500, message: 'Something went wrong!' });
    }
  }
}
