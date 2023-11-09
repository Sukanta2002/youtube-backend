import { app } from "./app.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({ path: "./env" });



connectDB()
    .then(() => {

        app.on("error", () => {
            console.log(`Some Error occoured when starting the express server`);
        });

        app.listen(process.env.PORT || 8000, () => {
            console.log(`The server is listening on potr : ${process.env.PORT}`);
        });

    })
    .catch((error) => {
        console.log("Some Error Occoured in MongoDB !!!", error);
    });




















// First approch
/*
// Import dotenv using ES6 module
import dotenv from "dotenv";
// configuring it to make it run
dotenv.config();

// we can make a function and execute it below bu it will be not a good approch to do.
//so, we will make IIFE(Immediately Invoked Function Expressions) to execute it immediately

// we can use express to make some error handling and listening at the same time.
import expprss from "express";
const app = expprss();

// Use async and await to make db connection.
// Because the "Database is in the another continent" by Hitesh Sir.
// It will take time to make the connection.
;(async () => {
    // Alwaya use try catch to make db connection in your project.
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

        // To Check if some error occoured in the express.
        app.on("error",(error) => {
            console.log("Some Error occoured in express : ",error);
            throw error;
        });

        // add a listener to see if the express is listening on the port or not
        app.listen(process.env.PORT, () => {
            console.log(`The app is stared at port : ${process.env.PORT}`);
        });
    } catch (error) {
        console.log(`Some Error occoureed : ${error}`);
        throw error;
    }
})();
*/
