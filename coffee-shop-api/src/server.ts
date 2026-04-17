import 'dotenv/config';

import { app } from '@/app';
import { logger } from '@/config/logger';
import { DEFAULT_PORT } from '@/config/app';

const PORT = Number(process.env.PORT) || DEFAULT_PORT;

const startServer = async (): Promise<void> => {
  console.log('process.env.NODE_ENV', process.env.NODE_ENV);
  app.listen(PORT, () => {
    logger.info(`Server listening on http://localhost:${String(PORT)}`);
  });
};

void startServer();
