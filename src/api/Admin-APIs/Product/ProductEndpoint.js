import express from "express";
import { ProductQueries } from "./ProductQueries.js";

const router = express.Router();

router.get("/get-total-product-count", async (req, res) => {
  const { time } = req.query;

  try {
    let totalProductCount;
    if (time === "today") {
      totalProductCount = await ProductQueries.selectTodaysProductCount();
    }
    totalProductCount = await ProductQueries.selectProductCount();
    return res.status(200).json({ data: totalProductCount.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
