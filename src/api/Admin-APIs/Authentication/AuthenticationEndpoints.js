import bcrypt from "bcrypt";
import express from "express";
import { validateLoginUser } from "../../../VALIDATOR/UserValidator/AuthenticationValidator.js";
import { AuthenticationQueries } from "./AuthenticationQueries.js";
import * as OTPAuth from "otpauth";

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
        return res.status(400).json({
          error: "E / P, Something went wrong, kindly get in touch with the support.",
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

router.get(
  "/admin/otp-setup",
  /*MW_Valid_Admin_OTP_Section_Middleware,*/ async (req, res) => {
    try {
      let totp = new OTPAuth.TOTP({
        issuer: "ACME",
        label: "AzureDiamond",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: "NB2W45DFOIZA", // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
      });

      // if (process.env.NODE_ENV === "production") {
      // secret = totp.generate();
      // } else {
      //   secret = totp.generate();
      // }

      let token = totp.generate();

      // Validate a token (returns the token delta or null if it is not found in the search window, in which case it should be considered invalid).
      let delta = totp.validate({ token, window: 1 });

      // Convert to Google Authenticator key URI:
      // otpauth://totp/ACME:AzureDiamond?issuer=ACME&secret=NB2W45DFOIZA&algorithm=SHA1&digits=6&period=30
      let uri = totp.toString(); // or 'OTPAuth.URI.stringify(totp)'

      // Convert from Google Authenticator key URI.
      totp = OTPAuth.URI.parse(uri);

      totp = OTPAuth.URI.parse(uri);
      console.log("TOTP:", totp);
      return;

      const AdminSecret = await AuthenticationQueries.selectLoggedInAdminTempSceret(
        req.session.user
      );
      // If secret already exist and user want to generate a QRCode, update the secret else create new one
      if (AdminSecret.rowCount > 0) {
        await AuthenticationQueries.updateAdminAuthSecret([secret.base32, req.session.user]);
      } else {
        await AuthenticationQueries.insertAdminAuthSecret(secret.base32, req.session.user);
      }
      // Get the data URL of the authenticator URL
      QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
        if (err) res.status(400).json({ error: "An error occured pls try again!" });
        return res.status(200).json({ data: data_url });
      });
    } catch (e) {
      console.log(e);
      return res.status(500);
    }
  }
);

router.post(
  "/admin/first-time-otp-verify",
  /*MW_Valid_Admin_OTP_Section_Middleware,*/
  async (req, res) => {
    console.log("/admin/first-time-otp-verify");
    const { userToken } = req.body;
    if (!userToken) return res.status(400).json({ error: "Your token is invalid" });

    try {
      const ValidAdmin = await AuthenticationQueries.selectLoggedInAdminTempSceret(
        req.session.admin_otp_session
      );
      if (ValidAdmin.rowCount < 1)
        return res.status(400).json({ error: "Something went wrong, pls try again later" });
      const Verified = speakeasy.totp.verify({
        secret: ValidAdmin.rows[0].temp_secret,
        encoding: "base32",
        token: userToken,
      });

      if (!Verified)
        return res.status(400).json({ error: "The code you entered is incorrect!" });
      await AuthenticationQueries.updateAdminAuth(
        ValidAdmin.rows[0].temp_secret,
        CurrentDate(),
        req.session.admin_otp_session
      );
      req.session.admin = req.session.admin_otp_session;
      delete req.session.admin_otp_session;
      return res.status(200).json({ data: "Successfully verified" });
    } catch (e) {
      console.log(e);
      return res.status(500);
    }
  }
);

router.post(
  "/admin/verify-otp",
  /* MW_Valid_Admin_OTP_Section_Middleware,*/ async (req, res) => {
    console.log("/admin/verify-otp");
    if (!userToken) return res.status(400).json({ error: "Your token is invalid" });
    try {
      const ValidAdmin = await AuthenticationQueries.selectAdminValidSecret(
        req.session.admin_otp_session
      );
      if (ValidAdmin.rowCount < 1)
        return res.status(400).json({ error: "Something went wrong, pls try again later" });
      if (ValidAdmin.rowCount > 0 && ValidAdmin.rows[0].valid_secret === null)
        return res.status(400).json({ error: "Something went wrong, pls try again later" });
      const Verified = speakeasy.totp.verify({
        secret: ValidAdmin.rows[0].valid_secret,
        encoding: "base32",
        token: userToken,
      });
      if (!Verified)
        return res.status(400).json({ error: "The code you entered is incorrect!" });
      req.session.admin = req.session.admin_otp_session;
      delete req.session.admin_otp_session;
      return res.status(200).json({ data: "Successfully verified" });
    } catch (e) {
      console.log(e);
      return res.status(500);
    }
  }
);

export default router;
