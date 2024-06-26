import fs from "fs";
// Importing v2 as cloudinary from cloudinary
import { v2 as cloudinary } from "cloudinary";

//Configuring the cloudinary to upload the files to it.
// it takes cloud name, api key and api secret 
// we are going to store all this thengs in the .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// making an function to upload the file to cloudinary
const uploadOnCloudinary = async function (localFilePath) {
    // console.log(localFilePath);
    try {
        //if the path is empty return null
        if (!localFilePath) return null;

        //main code to upload file
        const responce = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // console.log(responce);
        fs.unlinkSync(localFilePath);
        return responce
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        console.log("Error on cloudnary");
        return null;
    }

}

// For deleting the file from the cloudinary
const deleteOnCloudinary = async function (url) {
    try {
        // check if url is present or not
        if (!url) return null;
        // get the public id from the public url of cloudinary
        const array = url.split("/")
        const publicId = array[array.length - 1].split(".")[0]

        //delete the file using cloudinary api
        const result = await cloudinary.uploader.destroy(publicId).then((result) => console.log(result))
        .catch((err) => console.log(err));

    } catch (error) {
        console.log("Error on deleting on cloudinary!!");
        return null;
    }
}

//export the function
export {
    uploadOnCloudinary,
    deleteOnCloudinary
}