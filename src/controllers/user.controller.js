import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";


// To generate the access token and refresh token
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        // generate the accessToken and refreshToken
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        // update the refreshToken in the database
        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });

        // return the accessToken and refreshToken
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500, "Something went wrong!!")
    }
}

// For register the user
const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    const { fullName, username, password, email } = req.body;
    // validation - not empty
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All Fields are required!!");
    }
    // check if user already exists: username, email
    const existUser = await User.findOne({
        $or: [{ username, email }]
    })
    if (existUser) {
        throw new ApiError(409, "User already exist")
    }
    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // remove password and refresh token field from response
    // check for user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // return res
    res.status(200).json(
        new ApiResponce(200, createdUser, "User Registered Sucessfully")
    )
})
// For Login the user
const loginUser = asyncHandler(async (req, res) => {
    // Get the userId, email and password from the user via req.body
    const { email, username, password } = req.body

    // Check if the email or username is exist
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    // find the user from the database
    const user = await User.findOne({
        $or: [{ email }, { username }]
    }) // used to find both from email or username

    if (!user) {
        throw new ApiError(404, "User does not exist!!")
    }
    // verify  password from database 
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Credentials!!!");
    }
    // generate a refresh token 
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    // send res to the user
    const logedInUser = User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(200,
                {
                    user: logedInUser, accessToken, refreshToken
                },
                "User logged In Sucessfully"
            )
        )

})


// For logout the user
const logoutUser = asyncHandler(async (req, res) => {
    // Find the user and update the refresh token as undifinded
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponce(200, {}, "User loggedout!!!")
        )


})

// Refresh the access token
const refreshAcessToken = asyncHandler(async (req, res) => {
    // Get the refreshToken from cookie or body
    const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    //check if incomming refreshToken is not empty
    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    // decord the refresh token using the jwt
    const decodedRefreshToken = jwt.verify(
        incommingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    // get the user from the database 
    const user = await User.findById(decodedRefreshToken._id);

    // Check if the the user is present or not
    if (!user) {
        throw new ApiError(401, "Invalid Refresh token")
    }

    // check if the incomming refresh token and the refresh token saved in the db is same or not
    if (incommingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired")
    }

    // generate a new refresh and access token
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user?._id)

    // make the options for the cookies 
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200,
                {
                    accessToken,
                    refreshToken
                },
                "Access Token refreshed Succesfully!!!"
            )
        )

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAcessToken
} 