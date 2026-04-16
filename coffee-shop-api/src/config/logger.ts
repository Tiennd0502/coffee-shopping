import { addColors, createLogger, format, transports } from 'winston';

import { requestAsyncContext } from '@/shared/utils/request-async-context';

const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

const customColors: Record<keyof typeof customLevels, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'gray',
};

addColors(customColors);

const injectRequestContext = format((info) => {
  const store = requestAsyncContext.getStore();
  if (store) {
    Object.assign(info, { requestId: store.requestId });
  }
  return info;
});

const isProduction = process.env.NODE_ENV === 'production';

const devFormat = format.combine(
  injectRequestContext(),
  format.colorize({ all: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info) => {
    const requestId = typeof info.requestId === 'string' ? `[${info.requestId}] ` : '';
    const service = typeof info.service === 'string' ? `[${info.service}] ` : '';
    const message = typeof info.message === 'string' ? info.message : String(info.message);
    return `${String(info.timestamp)} ${requestId}${service}${info.level}: ${message}`;
  }),
);

const prodFormat = format.combine(injectRequestContext(), format.timestamp(), format.json());

/**
 * Shared Winston logger with custom levels: error, warn, info, http, debug.
 * Each log line includes `requestId` when emitted inside `requestAsyncContext.run`.
 */
export const logger = createLogger({
  levels: customLevels,
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  format: isProduction ? prodFormat : devFormat,
  transports: [new transports.Console({ stderrLevels: ['error'] })],
});

/**
 * Create a child logger scoped to a specific service/module.
 * Adds `service` field to every log line for easy filtering.
 *
 * @example
 * const log = createModuleLogger('UserService');
 * log.info('User created', { userId: '123' });
 */
export const createModuleLogger = (service: string) => logger.child({ service });
