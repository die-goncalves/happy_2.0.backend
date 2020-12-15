import { Controller, Post } from '@overnightjs/core';
import { OrphanHosting } from '@src/models/OrphanHosting';
import { Request, Response } from 'express';

@Controller('orphan_hosting')
export class OrphanHostingController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    const orphan_hosting = new OrphanHosting(req.body);
    const result = await orphan_hosting.save();
    res.status(201).send(result);
  }
}
