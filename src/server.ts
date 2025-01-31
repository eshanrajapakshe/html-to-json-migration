import "./config/env";
import express from "express";
import { htmlConversionRoutes } from "./routes/htmlConversionRoutes";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
const port = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Convert HTML Handbook to JSON API",
      version: "1.0.0",
      description:
        "Convert Handbook Section HTML content to JSON and manage database updates",
    },
  },
  apis: ["./src/routes/*.ts"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", htmlConversionRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
