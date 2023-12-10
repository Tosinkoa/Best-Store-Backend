import bcrypt from "bcrypt";
import express from "express";
import { validateLoginUser } from "../../../VALIDATOR/UserValidator/AuthenticationValidator.js";
import { AuthenticationQueries } from "./AuthenticationQueries.js";
import { TOTP, Secret } from "otpauth";
import QRCode from "qrcode";
import { AdminAuthMiddleware } from "../../../Middlewares/AdminMiddlewares.js";

const router = express.Router();

router.post("/admin/login", async (req, res) => {
  console.log("/admin/login");
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

router.get("/admin/otp-setup", AdminAuthMiddleware, async (req, res) => {
  try {
    const loggedInAdmin = req.session.user;
    // Generate a new TOTP object
    const totp = new TOTP({
      issuer: process.env.NODE_ENV === "production" ? "Best Store" : "Best Store Dev",
      label: "Admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: new Secret(),
    });

    // Get the TOTP URI
    const totpUri = totp.toString();

    // Generate QR Code
    QRCode.toDataURL(totpUri, async (err, data_url) => {
      if (err) {
        return res.status(400).json({ error: "An error occurred, please try again!" });
      }

      const isAdminExist = await AuthenticationQueries.selectAdmin([loggedInAdmin]);

      // Check if admin temp_secret exist, then store the secret in the database
      const validScret = null;
      if (isAdminExist.rowCount > 0) {
        await AuthenticationQueries.updateAdminAuthSecret([
          totp.secret.base32,
          validScret,
          loggedInAdmin,
        ]);
      } else {
        await AuthenticationQueries.insertAdminAuthSecret([totp.secret.base32, loggedInAdmin]);
      }
      return res.status(200).json({ data: { qr_code: data_url, token: totp.secret.base32 } });
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// First time verification for adding temp secret to valid secret row in the database
router.post("/admin/first-time-verify-otp", AdminAuthMiddleware, async (req, res) => {
  const { user_token } = req.body;
  const loggedInAdmin = req.session.user;

  if (!user_token) {
    // No / To ==> No Token
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

    const totp = new TOTP({
      secret: adminTempSecret,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const isValidToken = totp.validate({
      token: user_token,
      window: 1,
    });

    if (!isValidToken) {
      return res.status(400).json({ error: "The code you entered is incorrect!" });
    }

    const newTempSecret = null;
    // Change temp_secret to valid secret in the database
    await AuthenticationQueries.updateAdminSecrets([
      newTempSecret,
      adminSecret.rows[0].temp_secret,
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
    // No / To ==> No Token
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
    const adminValidSecret = adminSecret.rows[0].valid_secret;
    // If there is no valid secret, this means admin is yet to do a first time verification
    if (!adminValidSecret) {
      return res.status(400).json({ error: "First time verification is required!" });
    }

    const totp = new TOTP({
      secret: adminValidSecret,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const isValidToken = totp.validate({
      token: user_token,
      // timestamp: 0,
      window: 1,
    });

    if (!isValidToken) {
      return res.status(400).json({ error: "The code you entered is incorrect!" });
    }

    return res.status(200).json({ data: "Successfully verified" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/check-admin-auth", async (req, res) => {
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
    res.status(400).send(false);
  }
});

router.post("/logout-admin", AdminAuthMiddleware, (req, res, next) => {
  req.session.user = null;
  req.session.save(function (err) {
    if (err) next(err);
    req.session.regenerate(function (err) {
      console.log(err);
      if (err) next(err);
      return res.status(200).json({ message: "Logged out successfully!" });
    });
  });
});

export default router;
