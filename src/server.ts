import './util/module-alias';
import { Server } from '@overnightjs/core';
import * as database from '@src/database';
import config, { IConfig } from 'config';
import logger from './logger';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import * as http from 'http';
import express, { Application } from 'express';
import { OrphanHostingController } from './controllers/orphan_hosting';
import multer from 'multer';
import uploadConfig from '@src/util/upload';
import { UserController } from './controllers/users';

const upload = multer(uploadConfig);
const serverConfig: IConfig = config.get('App');

export class SetupServer extends Server {
  private server?: http.Server;

  constructor(private port = serverConfig.get('port')) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.setupDatabase();
  }

  private setupExpress(): void {
    this.app.use(upload.array('pictures'));
    this.app.use('/uploads', express.static('uploads'));
    this.app.use(
      expressPino({
        logger,
      })
    );
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupControllers(): void {
    const orphanhostingController = new OrphanHostingController();
    const userController = new UserController();
    this.addControllers([orphanhostingController, userController]);
  }

  private async setupDatabase(): Promise<void> {
    await database
      .connect()
      .then(() => logger.info('📦 Successfully connected with database'));
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`🌩️ Server listening on port: ${this.port}`);
    });
  }

  public async close(): Promise<void> {
    await database.close();
    if (this.server) {
      await new Promise<void>((resolve, reject) => {
        this.server?.close((err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    }
  }

  public getApp(): Application {
    return this.app;
  }
}
