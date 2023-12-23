import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAcessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const routes = Router();

routes.route("/register").post(upload.fields(
    [
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]
), registerUser);


routes.route("/login").post(loginUser);

// secured route -> the user must be verified before accessing the resources
routes.route("/logout").post(verifyJWT, logoutUser);
routes.route("/refresh-token").post(refreshAcessToken);

export default routes;