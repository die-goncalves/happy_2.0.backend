import { Controller, Get, Middleware, Post, Put } from '@overnightjs/core';
import { Response, Request } from 'express';
import { userModel } from '@src/models/user';
import { NestErrors } from '@src/util/errors/NestErrors';
import authenticateService from '@src/services/auth';
import { authorize } from '@src/middlewares/auth';
import mail from '@src/modules/mailer';
import resetPasswordService from '@src/services/resetPassword';

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
  @Put('reset-password')
  public async reset_password(req: Request, res: Response): Promise<void> {
    try {
      const token = req.query.t;
      const { emailAddress } = resetPasswordService.decodeTokenForResetPassword(
        token as string
      );
      const user = await userModel.findOne({ email: emailAddress });
      if (!user) throw new Error('user not found!');

      if (req.body.new_password !== req.body.confirm_password)
        throw new Error('passwords does not match!');

      const newpass = await authenticateService.hashPassword(
        req.body.new_password
      );

      await userModel
        .findOneAndUpdate(
          { email: emailAddress },
          { password: newpass },
          { new: true, useFindAndModify: false }
        )
        .then((result) => res.status(200).send(result?.toObject()))
        .catch((err) => res.status(400).send(err));
    } catch (error) {
      if (error.message == 'user not found!') {
        this.sendNotFoundErrorResponse(res, error);
      } else {
        res.send({ message: error.message });
      }
    }
  }
}
