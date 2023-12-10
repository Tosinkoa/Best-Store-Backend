import bcrypt from "bcrypt";
import express from "express";
import { errorMessageGetter } from "../../../ReusableFunctions/errorMessageGetter.js";
import {
  validateLoginUser,
  validateRegisterUser,
} from "../../../VALIDATOR/UserValidator/AuthenticationValidator.js";
import { AuthenticationQueries } from "./AuthenticationQueries.js";
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
      const userExist = await AuthenticationQueries.selectUserDetailByEmail(email);
      const phoneNumberExists = await AuthenticationQueries.selectPhoneNumber(phone_number);

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
  const userData = await AuthenticationQueries.selectUserDetailByEmail(email);
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

export default router;
