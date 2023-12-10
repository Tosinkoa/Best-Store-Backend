import express from "express";
import { TransactionQueries } from "./TransactionQueries.js";
import { AdminAuthMiddleware } from "../../../Middlewares/AdminMiddlewares.js";
const router = express.Router();

router.get("/get-total-sales-count", AdminAuthMiddleware, async (req, res) => {
  const { time } = req.query;

  try {
    let totalSalesCount;
    if (time === "today") {
      totalSalesCount = await TransactionQueries.selectTodaysSalesCount();
    } else {
      totalSalesCount = await TransactionQueries.selectSalesCount();
    }
    return res.status(200).json({ data: totalSalesCount.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.get("/get-total-transaction-amount", AdminAuthMiddleware, async (req, res) => {
  const { time } = req.query;

  let totalTransactionAmount;

  try {
    if (time === "today") {
      totalTransactionAmount = await TransactionQueries.selectTodaysTransactionTotalAmount();
    } else {
      totalTransactionAmount = await TransactionQueries.selectTransactionTotalAmount();
    }
    return res.status(200).json({ data: totalTransactionAmount.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
