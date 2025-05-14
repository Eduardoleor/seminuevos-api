import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import { router } from "./routes";
import { validateEnvVariables } from "./utils/validateEnvVariables";

import * as swaggerDocument from "../swagger/swagger.json";

dotenv.config();
validateEnvVariables();

const app: Application = express();
const port = process.env.PORT || 3333;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api", router);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the API of Seminuevos");
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
