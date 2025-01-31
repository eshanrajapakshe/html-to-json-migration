"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.failureLogger = exports.logger = void 0;
const winston_1 = require("winston");
const logger = (0, winston_1.createLogger)({
    level: "info",
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })),
    transports: [
        new winston_1.transports.Console(),
        new winston_1.transports.File({ filename: "logs/app.log" }),
    ],
});
exports.logger = logger;
const failureLogger = (0, winston_1.createLogger)({
    level: "error",
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json()),
    transports: [new winston_1.transports.File({ filename: "logs/failed_records.log" })],
});
exports.failureLogger = failureLogger;
