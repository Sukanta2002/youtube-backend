import { Router } from "express";
import registerUser from "../controllers/register.controller.js";

const routes = Router();

routes.route("/register").post(registerUser);

export default routes;