import status, { HttpStatusClasses, HttpStatusExtra } from 'http-status';
import { Response } from 'express';
import ArchetypeError from './ArchetypeError';

interface httperrorsContent {
  message: string;
  description?: string;
  documentation?: string;
}

export class HttpError extends Error {
  class: string | number | HttpStatusClasses | HttpStatusExtra;
  status_code: number;
  reason_phrase: string | number | HttpStatusClasses | HttpStatusExtra;
  description: string | undefined;
  documentation: string | undefined;

  constructor(code: number, scopeError: httperrorsContent) {
    super(scopeError.message);
    this.name = this.constructor.name;

    this.status_code = code;
    this.reason_phrase = status[`${code}_NAME`];
    this.class = status[`${this.status_code}_CLASS`];
    this.description = scopeError.description;
    this.documentation = scopeError.documentation;
  }

  sendHttpErrorResponse(res: Response): void {
    res
      .status(this.status_code)
      .send(
        ArchetypeError.pack({ code: this.status_code, message: this.message })
      );
  }
}

export class ClientError extends HttpError {
  constructor(code: number, scopeError: httperrorsContent) {
    super(code, scopeError);
    this.class = status[`${code}_CLASS`];
  }
}

export class NotFoundError extends ClientError {
  static code = 404;

  constructor(scopeError: httperrorsContent) {
    super(NotFoundError.code, scopeError);
  }
}
