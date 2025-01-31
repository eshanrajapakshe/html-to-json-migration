"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = exports.getPool = exports.sql = void 0;
const env_1 = require("./env");
const mssql_1 = __importDefault(require("mssql"));
exports.sql = mssql_1.default;
const dbConfig = {
    user: env_1.ENV.USER,
    password: env_1.ENV.PASSWORD,
    server: env_1.ENV.SERVER,
    database: env_1.ENV.DATABASE,
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
let poolPromise;
const getPool = async () => {
    if (!poolPromise) {
        poolPromise = new mssql_1.default.ConnectionPool(dbConfig)
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
exports.getPool = getPool;
const connectToDatabase = async () => {
    try {
        await mssql_1.default.connect(dbConfig);
        console.log("✅ Database connection successful!");
    }
    catch (err) {
        console.error("❌ Database Connection Failed:", err);
        throw err;
    }
};
exports.connectToDatabase = connectToDatabase;
