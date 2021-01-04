import { Controller, Post } from '@overnightjs/core';
import { Response, Request } from 'express';
import { userModel } from '@src/models/user';

@Controller('user')
export class UserController {
  @Post('create')
  public async create(req: Request, res: Response): Promise<void> {
    const user = new userModel(req.body);
    const newUser = await user.save();
    res.status(201).send(newUser);
  }
}
