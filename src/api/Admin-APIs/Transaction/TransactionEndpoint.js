import express from "express";
import { TransactionQueries } from "./TransactionQueries.js";
const router = express.Router();

router.get("/get-total-sales-count", async (req, res) => {
  const { time } = req.query;

  try {
    let totalSalesCount;
    if (time === "today") {
      totalSalesCount = await TransactionQueries.selectTodaysSalesCount();
    }
    totalSalesCount = await TransactionQueries.selectSalesCount();
    return res.status(200).json({ data: totalSalesCount.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.get("/get-total-transaction-amount", async (req, res) => {
  const { time } = req.query;

  let totalTransactionAmount;

  try {
    if (time === "today") {
      totalTransactionAmount = await TransactionQueries.selectTodaysTransactionTotalAmount();
    }
    totalTransactionAmount = await TransactionQueries.selectTransactionTotalAmount();
    return res.status(200).json({ data: totalTransactionAmount.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
