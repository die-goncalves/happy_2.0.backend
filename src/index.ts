/* eslint-disable @typescript-eslint/no-floating-promises */
import { SetupServer } from './server';

(async (): Promise<void> => {
  const server = new SetupServer(3000);
  await server.init();
  server.start();
})();
