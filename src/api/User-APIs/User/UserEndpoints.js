import { UserAuthMiddleware } from "../../../Middlewares/UserMiddlewares.js";
import { cloudinaryImageSaver } from "../../../ReusableFunctions/cloudinaryAction.js";
import { UserQueries } from "./UserQueries.js";
import express from "express";
const router = express.Router();

router.put("/setup-profile", UserAuthMiddleware, async (req, res) => {
  const PROFILE_PICTURE = multerImage.single("profile_picture");
  PROFILE_PICTURE(req, res, async (err) => {
    const { first_name, last_name, phone_number } = req.body;
    const loggedInUser = req.session.user;

    if (err?.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "The max image size you can upload is 5mb" });
    }

    try {
      const loggedInUserData = await UserQueries.selectLoggedInUser([loggedInUser]);
      const userData = loggedInUserData.rows[0];

      let userProfilePicture;
      if (req.file) {
        userProfilePicture = await cloudinaryImageSaver(
          req.file.path,
          "best-store/bussinesses-logo"
        );
      }

      const profile_picture = req.file
        ? userProfilePicture.secure_url
        : userData.profile_picture;

      const profile_picture_key = req.file
        ? userProfilePicture.public_id
        : userData.profile_picture_key;

      await UserQueries.saveLoggedInUserData([
        first_name || userData.first_name,
        last_name || userData.last_name,
        phone_number || phone_number,
        profile_picture,
        profile_picture_key,
        loggedInUser,
      ]);

      return res.status(200).json({ message: "Setup updated successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Server error, try agin!" });
    }
  });
});

router.get("/get-logged-in-user", UserAuthMiddleware, async (req, res) => {
  const loggedInUser = req.session.user;
  try {
    const loggedInUserData = await UserQueries.selectLoggedInUser([loggedInUser]);
    return res.status(200).json({ data: loggedInUserData.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
