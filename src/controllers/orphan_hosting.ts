import {
  Controller,
  Delete,
  Get,
  Middleware,
  Post,
  Put,
} from '@overnightjs/core';
import { hostingModel } from '@src/models/orphanhosting';
import { pictureModel } from '@src/models/picture';
import { Request, Response } from 'express';
import host from '@src/view/host';
import { ValidationErrors } from '@src/util/errors/ValidationErrors';
import { adm, authorize } from '@src/middlewares/auth';

@Controller('hosting')
export class OrphanHostingController extends ValidationErrors {
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
  @Middleware([authorize, adm])
  public async pending(req: Request, res: Response): Promise<void> {
    const result = await host.pending_hosting();
    res.status(200).send(result);
  }
  @Put('confirm')
  @Middleware([authorize, adm])
  public async confirm(req: Request, res: Response): Promise<void> {
    const hostingExpected = { ...req.body, ...{ pending: false } };
    await hostingModel.findByIdAndUpdate(req.query._id, hostingExpected, {
      new: true,
    });

    const result = await host.specificHosting(String(req.query._id));
    res.status(200).send(result);
  }
  @Put('update')
  @Middleware([authorize, adm])
  public async update(req: Request, res: Response): Promise<void> {
    const hostingExpected = { ...req.body, ...{ pending: false } };
    await hostingModel.findByIdAndUpdate(req.query._id, hostingExpected, {
      new: true,
    });
    const photos = req.files as Express.Multer.File[];
    photos.map(async (photo) => {
      const storedPhoto = new pictureModel({
        _idHosting: req.query._id,
        destination: photo.destination,
        filename: photo.filename,
        size: photo.size,
      });
      await storedPhoto.save();
    });

    const result = await host.specificHosting(String(req.query._id));
    res.status(200).send(result);
  }
  @Delete('delete')
  @Middleware([authorize, adm])
  public async delete(req: Request, res: Response): Promise<void> {
    await hostingModel.findByIdAndRemove(req.query._id);
    await pictureModel.deleteMany({ _idHosting: req.query._id });

    res.status(200).send({
      info: 'Successfully deleted',
    });
  }
  @Delete('picture')
  @Middleware([authorize, adm])
  public async delete_pictures(req: Request, res: Response): Promise<void> {
    await pictureModel.findByIdAndRemove(req.query.delete);

    res.status(200).send({
      info: 'Successfully deleted',
    });
  }
}
