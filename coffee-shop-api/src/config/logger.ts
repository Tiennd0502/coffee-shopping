import { addColors, createLogger, format, transports } from 'winston';

import { isProduction } from '@/config/env';
import { FORMAT_DATE } from '@/shared/constants/date';
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

const SKIP_META_KEYS = new Set(['timestamp', 'level', 'message', 'service', 'requestId']);

const injectRequestContext = format((info) => {
  const store = requestAsyncContext.getStore();
  if (store) {
    Object.assign(info, { requestId: store.requestId });
  }
  return info;
});

const devFormat = format.combine(
  injectRequestContext(),
  format.colorize({ all: true }),
  format.timestamp({ format: FORMAT_DATE.TIMESTAMP }),
  format.printf((info) => {
    const requestId = typeof info.requestId === 'string' ? `[${info.requestId}] ` : '';
    const service = typeof info.service === 'string' ? `[${info.service}] ` : '';
    const message = typeof info.message === 'string' ? info.message : String(info.message);
    const meta = JSON.stringify(info, (k, v) =>
      k === '' || !SKIP_META_KEYS.has(k) ? v : undefined,
    );
    const metaStr = meta !== '{}' ? ` ${meta}` : '';
    return `${String(info.timestamp)} ${requestId}${service}${info.level}: ${message}${metaStr}`;
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
