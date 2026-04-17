import 'dotenv/config';
import { z } from 'zod';

import {
  DEFAULT_DB_PORT,
  DEFAULT_NODE_ENV,
  DEFAULT_PORT,
  ENV_ERRORS,
  NODE_ENV_VALUES,
} from '@/shared/constants/env';

const envSchema = z.object({
  NODE_ENV: z.enum(NODE_ENV_VALUES).default(DEFAULT_NODE_ENV),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),

  DB_HOST: z.string().min(1, ENV_ERRORS.DB_HOST_REQUIRED),
  DB_PORT: z.coerce.number().int().positive().default(DEFAULT_DB_PORT),
  DB_NAME: z.string().min(1, ENV_ERRORS.DB_NAME_REQUIRED),
  DB_USER: z.string().min(1, ENV_ERRORS.DB_USER_REQUIRED),
  DB_PASSWORD: z.string().min(1, ENV_ERRORS.DB_PASSWORD_REQUIRED),
});

type Env = z.infer<typeof envSchema>;

const parsedEnv: ReturnType<typeof envSchema.safeParse> = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables:\n${parsedEnv.error.issues
      .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')}`,
  );
}

export const env: Env = parsedEnv.data;

export const isProduction = env.NODE_ENV === 'production';
