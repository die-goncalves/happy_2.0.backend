import { Controller, Get, Post } from '@overnightjs/core';
import { hostingModel } from '@src/models/orphanhosting';
import { pictureModel } from '@src/models/picture';
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
  public async upload_files(req: Request, res: Response): Promise<void> {
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
      photo_data.push({ filename: photo.filename, _id: storedPhoto._id });
      await storedPhoto.save();
    });
    const result =
      photo_data.length == 0
        ? { ...storedData.toObject() }
        : { ...storedData.toObject(), pictures: photo_data };
    res.status(201).send(result);
  }
  @Get('show')
  public async show(req: Request, res: Response): Promise<void> {
    const foundHosting = await hostingModel.findById(req.query._id);
    const foundPictures = await pictureModel.find({
      _idHosting: req.query._id,
    });
    const foundPicturesObjects = foundPictures.map((pics) => pics.toObject());
    const result =
      foundPictures.length == 0
        ? { ...foundHosting?.toObject() }
        : { ...foundHosting?.toObject(), pictures: foundPicturesObjects };
    res.status(200).send(result);
  }
}
