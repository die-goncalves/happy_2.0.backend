import { Controller, Post } from '@overnightjs/core';
import { hosting, hostingModel } from '@src/models/orphanhosting';
import { Request, Response } from 'express';

@Controller('hosting')
export class OrphanHostingController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    const orphan_hosting = new hostingModel(req.body);
    const result = await orphan_hosting.save();
    res.status(201).send(result);
  }
  @Post('create')
  public set(req: Request, res: Response): void {
    const photo_data = new Array();

    const storedData: hosting = {
      name: req.body.name,
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude),
      about: req.body.about,
      instructions: req.body.instructions,
      opening_hours: req.body.opening_hours,
      open_on_weekends: req.body.open_on_weekends === 'true',
    };

    const photos = req.files as Express.Multer.File[];
    photo_data.push({ filename: photos[0].filename });
    const result = { ...storedData, pictures: photo_data };
    res.status(201).send(result);
  }
}
