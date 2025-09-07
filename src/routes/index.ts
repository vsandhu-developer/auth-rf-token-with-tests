import { Router } from "express";
import AuthRouter from "../services/auth.service";

const RouterHandler: Router = Router();

RouterHandler.use("/api/v1/auth", AuthRouter);

export default RouterHandler;
