import { Response } from 'express';

export class CustomErrors extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  sendCustomErrorsResponse(res: Response): void {
    res.send({ message: this.message });
  }
}

export class PasswordsNotMatchError extends CustomErrors {
  constructor(message: string) {
    super(message);
  }
}
