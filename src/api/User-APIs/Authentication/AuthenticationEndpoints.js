import bcrypt from "bcrypt";
import express from "express";
import { errorMessageGetter } from "../../../ReusableFunctions/errorMessageGetter.js";
import {
  validateLoginUser,
  validateRegisterUser,
} from "../../../VALIDATOR/UserValidator/AuthenticationValidator.js";
import { AuthenticationQueries } from "./AuthenticationQueries.js";
import { UserAuthMiddleware } from "../../../Middlewares/UserMiddlewares.js";
import SendEmail from "../../../LIB/SendEmail.js";
const router = express.Router();

/**
 * @todo Add middlewares to neccessary routes
 * @todo Add comment to neccessary functions
 */

router.post("/register", (req, res, next) => {
  const { first_name, last_name, email, phone_number, password, remember } = req.body;

  const { error } = validateRegisterUser(req.body);
  if (error) return res.status(400).json({ error: errorMessageGetter(error) });

  req.session.regenerate(async () => {
    try {
      const userExist = await AuthenticationQueries.selectUserDetailByEmail([email]);
      const phoneNumberExists = await AuthenticationQueries.selectPhoneNumber([phone_number]);

      if (userExist.rowCount > 0)
        return res.status(400).json({ error: "User already exist!" });
      if (phoneNumberExists.rowCount > 0)
        return res.status(400).json({ error: "Phone number already used" });

      const hashedPassword = bcrypt.hashSync(password, 10);
      await AuthenticationQueries.insertUser([
        first_name,
        last_name,
        email,
        phone_number,
        hashedPassword,
      ]);
      if (remember) req.session.cookie.maxAge = 2628000000;
      req.session.user = userExist.id;

      return res.json({ message: "Account created Successfully!" });
    } catch (error) {
      return next(error);
    }
  });
});

router.post("/login", async (req, res) => {
  const { error } = validateLoginUser(req.body);

  if (error) return res.status(400).json({ error: errorMessageGetter(error) });
  const { email, password, remember } = req.body;
  const userData = await AuthenticationQueries.selectUserDetailByEmail([email]);
  req.session.regenerate(async () => {
    try {
      const userExist = userData.rows[0];
      if (userData.rowCount < 1 || ["block", "admin", "moderator"].includes(userExist.role))
        return res.status(401).json({ error: "Wrong email or password" });

      const matches = bcrypt.compareSync(password, userExist.password);
      if (!matches) return res.status(400).json({ error: "Wrong email or password" });
      if (remember) req.session.cookie.maxAge = 2628000000;
      req.session.user = userExist.id;

      return res.status(200).json({ data: "Logged in successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Server error, try agin!" });
    }
  });
});

router.get("/check-user-auth", async (req, res) => {
  const loggedInUser = req.session.user;
  try {
    if (!loggedInUser) return res.status(400).send(false);
    const userData = await AuthenticationQueries.selectLoggedInUserRole([loggedInUser]);
    const userExist = userData.rows[0];
    // If user role is block or admin or moderator, dissaprove user
    if (userData.rowCount < 1 || ["block", "admin", "moderator"].includes(userExist.role)) {
      if (!loggedInUser) return res.status(400).send(false);
    }

    return res.status(200).send(true);
  } catch (e) {
    res.status(400).send(false);
  }
});

router.get("/create-user-otp", async (req, res) => {
  const loggedInUser = req.session.user;
  const otpVerificationCode = String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
  try {
    // Generate 6 code length and hash it with bcrypt
    const userData = await AuthenticationQueries.selectLoggedInUserRole([loggedInUser]);
    const userSecret = await AuthenticationQueries.insertUserAuthSecret([loggedInUser]);
    const hashedOtpVerificationCode = bcrypt.hashSync(otpVerificationCode, 10);

    if (userSecret.rowCount < 0) {
      // Save the hashed version to the database
      await AuthenticationQueries.insertUserAuthSecret([
        hashedOtpVerificationCode,
        loggedInUser,
      ]);
    } else {
      // Update already existing user secret
      await AuthenticationQueries.updateUserSecrets([hashedOtpVerificationCode, loggedInUser]);
    }

    // Send the unhashed version to user mail
    const receiver = userData.rows[0].email;
    const subject = `Dmore OTP Code is ${otpVerificationCode}`;
    const textContent = `<div>
      <p>
        Below is your one time passcode that you need to use to complete your authentication. The
        verification code will be valid for 30 minutes. Please do not share this code with anyone.
      </p>
      <p>${otpVerificationCode}</p>
      <p>If you are having any issues with your account, please don't hesitate to contact us.</p>
    </div>`;

    await SendEmail(receiver, subject, textContent);
    res.status(200).json({ message: "Token created successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.post("/validate-user-otp", UserAuthMiddleware, async (req, res, next) => {
  const loggedInUser = req.session.user;
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "token is required" });
  try {
    const userSecret = await AuthenticationQueries.insertUserAuthSecret([loggedInUser]);
    const TokenCreatedTime = userSecret.rows[0].updated_at;
    const TokenExpireTime = dayjs(TokenCreatedTime).add(1, "hour").format();
    const TokenHasExpired = dayjs(CurrentDate).isAfter(TokenExpireTime);
    if (TokenHasExpired) return res.status(400).json({ error: "Invalid token!" });

    const tokenIsValid = bcrypt.compareSync(token, userSecret.rows[0].valid_secret);
    if (!tokenIsValid) return res.status(400).json({ error: "token is invalid" });

    return res.status(200).json({ message: "Valid token!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.post("/logout-user", UserAuthMiddleware, (req, res, next) => {
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
