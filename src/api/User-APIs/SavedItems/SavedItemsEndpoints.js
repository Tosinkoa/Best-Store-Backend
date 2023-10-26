import express from "express";
import { SavedItemsQueries } from "./SavedItemsQueries.js";
const router = express.Router();
/**
 * @todo filter out product with no images for all routes that get all products
 */

router.post("/save-product/:product_id", async (req, res) => {
  let { product_id } = req.params;
  const loggedInUser = req.session.user;
  product_id = parseInt(product_id);

  if (!product_id)
    return res.status(400).json({ error: "product_id is required and must be a number" });

  try {
    const productExist = await SavedItemsQueries.selectProductByID(product_id);
    if (productExist.rowCount < 1)
      return res.status(400).json({ error: "Product didnot exist!" });
    const productData = productExist.rows[0];
    // If product exist, add it to saved item for logged in user
    if (productData.saved_item_id) {
      return res.status(400).json({ error: "Product already saved!" });
    }
    await SavedItemsQueries.deleteSavedProductFromCart([product_id, loggedInUser]);
    await SavedItemsQueries.saveProduct([loggedInUser, product_id]);
    return res.status(200).json({ message: "Product saved successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.delete("/remove-saved-product/:saved_product_id", async (req, res) => {
  let { saved_product_id } = req.params;
  const loggedInUser = req.session.user;
  saved_product_id = parseInt(saved_product_id);
  if (!saved_product_id) {
    return res
      .status(400)
      .json({ error: "saved_product_id is required and must be a number" });
  }

  try {
    const savedProductExist = await SavedItemsQueries.selectSavedProductByID(saved_product_id);
    if (savedProductExist.rowCount < 1)
      return res.status(400).json({ error: "Cannot find any record for the id provided!" });
    const savedProductData = savedProductExist.rows[0];
    // If product exist, add it to saved item for logged in user
    await SavedItemsQueries.removeSavedProduct(savedProductData.product_id, loggedInUser);
    return res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.get("/get-all-saved-items", async (req, res) => {
  const loggedInUser = req.session.user;

  try {
    const savedItems = await SavedItemsQueries.selectAllSavedProduct(loggedInUser);
    if (savedItems.rowCount < 1)
      return res.status(400).json({ error: "You didnot have any product saved!" });

    return res.status(200).json({ data: savedItems.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
