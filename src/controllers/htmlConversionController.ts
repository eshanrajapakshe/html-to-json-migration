import { ENV } from "../config/env";
import { Request, Response } from "express";
import {
  convertHtmlToJson,
  processRecord,
} from "../services/htmlConversionService";
import { sql, getPool, connectToDatabase } from "../config/database";
import fastq from "fastq";
import { logger, failureLogger } from "../services/logger";

// Process all records
interface RecordRow {
  id: number;
  html: string;
}

let CONCURRENCY = 5;
const MIN_CONCURRENCY = 1;
const DEADLOCK_THRESHOLD = 3;
let deadlockCount = 0;

const queue = fastq<RecordRow, Error>(worker, CONCURRENCY);

async function worker(row: any, done: any, attempt = 1) {
  try {
    const jsonData = await convertHtmlToJson(row.html);
    const pool = await getPool();
    const transaction = pool.transaction();

    await transaction.begin();
    await transaction
      .request()
      .input("id", sql.NVarChar, row.id)
      .input("json", sql.NVarChar(sql.MAX), JSON.stringify(jsonData))
      .query(
        `UPDATE ${ENV.FULL_TABLE_NAME} 
         WITH (UPDLOCK, ROWLOCK, READPAST) 
         SET json = @json 
         WHERE id = @id`
      );
    await transaction.commit();

    logger.info(`✅ Processed ID: ${row.id}`);
    done();
  } catch (error: any) {
    logger.error(`❌ Error processing ID: ${row.id} - ${error.message}`);

    if (attempt >= 3) {
      failureLogger.error({
        id: row.id,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    if (error.message.includes("deadlocked")) {
      deadlockCount++;

      if (
        deadlockCount >= DEADLOCK_THRESHOLD &&
        CONCURRENCY > MIN_CONCURRENCY
      ) {
        CONCURRENCY--;
        logger.warn(
          `⚠️ High deadlocks detected. Reducing concurrency to ${CONCURRENCY}.`
        );
        queue.concurrency = CONCURRENCY;
        deadlockCount = 0;
      }

      if (attempt < 3) {
        const retryDelay = 200 * Math.pow(2, attempt);
        logger.warn(
          `🔄 Retrying ID: ${row.id} in ${retryDelay}ms (Attempt ${
            attempt + 1
          })`
        );
        setTimeout(() => worker(row, done, attempt + 1), retryDelay);
      } else {
        logger.error(`❌ Skipping ID: ${row.id} after 3 failed attempts.`);
        done(error);
      }
    } else {
      done(error);
    }
  }
}

export const convertAllRecords = async (req: Request, res: Response) => {
  try {
    async function processBatch(offset: number, batchSize: number) {
      try {
        const pool = await getPool();
        const result = await pool
          .request()
          .input("batchSize", sql.Int, batchSize)
          .input("offset", sql.Int, offset)
          .query(
            `SELECT id, html FROM ${ENV.FULL_TABLE_NAME} 
             WHERE json IS NULL 
             ORDER BY id 
             OFFSET @offset ROWS FETCH NEXT @batchSize ROWS ONLY`
          );

        if (result.recordset.length === 0) {
          logger.info("✅ All records processed!");
          return;
        }

        logger.info(
          `🔄 Processing batch starting at offset ${offset} with concurrency ${CONCURRENCY}...`
        );

        for (const row of result.recordset) {
          queue.push(row);
        }

        queue.drain = async () => {
          logger.info(`✅ Batch completed. Fetching next batch...`);
          processBatch(offset + batchSize, batchSize);
        };
      } catch (error: any) {
        logger.error("❌ Error fetching batch:", error.message);
      }
    }

    await processBatch(0, 100);
    res.send("Processing started!");
  } catch (err) {
    logger.error("❌ Error:", err);
    res.status(500).send("An error occurred while processing the request.");
  }
};

// Process a single record by ID
export const convertSingleRecord = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    await connectToDatabase();

    const queryResult = await new sql.Request()
      .input("id", sql.NVarChar, id)
      .query(
        `SELECT [id], [html], [json]
        FROM ${ENV.FULL_TABLE_NAME}
        WHERE [id] = @id;`
      );

    if (queryResult.recordset.length === 0) {
      return res.status(404).send(`Record with ID ${id} not found.`);
    }

    const { html, json } = queryResult.recordset[0];

    if (json) {
      return res.send(`Record with ID ${id} already has JSON data.`);
    }

    await processRecord(id, html);

    return res.send(`Record with ID ${id} updated successfully!`);
  } catch (err) {
    logger.error(`Error on process a single record by ID: ${id}`, err);
    return res
      .status(500)
      .send(`An error occurred while processing the request. ${err}`);
  }
};
