import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/app.log" }),
  ],
});

const failureLogger = createLogger({
  level: "error",
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.File({ filename: "logs/failed_records.log" })],
});

export { logger, failureLogger };
