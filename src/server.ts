import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import * as database from '@src/database';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.setupDatabase();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupControllers(): void {}

  private async setupDatabase(): Promise<void> {
    await database
      .connect()
      .then(() => console.log('📦 Successfully connected with database'));
  }

  public start(): void {
    this.app.listen(this.port, () => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      console.log('🌩️ Server listening on port: ' + this.port);
    });
  }
}
