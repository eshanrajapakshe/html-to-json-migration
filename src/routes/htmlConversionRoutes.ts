import { Router } from "express";
import { convertAllRecords, convertSingleRecord } from "../controllers/htmlConversionController";

const router = Router();

/**
 * @swagger
 * /api/convert-all:
 *   get:
 *     summary: Convert all records to JSON
 *     responses:
 *       200:
 *         description: Successfully updated all records
 */
router.get("/convert-all", convertAllRecords);

/**
 * @swagger
 * /api/convert/{id}:
 *   get:
 *     summary: Convert a single record to JSON by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully updated the record
 *       404:
 *         description: Record not found
 */
router.get("/convert/:id", convertSingleRecord);

export { router as htmlConversionRoutes };
