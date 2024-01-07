import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const userModel = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String, //Image avater url from coludnery
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

// Write hooks to make the password secure using bcrypt
// Useing pre to make the changes before saving the password
userModel.pre("save", async function (next) {
    // check if the password field is changed 
    // we encrypt the password when only the password field is changed rather then encrypting the password when user save other thing.
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// To check the password is correct or not
// Inject a methord isPasswordCorrect to userModel and then compair the password 
userModel.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// Inject a methord generateAccessToken to userModel
userModel.methods.generateAccessToken = function () {
    return Jwt.sign(
        //payload
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullName
        },
        //secret key from .env file
        process.env.ACCESS_TOKEN_SECRET,
        //Expiry time also get from the .env file
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
// Inject a methord generateRefreshToken to userModel
userModel.methods.generateRefreshToken = function () {
    return Jwt.sign(
        //payload
        {
            _id: this._id
        },
        //secret key from .env file
        process.env.REFRESH_TOKEN_SECRET,
        //Expiry time also get from the .env file
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userModel);