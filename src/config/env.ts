import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: envFile });

export const ENV = {
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  SERVER: process.env.DB_SERVER,
  DATABASE: process.env.DB_DATABASE,
  FULL_TABLE_NAME: process.env.DB_TABLE,
  TABLE_JSON_COLUMN: process.env.DB_TABLE_JSON_COLUMN,
  ENCRYPT: process.env.DB_ENCRYPT,
  PORT: process.env.PORT,
};
