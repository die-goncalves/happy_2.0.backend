import { Controller, Get, Post } from '@overnightjs/core';
import { hostingModel } from '@src/models/orphanhosting';
import { picture, pictureModel } from '@src/models/picture';
import { Request, Response } from 'express';
import host from '@src/view/host';

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
  }
  @Get('show')
  public async show(req: Request, res: Response): Promise<void> {
    const result = await host.specificHosting(String(req.query._id));
    res.status(200).send(result);
  }
  @Get('')
  public async index(req: Request, res: Response): Promise<void> {
    let typeHost;
    const allHost = new Array();
    const foundHosting = await hostingModel.find({});
    for (const host of foundHosting) {
      const foundPictures = await pictureModel.find({
        _idHosting: host._id,
      });
      const foundPicturesObjects = foundPictures.map((pic) => {
        const filterPic: picture = {
          _id: pic._id,
          destination: pic.destination,
          filename: pic.filename,
        };
        return filterPic;
      });
      foundPicturesObjects.length == 0
        ? (typeHost = {
            ...host?.toObject(),
          })
        : (typeHost = {
            ...host?.toObject(),
            pictures: foundPicturesObjects,
          });
      allHost.push(typeHost);
    }
    res.status(200).send(allHost);
  }
}
