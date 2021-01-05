import { Controller, Post } from '@overnightjs/core';
import { Response, Request } from 'express';
import { userModel } from '@src/models/user';
import { NestErrors } from '@src/util/errors/NestErrors';
import AuthService from '@src/services/auth';

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
  public async authenticate(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return;
    }

    const isValidPassword = await AuthService.comparePasswords(
      password,
      user.password
    );
    if (!isValidPassword) {
      return;
    }

    const token = AuthService.generateToken(user.toObject());
    res.status(200).send({ token: token });
  }
}
