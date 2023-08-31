import multer from "multer";
import path from "path";

export const multerImage = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname).toLocaleLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      return cb(
        new Error("Upload a valid image (.jpg, .jpeg, .png) and size not more than 5mb"),
        false
      );
    }
    cb(null, true);
  },
});
