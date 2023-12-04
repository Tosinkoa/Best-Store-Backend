import cloudinary from "../LIB/cloudinary.js";

export const cloudinaryImageSaver = async (fileToSave, pathToSaveFile) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(fileToSave, { folder: pathToSaveFile }, (err, result) => {
      if (err) {
        console.log(`Cloudinary error while saving image: ${err}`);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export const cloudinaryImageDeleter = async (public_id, pathToDeleteFile) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, { folder: pathToDeleteFile }, (err, result) => {
      if (err) {
        console.log(`Cloudinary error while deleting image: ${err}`);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
