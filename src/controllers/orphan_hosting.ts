import { Controller, Post } from '@overnightjs/core';
import { hostingModel } from '@src/models/orphanhosting';
import { Request, Response } from 'express';

@Controller('hosting')
export class OrphanHostingController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    const orphan_hosting = new hostingModel(req.body);
    const result = await orphan_hosting.save();
    res.status(201).send(result);
  }
}
