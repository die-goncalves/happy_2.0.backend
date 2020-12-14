/* eslint-disable @typescript-eslint/no-floating-promises */
import { SetupServer } from './server';
import config from 'config';
import logger from './logger';

enum ExitStatus {
  Failure = 1,
  Success = 0,
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `The application was shut down due to an unhandled promise: ${promise} and reason: ${reason}`
  );
  throw reason;
});

process.on('uncaughtException', (error) => {
  logger.error(
    `The application was shut down due to an uncaught exception: ${error}`
  );
  process.exit(ExitStatus.Failure);
});

(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    exitSignals.map((sig) =>
      process.on(sig, () => {
        server.close().then(
          () => {
            logger.info(`The application was shut down without errors`);
            process.exit(ExitStatus.Success);
          },
          (error) => {
            logger.error(
              `The application was shut down due to the error: ${error}`
            );
            process.exit(ExitStatus.Failure);
          }
        );
      })
    );
  } catch (error) {
    logger.error(`The application was shut down due to the error: ${error}`);
    process.exit(ExitStatus.Failure);
  }
})();
