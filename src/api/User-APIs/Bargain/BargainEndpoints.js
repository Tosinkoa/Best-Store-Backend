import express from "express";
import { BargainQueries } from "./BargainQueries.js";
import { validateBargain } from "../../../VALIDATOR/UserValidator/BargainValidator.js";
import { errorMessageGetter } from "../../../ReusableFunctions/errorMessageGetter.js";
const router = express.Router();

router.post("/bargain/:product_id", async (req, res) => {
  const { amount } = req.body;
  let { product_id } = req.params;
  const loggedInUser = req.session.user;

  product_id = parseInt(product_id);

  try {
    const bargainExist = await BargainQueries.selectBargainByUserAndProductId([
      loggedInUser,
      product_id,
    ]);
    if (bargainExist.rowCount < 1) {
      return res.status(400).json({ error: "Product didnot exist!" });
    }
    const bargainData = bargainExist.rows[0];
    // First if case -> If user(seller) is the owner of the product, reject the request
    // Second if case -> If product exist but bargain is not find, create new bargain
    // Third if case -> If both product and bargain is found, edit the bargain
    if (bargainData.seller_user_id === loggedInUser) {
      return res
        .status(400)
        .json({ error: "You cannot place a bargain offer on your own product!" });
    }
    if (bargainData.product_id && !bargainData.bargain_id) {
      const { error } = validateBargain(req.body);
      if (error) return res.status(400).json({ error: errorMessageGetter(error) });
      await BargainQueries.insertIntoBargain([product_id, loggedInUser, amount]);
      return res.status(200).json({ message: "Offer created successfully!" });
    }
    if (bargainData.product_id && bargainData.bargain_id) {
      console.log("bargainData.bargain_amount:", bargainData.bargain_amount);
      await BargainQueries.updateBargain([
        amount || bargainData.bargain_amount,
        loggedInUser,
        product_id,
      ]);
      return res.status(200).json({ message: "Offer updated successfully!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.post("/accept-bargain/:bargain_id", async (req, res) => {
  let { bargain_id } = req.params;
  const loggedInUser = req.session.user;
  bargain_id = parseInt(bargain_id);

  if (!bargain_id) {
    return res.status(400).json({ error: "bargain_id is required and must be a number" });
  }

  try {
    const bargainExist = await BargainQueries.selectBargainByID(bargain_id);
    if (bargainExist.rowCount < 1) {
      return res.status(400).json({ error: "Offer didnot exist!" });
    }
    const bargainData = bargainExist.rows[0];
    // Check if the person sending the request owns the product
    if (bargainData.seller_user_id !== loggedInUser) {
      return res.status(403).json({ error: "Unauthorized!, you cannot accept this bargain" });
    }
    await BargainQueries.setBargainAcceptToTrue(true, bargain_id);
    // Remove all other unaccepted bargains that belongs to same product
    await BargainQueries.deleteByProductAndBargainID([bargainData.product_id, bargain_id]);
    return res.status(200).json({ message: "Bargain accepted successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
