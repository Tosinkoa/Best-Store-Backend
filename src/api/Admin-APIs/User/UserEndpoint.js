import express from "express";
import { UserQueries } from "./UserQueries.js";
import { AdminAuthAndOtpVerifiedMiddleware } from "../../../Middlewares/AdminMiddlewares.js";

const router = express.Router();

router.get("/get-total-user-count", AdminAuthAndOtpVerifiedMiddleware, async (req, res) => {
  const { time } = req.query;

  const roleTitle1 = "admin";
  const roleTitle2 = "moderator";

  try {
    let totalUserCount;
    if (time === "today") {
      totalUserCount = await UserQueries.selectTodayUserCount([roleTitle1, roleTitle2]);
    } else {
      totalUserCount = await UserQueries.selectUserCount([roleTitle1, roleTitle2]);
    }
    return res.status(200).json({ data: totalUserCount.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
