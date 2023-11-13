import multer from "multer";


// using disk storage to save the file that is uploades by the user to the local storage

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
export const upload = multer({ storage })