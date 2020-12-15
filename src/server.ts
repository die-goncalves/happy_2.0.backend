import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import * as database from '@src/database';
import config, { IConfig } from 'config';
import logger from './logger';
import expressPino from 'express-pino-logger';
import * as http from 'http';
import { Application } from 'express';
import { OrphanHostingController } from './controllers/orphan_hosting';

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
    this.app.use(bodyParser.json());
    this.app.use(
      expressPino({
        logger,
      })
    );
  }

  private setupControllers(): void {
    const orphanhostingController = new OrphanHostingController();
    this.addControllers([orphanhostingController]);
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
