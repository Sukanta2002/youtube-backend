import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();


// To set the cors 

// In the options give the origine and credentials
app.use(cors({
    origin: process.env.CORS_ORIGINE,
    credentials: true,
}));

// Use to limit the json size that the load is very low
app.use(express.json({ limit: "16kb" }));
// This is used to recive the data in url format
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// It is used to add all the file and folder in a public folder
app.use(express.static("public"));
// used to initialized the cookieParser
app.use(cookieParser());


// Imprting the user router
import userRoute from "./routes/user.routes.js";

// making the router work
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRoute);
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

export { app };