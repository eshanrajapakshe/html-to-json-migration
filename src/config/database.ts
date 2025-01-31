import { ENV } from "./env";
import sql, { config, ConnectionPool } from "mssql";

const dbConfig: config = {
  user: ENV.USER,
  password: ENV.PASSWORD,
  server: ENV.SERVER!,
  database: ENV.DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
};

let poolPromise: Promise<ConnectionPool>;

const getPool = async (): Promise<ConnectionPool> => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        console.log("✅ Database connection successful!");
        return pool;
      })
      .catch((err) => {
        console.error("❌ Database Connection Failed:", err);
        throw err;
      });
  }
  return poolPromise;
};

const connectToDatabase = async (): Promise<void> => {
  try {
    await sql.connect(dbConfig);
    console.log("✅ Database connection successful!");
  } catch (err) {
    console.error("❌ Database Connection Failed:", err);
    throw err;
  }
};

export { sql, getPool, connectToDatabase };
