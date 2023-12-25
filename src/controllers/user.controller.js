import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
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

// For changing the password of the user
const updateCurrentPassword = asyncHandler(async (req, res) => {
    // Get the old password and the new password from the req.body
    const { oldPassword, newPassword } = req.body

    // check if the fields are not empty
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Password is required")
    }


    // get the use from the db
    const user = await User.findById(req.user._id)
    // Check if the new password is same with the password in the db
    // For checking we use User model 
    // In the User model their is a methord called isPassswordCorrect
    const isPassswordCorrect = await user.isPasswordCorrect(oldPassword);

    // Check if the password is not correct then send a error
    if (!isPassswordCorrect) {
        throw new ApiError(400, "Password is incorrect!!!")
    }

    // Update the password in the db
    user.password = newPassword
    // When we save the user after updating thepassword the pre methord in the user model is called
    // In the pre methord if the password is changed then the password is encrypted by the bcrypt 
    await user.save({
        validateBeforeSave: false // use of this line is to save as it is in the db and not to verify ererything in the db
    })

    // send the responce 
    return res
        .status(200)
        .json(
            new ApiResponce(200,
                {},
                "Password change Sucessfully!!")
        )
})

// For updating the fullname and the email
const updateAccountDetails = asyncHandler(async (req, res) => {
    // Get the new fullName and the email from the user by the body of req
    const { fullName, email } = req.body

    // Check the fullname and the email is exist
    if (!fullName || !email) {
        throw new ApiError(400, "Both field is required!!!")
    }

    // get the user id from the req because the verifyJWT middelware will inject the user to the req
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                email,
                fullName
            }
        },
        {
            new: true
        }
    ).select("-password")

    // check if the user is exist or not
    if (!user) {
        throw new ApiError(401, "Error updating in the db!!!")
    }

    // return the responce 
    return res
        .status(200)
        .json(
            new ApiResponce(
                200, user, "Email and Name updated Sucessfully!!!"
            )
        )

})

// For getting the user and Sending it back
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                req.user,
                "Current user fetched sucessfully!!!"
            )
        )
})

// updating the avatar image
const updateUserAvatar = asyncHandler(async (req, res) => {
    // get the local path of the avatar 
    const avatarLocalPath = req.file?.avatar
    // get the old avatar url
    const oldAvatarUrl = req.user?.avatar

    // check if we get the path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing!!!")
    }

    // upload to the cloudynary
    const avatarUrl = await uploadOnCloudinary(avatarLocalPath)

    // Check if the url exist
    if (!avatarUrl) {
        throw new ApiError(400, "Error when uploading file to the cloudynary!!!")
    }

    // Update the db with new avatar url
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatarUrl
            }
        },
        {
            new: true
        }
    ).select("-password")

    // Check if the user exist
    if (!user) {
        throw new ApiError(401, "Error when updating the avatar url in the db!!!")
    }

    // delete the image from the cloudinary
    await deleteOnCloudinary(oldAvatarUrl)

    // return the responce 
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                user,
                "Avatar updated Sucessfully!!!"
            )
        )
})

// Updating the cover image
const updateCoverImage = asyncHandler(async (req, res) => {
    // get the cover image local path from the req
    const coverImageLocalPath = req.file?.coverImage
    // get the old Cover image url
    const oldCoverImageUrl = req.user?.avatar

    // Check if the path exist 
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is missing!!!")
    }

    // upload it on the cloudnary
    const coverImageUrl = await uploadOnCloudinary(coverImageLocalPath)

    // Check if url is not empty
    if (!coverImageUrl) {
        throw new ApiError(400, "Error when uploding file on cloudynary!!!")
    }

    // update the url in the db
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImageUrl
            }
        },
        {
            new: true
        }
    ).select("-password")

    // Check if the user is exist
    if (!user) {
        throw new ApiError(200, "Error when updating the cover Image url in db!!!")
    }

    // delete the cover image 
    await deleteOnCloudinary(oldCoverImageUrl)

    // return the responce
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                user,
                "Cover image updated successfully!!!"
            )
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    updateCurrentPassword,
    updateAccountDetails,
    getCurrentUser,
    updateCoverImage,
    updateUserAvatar
} 