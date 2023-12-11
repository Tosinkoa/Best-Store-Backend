import bcrypt from "bcrypt";
import express from "express";
import { validateLoginUser } from "../../../VALIDATOR/UserValidator/AuthenticationValidator.js";
import { AuthenticationQueries } from "./AuthenticationQueries.js";
// import { TOTP, Secret } from "otpauth";
import QRCode from "qrcode";
import { AdminAuthMiddleware } from "../../../Middlewares/AdminMiddlewares.js";
import { authenticator, totp } from "otplib";
import crypto from "crypto";

const router = express.Router();

router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  const { error } = validateLoginUser(req.body);
  if (error) return res.status(400).json({ error: errorMessageGetter(error) });
  req.session.regenerate(async () => {
    try {
      const ValidAdmin = await AuthenticationQueries.selectAdminDetailByEmail([email]);
      if (ValidAdmin.rowCount < 1) {
        // Em / No / Ex ==> Email not exist
        return res.status(400).json({
          error:
            "Em / No / Ex, Something went wrong, if you're seeing this error, kindly reach out to the support.",
        });
      }
      if (ValidAdmin.rows[0].role !== "admin") {
        return res
          .status(400)
          .json({ error: "Something went wrong, kindly get in touch with the support." });
      }
      const matches = bcrypt.compareSync(password, ValidAdmin.rows[0].password);
      if (!matches) return res.status(400).json({ error: "Something went wrong, try again" });
      req.session.user = ValidAdmin.rows[0].id;
      return res.status(200).json({ data: "Logged in successfully" });
    } catch (e) {
      console.log(e);
      return res.status(500);
    }
  });
});

