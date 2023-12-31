import express from "express";
import { SellerQueries } from "./SellerQueries.js";
import { multerImage } from "../../../LIB/multer.js";
import cloudinary from "../../../LIB/cloudinary.js";
import pool from "../../../LIB/DB-Client.js";
import { UserAuthMiddleware } from "../../../Middlewares/UserMiddlewares.js";
import { validateSeller } from "../../../VALIDATOR/UserValidator/SellerValidator.js";
import { errorMessageGetter } from "../../../ReusableFunctions/errorMessageGetter.js";
const router = express.Router();

/**
 * @todo update the size of photo to upload here
 * @todo Add index to user name in the database
 * @todo Seller followers table
 * @todo Add License, remove MIT
 * @todo In settings table, buyer can click notification icon for allowing notifications
 *        from thier sellers
 */

const BUSINESS_LOGO = multerImage.single("business_logo");
router.post("/setup-seller-account", UserAuthMiddleware, (req, res) => {
  BUSINESS_LOGO(req, res, async (err) => {
    const { business_name, about, state, city } = req.body;
    const loggedInUser = req.session.user;

    if (err?.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "The max image size you can upload is 5mb" });
    }

    const client = await pool.connect();
    try {
      // Begin transaction
      await client.query("BEGIN");
      const userData = await SellerQueries.selectSeller(loggedInUser, client);
      const sellerData = userData.rows[0];

      // If user exist, update thier seller details.
      let sellerBusinessLogo;
      if (sellerData?.id) {
        // Upload image to CDN if file was added
        if (req.file) {
          try {
            await cloudinary.uploader.destroy(sellerData.business_logo_key);
            sellerBusinessLogo = await cloudinary.uploader.upload(req.file.path, {
              folder: "best-store/bussinesses-logo",
            });
          } catch (error) {
            // Catch CDN error if any exist
            console.log(error);
            return res
              .status(400)
              .json({ error: "An error occured while uploading image, try again!" });
          }
        }

        const business_logo = req.file
          ? sellerBusinessLogo.secure_url
          : sellerData.business_logo;
        const business_logo_key = req.file
          ? sellerBusinessLogo.public_id
          : sellerData.business_logo_key;

        await SellerQueries.updateSeller(
          [
            business_name || sellerBusinessLogo.business_name,
            business_logo || sellerBusinessLogo.business_logo,
            business_logo_key || sellerBusinessLogo.business_logo_key,
            about || sellerBusinessLogo.about,
            state || sellerBusinessLogo.state,
            city || sellerBusinessLogo.city,
            sellerData.id,
          ],
          client
        );
        await client.query("COMMIT");
        return res.status(200).json({ message: "Details updated successfully!" });
      } else {
        // Create new seller details
        const { error } = validateSeller(req.body);
        if (error) return res.status(400).json({ error: errorMessageGetter(error) });
        if (!req.file) return res.status(400).json({ error: "business_logo is required!" });
        // Upload image to CDN
        try {
          await SellerQueries.setUserAsSeller(["seller", loggedInUser], client);
          sellerBusinessLogo = await cloudinary.uploader.upload(req.file.path, {
            folder: "best-store/bussiness_logo",
          });
        } catch (error) {
          // Catch CDN error if any exist
          console.log(error);
          return res
            .status(400)
            .json({ error: "An error occured while uploading image, try again!" });
        }

        const business_logo = req.file
          ? sellerBusinessLogo.secure_url
          : sellerData.rows[0].profile_image;
        const business_logo_key = req.file
          ? sellerBusinessLogo.public_id
          : sellerData.rows[0].profile_image_id;

        await SellerQueries.insertNewSeller(
          [business_name, business_logo, business_logo_key, about, state, city, loggedInUser],
          client
        );

        await client.query("COMMIT");
        return res.status(200).json({ message: "Congrat!, you're now a seller." });
      }
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
      return res.status(500).json({ error: "Server error, try agin!" });
    } finally {
      client.release();
    }
  });
});

router.get("/get-a-seller/:seller_id", UserAuthMiddleware, async (req, res) => {
  let { seller_id } = req.params;
  seller_id = parseInt(seller_id);

  if (!seller_id)
    return res.status(400).json({ error: "seller_id is required and must be a number" });

  try {
    const selectedSeller = await SellerQueries.selectOneSeller(seller_id);
    if (selectedSeller.rowCount < 1) {
      return res.status(400).json({ error: "Seller doesn't exist!" });
    }
    return res.status(200).json({ data: selectedSeller.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.get("/get-logged-in-seller", UserAuthMiddleware, async (req, res) => {
  const loggedInUser = req.session.user;

  try {
    const selectedSeller = await SellerQueries.selectLoggedInSeller(loggedInUser);
    if (selectedSeller.rowCount < 1) {
      return res.status(400).json({ error: "Seller doesn't exist!" });
    }
    return res.status(200).json({ data: selectedSeller.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.get("/get-all-seller/:data_amount", UserAuthMiddleware, async (req, res) => {
  let { data_amount } = req.params;
  let { data_offset } = req.query;
  data_amount = parseInt(data_amount);

  if (!data_amount || data_amount > 50)
    return res.status(400).json({ error: "data_amount is required, max 50" });

  try {
    const allSellers = await SellerQueries.selectAllSellers([data_amount, data_offset || 0]);
    if (allSellers.rowCount < 1) return res.status(400).json({ error: "No seller found!" });

    return res.status(200).json({ data: allSellers.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});
export default router;
