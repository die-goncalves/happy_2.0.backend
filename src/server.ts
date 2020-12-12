import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import * as database from '@src/database';
import config, { IConfig } from 'config';
import logger from './logger';
import expressPino from 'express-pino-logger';

const serverConfig: IConfig = config.get('App');

export class SetupServer extends Server {
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

  private setupControllers(): void {}

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
}
