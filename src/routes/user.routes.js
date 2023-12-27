import { Router } from "express";
import { 
    loginUser,
    logoutUser, 
    registerUser, 
    refreshAcessToken, 
    updateCurrentPassword,
    updateAccountDetails,
    getCurrentUser,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
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
), registerUser)


routes.route("/login").post(loginUser)

// secured route -> the user must be verified before accessing the resources
routes.route("/logout").post(verifyJWT, logoutUser)
routes.route("/refresh-token").post(refreshAcessToken)
routes.route("/update-password").post(verifyJWT,updateCurrentPassword)
routes.route("/update-account").patch(verifyJWT,updateAccountDetails)
routes.route("/current-user").get(verifyJWT,getCurrentUser)
routes.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
routes.route("/update-cover-image").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)
routes.route("/channel/:userName").get(verifyJWT,getUserChannelProfile)
routes.route("/watch-history").get(verifyJWT,getWatchHistory)

export default routes;