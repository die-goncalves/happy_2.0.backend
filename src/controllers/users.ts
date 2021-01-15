import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import { Response, Request } from 'express';
import { userModel } from '@src/models/user';
import { NestErrors } from '@src/util/errors/NestErrors';
import authenticateService from '@src/services/auth';
import { authorize } from '@src/middlewares/auth';
import mail from '@src/modules/mailer';

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

      const isValidPassword = await authenticateService.comparePasswords(
        password,
        user.password
      );
      if (!isValidPassword) {
        throw new Error('passwords does not match!');
      }

      const token = authenticateService.generateToken({ _id: user._id });
      res.status(200).send({ token: token });
    } catch (error) {
      this.sendUnauthorizedErrorResponse(res, error);
    }
  }
  @Get('me')
  @Middleware(authorize)
  public async me(req: Request, res: Response): Promise<void> {
    try {
      const id = req.decoded ? req.decoded._id : undefined;
      const user = await userModel.findById(id);
      if (!user) {
        throw new Error('user not found!');
      }
      res.status(200).send(user?.toObject());
    } catch (error) {
      this.sendNotFoundErrorResponse(res, error);
    }
  }
  @Post('forgot-password')
  @Middleware(authorize)
  public async forgot_password(req: Request, res: Response): Promise<void> {
    try {
      const email: string = req.body.email;

      //Check if the email is registered in the database
      const user = await userModel.findOne({ email });
      if (!user) {
        throw new Error('user not found!');
      }
      //Expiration date
      const now = new Date();
      now.setHours(now.getHours() + 1);

      //Generation of token for the user to change the password
      const token = authenticateService.generateToken({
        emailAddress: email,
        expirationDate: now,
      });
      const link = `http://localhost:3000/reset-password?t=${token}`;

      mail
        .send({
          template: 'auth',
          message: {
            to: email,
          },
          locals: {
            username: user.username,
            link: link,
          },
        })
        .then(() => res.status(200).send({ token: token }))
        .catch((error) => {
          res.send({ error });
        });
    } catch (error) {
      this.sendNotFoundErrorResponse(res, error);
    }
  }
}
