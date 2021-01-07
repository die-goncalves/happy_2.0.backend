import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import { Response, Request } from 'express';
import { userModel } from '@src/models/user';
import { NestErrors } from '@src/util/errors/NestErrors';
import AuthService from '@src/services/auth';
import { authMiddleware } from '@src/middlewares/auth';

@Controller('user')
export class UserController extends NestErrors {
  @Post('create')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new userModel(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser.toObject());
    } catch (error) {
      this.sendValidationErrorResponse(res, error);
    }
  }
  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await userModel.findOne({ email });
      if (!user) {
        throw new Error('user not found!');
      }

      const isValidPassword = await AuthService.comparePasswords(
        password,
        user.password
      );
      if (!isValidPassword) {
        throw new Error('passwords does not match!');
      }

      const token = AuthService.generateToken(user.toObject());
      res.status(200).send({ token: token });
    } catch (error) {
      this.sendUnauthorizedErrorResponse(res, error);
    }
  }
  @Get('me')
  @Middleware(authMiddleware)
  public async me(req: Request, res: Response): Promise<void> {
    const id = req.decoded ? req.decoded._id : undefined;
    const user = await userModel.findById(id);
    if (!user) {
      res
        .status(404)
        .send({ code: 404, name: 'NOT_FOUND', message: 'user not found!' });
    }
    res.status(200).send(user?.toObject());
  }
}
