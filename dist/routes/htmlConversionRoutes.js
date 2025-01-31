"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlConversionRoutes = void 0;
const express_1 = require("express");
const htmlConversionController_1 = require("../controllers/htmlConversionController");
const router = (0, express_1.Router)();
exports.htmlConversionRoutes = router;
/**
 * @swagger
 * /api/convert-all:
 *   get:
 *     summary: Convert all records to JSON
 *     responses:
 *       200:
 *         description: Successfully updated all records
 */
router.get("/convert-all", htmlConversionController_1.convertAllRecords);
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
router.get("/convert/:id", htmlConversionController_1.convertSingleRecord);
