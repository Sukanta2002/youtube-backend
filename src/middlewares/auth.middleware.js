import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async (req, _, next) => {
    // Get the token from the user
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // Check if the token is present or not 
    if (!token) {
        throw ApiError(401, "Unauthorized request");
    }

    // Decode the user 
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user from the database
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");

    // Check if user is present
    if (!user) {
        throw ApiError(401, "Invalid Access Token")
    }
    req.user = user;
    next();
})