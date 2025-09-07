import cookieParser from "cookie-parser";
import express, {
  urlencoded,
  type Application,
  type Request,
  type Response,
} from "express";
import logger from "./src/config/logger";
import RouterHandler from "./src/routes";

const app: Application = express();
const PORT = process.env.PORT || 8080;

// middlewares
app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

// Routes Middleware

app.use(RouterHandler);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({ message: "Server is running" });
});

app.listen(PORT, () =>
  logger.info(`Server is running on http:localhost:${PORT}`)
);

export default app;
