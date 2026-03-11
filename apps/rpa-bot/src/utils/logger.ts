import winston from "winston";
import { config } from "../config/env.js";

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom Log Format
 */
const logFormat = printf(({ level, message, timestamp, stack }) => {
  const msg = stack || message;
  return `${timestamp} [${level}]: ${msg}`;
});

/**
 * Winston Logger Instance
 */
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Console Output (colored)
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // File Output (production logs)
    new winston.transports.File({
      filename: config.LOG_FILE,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Log Helper with Registration Context
 */
export function createRegistrationLogger(registrationId: string) {
  return {
    info: (message: string) =>
      logger.info(`[${registrationId}] ${message}`),
    error: (message: string, error?: unknown) =>
      logger.error(`[${registrationId}] ${message}`, error),
    warn: (message: string) =>
      logger.warn(`[${registrationId}] ${message}`),
    debug: (message: string) =>
      logger.debug(`[${registrationId}] ${message}`),
  };
}
