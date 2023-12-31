import express from "express";
import { UserAuthMiddleware } from "../../../Middlewares/UserMiddlewares.js";
import { SaleHistoryQueries } from "./SaleHistoryQueries.js";
const router = express.Router();

router.get("/get-seller-sales-history/:data_amount", UserAuthMiddleware, async (req, res) => {
  const loggedInUser = req.session.user;
  let { data_amount } = req.params;
  let { data_offset } = req.query;

  data_amount = parseInt(data_amount);
  data_offset = parseInt(data_offset);

  if (!data_amount || data_amount > 50)
    return res.status(400).json({ error: "data_amount is required, max 50" });

  try {
    const allSellerSalesHistory = await SaleHistoryQueries.selectSellerSalesHistory([
      loggedInUser,
    ]);

    if (allSellerSalesHistory.rowCount < 1)
      return res.status(400).json({ error: "No sales record!" });

    allSellerSalesHistory.rows.forEach((item) => {
      const images = item.images.map((imageString) => JSON.parse(imageString));
      item.images = images;
    });

    return res.status(200).json({ data: allSellerSalesHistory.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
