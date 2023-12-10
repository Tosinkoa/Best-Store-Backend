import express from "express";
import { SellerQueries } from "./SellerQueries.js";

const router = express.Router();

router.get("/get-total-seller-count", async (req, res) => {
  const { time } = req.query;
  const roleTitle = "seller";

  try {
    let totalSellerCount;
    if (time === "today") {
      totalSellerCount = await SellerQueries.selectTodaySellerCount([roleTitle]);
    } else {
      totalSellerCount = await SellerQueries.selectSellerCount([roleTitle]);
    }
    return res.status(200).json({ data: totalSellerCount.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
