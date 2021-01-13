import {
  ClassMiddleware,
  Controller,
  Get,
  Middleware,
  Post,
  Put,
} from '@overnightjs/core';
import { hostingModel } from '@src/models/orphanhosting';
import { pictureModel } from '@src/models/picture';
import { Request, Response } from 'express';
import host, { matchPictures } from '@src/view/host';
import { NestErrors } from '@src/util/errors/NestErrors';
import { adm, authorize } from '@src/middlewares/auth';

@Controller('hosting')
@ClassMiddleware(authorize)
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
    const result = await host.rated_hosting();
    res.status(200).send(result);
  }
  @Get('pending')
  @Middleware(adm)
  public async pending(req: Request, res: Response): Promise<void> {
    const result = await host.pending_hosting();
    res.status(200).send(result);
  }
  @Put('update')
  @Middleware(adm)
  public async update(req: Request, res: Response): Promise<void> {
    const hostingExpected = { ...req.body, ...{ pending: false } };
    await hostingModel.findByIdAndUpdate(req.query._id, hostingExpected, {
      new: true,
    });

    const multerPictures = req.files as Express.Multer.File[];
    const dbPictures = await pictureModel.find({
      _idHosting: req.query._id,
    });
    let match = 0;
    const vectorMatch: matchPictures[] = [];
    for (const [index, idPicture] of dbPictures.entries()) {
      vectorMatch[index] = {
        id: idPicture._id,
        count: 0,
      };
    }
    for (const mpic of multerPictures) {
      for (const [index, pic] of dbPictures.entries()) {
        if (pic.filename.indexOf(mpic.originalname) > -1) {
          match = 1;
          vectorMatch[index].count = vectorMatch[index].count + 1;
        }
      }
      if (match === 0) {
        //save picture
        const storedPhoto = new pictureModel({
          _idHosting: req.query._id,
          destination: mpic.destination,
          filename: mpic.filename,
          size: mpic.size,
        });
        await storedPhoto.save();
      }
      match = 0;
    }
    for (const deletePicture of vectorMatch) {
      if (deletePicture.count === 0)
        await pictureModel.findByIdAndRemove(deletePicture.id);
    }

    const result = await host.specificHosting(String(req.query._id));
    res.status(200).send(result);
  }
}
