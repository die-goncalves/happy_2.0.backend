import { Controller, Get, Post } from '@overnightjs/core';
import { hostingModel } from '@src/models/orphanhosting';
import { pictureModel } from '@src/models/picture';
import { Request, Response } from 'express';
import host from '@src/view/host';
import { NestErrors } from '@src/util/errors/NestErrors';

@Controller('hosting')
export class OrphanHostingController extends NestErrors {
  @Post('create')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const photo_data = new Array();

      const storedData = new hostingModel(req.body);
      await storedData.save();
      const photos = req.files as Express.Multer.File[];
      photos.map(async (photo) => {
        const storedPhoto = new pictureModel({
          _idHosting: storedData,
          destination: photo.destination,
          filename: photo.filename,
          size: photo.size,
        });
        photo_data.push({
          _id: storedPhoto._id,
          destination: photo.destination,
          filename: photo.filename,
        });
        await storedPhoto.save();
      });
      const result =
        photo_data.length == 0
          ? { ...storedData.toObject() }
          : { ...storedData.toObject(), pictures: photo_data };
      res.status(201).send(result);
    } catch (error) {
      this.sendValidationErrorResponse(res, error);
    }
  }
  @Get('show')
  public async show(req: Request, res: Response): Promise<void> {
    const result = await host.specificHosting(String(req.query._id));
    res.status(200).send(result);
  }
  @Get('')
  public async index(req: Request, res: Response): Promise<void> {
    const result = await host.allHosting();
    res.status(200).send(result);
  }
}
