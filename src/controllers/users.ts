import { Controller, Post } from '@overnightjs/core';
import { Response, Request } from 'express';
import { userModel } from '@src/models/user';
import { NestErrors } from '@src/util/errors/NestErrors';

@Controller('user')
export class UserController extends NestErrors {
  @Post('create')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new userModel(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser);
    } catch (error) {
      this.sendValidationErrorResponse(res, error);
    }
  }
  @Post('authenticate')
  public authenticate(req: Request, res: Response): void {
    res.status(200).send({ token: 'fake-token' });
  }
}
