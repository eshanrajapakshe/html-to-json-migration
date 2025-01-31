"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env");
const express_1 = __importDefault(require("express"));
const htmlConversionRoutes_1 = require("./routes/htmlConversionRoutes");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Convert HTML Handbook to JSON API",
            version: "1.0.0",
            description: "Convert Handbook Section HTML content to JSON and manage database updates",
        },
    },
    apis: ["./src/routes/*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use(express_1.default.json());
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.use("/api", htmlConversionRoutes_1.htmlConversionRoutes);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
