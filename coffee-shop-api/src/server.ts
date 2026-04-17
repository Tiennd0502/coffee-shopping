import { app } from '@/app';
import AppDataSource from '@/config/database';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

const startServer = async (): Promise<void> => {
  const { PORT, DB_HOST, DB_PORT, DB_NAME } = env;
  await AppDataSource.initialize();

  logger.info('PostgreSQL database connected', {
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
  });

  app.listen(PORT, () => {
    logger.info(`Server listening on http://localhost:${String(PORT)}`);
  });
};

void startServer().catch((error: unknown) => {
  logger.error('Failed to start server', {
    error:
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : { message: String(error) },
  });
  process.exitCode = 1;
});
