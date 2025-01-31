"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSingleRecord = exports.convertAllRecords = void 0;
const env_1 = require("../config/env");
const htmlConversionService_1 = require("../services/htmlConversionService");
const database_1 = require("../config/database");
const fastq_1 = __importDefault(require("fastq"));
const logger_1 = require("../services/logger");
let CONCURRENCY = 5;
const MIN_CONCURRENCY = 1;
const DEADLOCK_THRESHOLD = 3;
let deadlockCount = 0;
const queue = (0, fastq_1.default)(worker, CONCURRENCY);
async function worker(row, done, attempt = 1) {
    try {
        const jsonData = await (0, htmlConversionService_1.convertHtmlToJson)(row.html);
        const pool = await (0, database_1.getPool)();
        const transaction = pool.transaction();
        await transaction.begin();
        await transaction
            .request()
            .input("id", database_1.sql.NVarChar, row.id)
            .input("json", database_1.sql.NVarChar(database_1.sql.MAX), JSON.stringify(jsonData))
            .query(`UPDATE ${env_1.ENV.FULL_TABLE_NAME} 
         WITH (UPDLOCK, ROWLOCK, READPAST) 
         SET json = @json 
         WHERE id = @id`);
        await transaction.commit();
        logger_1.logger.info(`✅ Processed ID: ${row.id}`);
        done();
    }
    catch (error) {
        logger_1.logger.error(`❌ Error processing ID: ${row.id} - ${error.message}`);
        if (attempt >= 3) {
            logger_1.failureLogger.error({
                id: row.id,
                error: error.message,
                timestamp: new Date().toISOString(),
            });
        }
        if (error.message.includes("deadlocked")) {
            deadlockCount++;
            if (deadlockCount >= DEADLOCK_THRESHOLD &&
                CONCURRENCY > MIN_CONCURRENCY) {
                CONCURRENCY--;
                logger_1.logger.warn(`⚠️ High deadlocks detected. Reducing concurrency to ${CONCURRENCY}.`);
                queue.concurrency = CONCURRENCY;
                deadlockCount = 0;
            }
            if (attempt < 3) {
                const retryDelay = 200 * Math.pow(2, attempt);
                logger_1.logger.warn(`🔄 Retrying ID: ${row.id} in ${retryDelay}ms (Attempt ${attempt + 1})`);
                setTimeout(() => worker(row, done, attempt + 1), retryDelay);
            }
            else {
                logger_1.logger.error(`❌ Skipping ID: ${row.id} after 3 failed attempts.`);
                done(error);
            }
        }
        else {
            done(error);
        }
    }
}
const convertAllRecords = async (req, res) => {
    try {
        async function processBatch(offset, batchSize) {
            try {
                const pool = await (0, database_1.getPool)();
                const result = await pool
                    .request()
                    .input("batchSize", database_1.sql.Int, batchSize)
                    .input("offset", database_1.sql.Int, offset)
                    .query(`SELECT id, html FROM ${env_1.ENV.FULL_TABLE_NAME} 
             WHERE json IS NULL 
             ORDER BY id 
             OFFSET @offset ROWS FETCH NEXT @batchSize ROWS ONLY`);
                if (result.recordset.length === 0) {
                    logger_1.logger.info("✅ All records processed!");
                    return;
                }
                logger_1.logger.info(`🔄 Processing batch starting at offset ${offset} with concurrency ${CONCURRENCY}...`);
                for (const row of result.recordset) {
                    queue.push(row);
                }
                queue.drain = async () => {
                    logger_1.logger.info(`✅ Batch completed. Fetching next batch...`);
                    processBatch(offset + batchSize, batchSize);
                };
            }
            catch (error) {
                logger_1.logger.error("❌ Error fetching batch:", error.message);
            }
        }
        await processBatch(0, 100);
        res.send("Processing started!");
    }
    catch (err) {
        logger_1.logger.error("❌ Error:", err);
        res.status(500).send("An error occurred while processing the request.");
    }
};
exports.convertAllRecords = convertAllRecords;
// Process a single record by ID
const convertSingleRecord = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, database_1.connectToDatabase)();
        const queryResult = await new database_1.sql.Request()
            .input("id", database_1.sql.NVarChar, id)
            .query(`SELECT [id], [html], [json]
        FROM ${env_1.ENV.FULL_TABLE_NAME}
        WHERE [id] = @id;`);
        if (queryResult.recordset.length === 0) {
            return res.status(404).send(`Record with ID ${id} not found.`);
        }
        const { html, json } = queryResult.recordset[0];
        if (json) {
            return res.send(`Record with ID ${id} already has JSON data.`);
        }
        await (0, htmlConversionService_1.processRecord)(id, html);
        return res.send(`Record with ID ${id} updated successfully!`);
    }
    catch (err) {
        logger_1.logger.error(`Error on process a single record by ID: ${id}`, err);
        return res
            .status(500)
            .send(`An error occurred while processing the request. ${err}`);
    }
};
exports.convertSingleRecord = convertSingleRecord;
