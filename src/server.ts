import './util/module-alias';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public init(): void {
    this.setupExpress();
    this.setupControllers();
    this.setupDatabase();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupControllers(): void {}
  private setupDatabase(): void {}

  public start(): void {
    this.app.listen(this.port, () => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      console.log('🌩️ Server listening on port: ' + this.port);
    });
  }
}
