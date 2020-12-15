import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';

@Controller('orphan_hosting')
export class OrphanHostingController {
  @Post('')
  public create(req: Request, res: Response): void {
    res.status(201).send(req.body);
  }
}
