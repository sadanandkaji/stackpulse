import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

export default app;