// First time verification for adding temp secret to valid secret row in the database
router.get("/admin/otp-setup", AdminAuthMiddleware, async (req, res) => {
  const loggedInAdmin = req.session.user;

  try {
    // Check if the user already has a valid secret
    const adminSecret = await AuthenticationQueries.selectLoggedInAdminScerets([
      loggedInAdmin,
    ]);

    if (adminSecret?.rows[0]?.temp_secret || adminSecret?.rows[0]?.valid_secret) {
      return res.status(400).json({
        error:
          "Al / Ve, Something went wrong, if you're seeing this error, kindly reach out to the support.",
      });
    }

    const adminData = await AuthenticationQueries.selectAdminEmailByID([loggedInAdmin]);

    // Setting options for TOTP
    totp.options = { digits: 6, step: 30 };

    // Generate a new TOTP secret
    const totpSecret = authenticator.generateSecret();
    // Get the TOTP URI
    const serviceName =
      process.env.NODE_ENV === "production" ? "Best Store" : "Best Store Dev";
    const totpUri = totp.keyuri(adminData.rows[0].email, serviceName, totpSecret);

    // Generate QR Code
    QRCode.toDataURL(totpUri, async (err, data_url) => {
      if (err) {
        return res.status(400).json({ error: "An error occurred, please try again!" });
      }

      const isAdminExist = await AuthenticationQueries.selectAdmin([loggedInAdmin]);

      // Check if admin temp_secret exists, then store the secret in the database
      const validSecret = null;
      if (isAdminExist.rowCount > 0) {
        await AuthenticationQueries.updateAdminAuthSecret([
          totpSecret,
          validSecret,
          loggedInAdmin,
        ]);
      } else {
        await AuthenticationQueries.insertAdminAuthSecret([totpSecret, loggedInAdmin]);
      }

      return res.status(200).json({ data: { qr_code: data_url, token: totpSecret } });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/admin/first-time-verify-otp", AdminAuthMiddleware, async (req, res) => {
  const { user_token } = req.body;
  const loggedInAdmin = req.session.user;

  if (!user_token) {
    return res.status(400).json({
      error:
        "No / To, Something went wrong, if you're seeing this error, kindly reach out to the support.",
    });
  }

  try {
    // Retrieve the stored secret from the database
    const adminSecret = await AuthenticationQueries.selectLoggedInAdminScerets([
      loggedInAdmin,
    ]);

    // No / Se / Ot ==> Not setup otp
    if (adminSecret.rowCount < 1) {
      return res.status(400).json({
        error:
          "No / Se / Ot, Something went wrong, if you're seeing this error, kindly reach out to the support.",
      });
    }
    // If there is no temporary secret, this means admin has made a first time verification
    const adminTempSecret = adminSecret.rows[0].temp_secret;
    if (!adminTempSecret) {
      return res.status(400).json({ error: "Duplicate verification detected!" });
    }

    // Validate the provided token using the authenticator class
    const isValidToken = authenticator.verify({
      token: user_token,
      secret: adminTempSecret,
      algorithm: "SHA1",
      digits: 6,
      window: 0,
    });

    if (!isValidToken) {
      return res.status(400).json({ error: "The code you entered is incorrect!" });
    }

    // If validation is successful, update the admin's secrets
    const newTempSecret = null;
    const verified = true;

    await AuthenticationQueries.updateAllAdminSecrets([
      newTempSecret,
      verified,
      adminTempSecret,
      loggedInAdmin,
    ]);

    return res.status(200).json({ data: "Successfully verified" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// This check if the user auth is valid using the valid_secret
router.post("/admin/verify-otp", AdminAuthMiddleware, async (req, res) => {
  const { user_token } = req.body;
  const loggedInAdmin = req.session.user;

  if (!user_token) {
    return res.status(400).json({
      error:
        "No / To, Something went wrong, if you're seeing this error, kindly reach out to the support.",
    });
  }

  try {
    // Retrieve the stored secret from the database
    const adminSecret = await AuthenticationQueries.selectLoggedInAdminScerets([
      loggedInAdmin,
    ]);

    // No / Se / Ot ==> Not setup otp
    if (adminSecret.rowCount < 1 || !adminSecret.rows[0].valid_secret) {
      return res.status(400).json({
        error:
          "No / Se / Ot, Something went wrong, if you're seeing this error, kindly reach out to the support.",
      });
    }

    const adminValidSecret = adminSecret.rows[0].valid_secret;

    // If there is no valid secret, this means admin is yet to do a first-time verification
    if (!adminValidSecret) {
      return res.status(400).json({ error: "First time verification is required!" });
    }

    // Validate the provided token using the authenticator class
    const isValidToken = authenticator.verify({
      token: user_token,
      secret: adminValidSecret,
      algorithm: "SHA1",
      digits: 6,
      window: 0,
    });

    if (!isValidToken) {
      return res.status(400).json({ error: "The code you entered is incorrect!" });
    }

    // If validation is successful, update the admin's verification status
    const verified = true;
    await AuthenticationQueries.updateAdminOtpVerified([verified, loggedInAdmin]);

    return res.status(200).json({ data: "Successfully verified" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Check if admin had verify the otp after logging in
router.get("/admin/check-admin-verify-otp", AdminAuthMiddleware, async (req, res) => {
  const loggedInAdmin = req.session.user;
  try {
    const adminSecret = await AuthenticationQueries.selectLoggedInAdminScerets([
      loggedInAdmin,
    ]);
    const allAdminSecrets = adminSecret.rows[0];
    if (adminSecret.rowCount < 1 || !allAdminSecrets.verified)
      return res.status(400).send(false);

    return res.status(200).send(true);
  } catch (e) {
    res.status(400).send(false);
  }
});

// Check if admin added an otp before
router.get("/admin/check-admin-added-otp", AdminAuthMiddleware, async (req, res) => {
  const loggedInAdmin = req.session.user;
  try {
    const adminSecret = await AuthenticationQueries.selectLoggedInAdminScerets([
      loggedInAdmin,
    ]);
    if (adminSecret.rowCount < 1)
      return res.status(400).json({ error: "You're yet to setup otp" });
    return res.status(200).json({ message: "Otp detected!" });
  } catch (e) {
    res.status(400).send(false);
  }
});

router.get("/admin/check-admin-auth", async (req, res) => {
  const loggedInAdmin = req.session.user;
  try {
    if (!loggedInAdmin) return res.status(400).send(false);
    const userData = await AuthenticationQueries.selectLoggedInUserRole([loggedInAdmin]);
    const userExist = userData.rows[0];
    // If user role is block or admin or moderator, dissaprove user
    if (userData.rowCount < 1 || userExist.role !== "admin") {
      return res.status(400).send(false);
    }

    return res.status(200).send(true);
  } catch (e) {
    console.log(e);
    res.status(400).send(false);
  }
});

router.post("/admin/logout", AdminAuthMiddleware, async (req, res, next) => {
  const loggedInAdmin = req.session.user;
  try {
    const verified = false;
    await AuthenticationQueries.updateAdminOtpVerified([verified, loggedInAdmin]);
    req.session.user = null;
    req.session.save(function (err) {
      if (err) next(err);
      req.session.regenerate(function (err) {
        console.log(err);
        if (err) next(err);
        return res.status(200).json({ message: "Logged out successfully!" });
      });
    });
  } catch (e) {
    console.error(e);
    return res.status(200);
    // return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
