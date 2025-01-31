"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const envFile = process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv_1.default.config({ path: envFile });
exports.ENV = {
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    SERVER: process.env.DB_SERVER,
    DATABASE: process.env.DB_DATABASE,
    FULL_TABLE_NAME: process.env.DB_TABLE,
    TABLE_JSON_COLUMN: process.env.DB_TABLE_JSON_COLUMN,
    ENCRYPT: process.env.DB_ENCRYPT,
    PORT: process.env.PORT,
};
