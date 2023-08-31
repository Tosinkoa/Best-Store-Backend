import express from "express";
import { ErrorMessageGetter } from "../../../ReusableFunctions/ErrorMessageGetter.js";
import { validateProduct } from "../../../VALIDATOR/UserValidator/ProductValidator.js";
import { ProductQueries } from "./ProductQueries.js";
import { AuthMiddleware } from "../../../Middlewares/GeneralMiddlewares.js";
const router = express.Router();

/**
 * @todo Work on product images
 */
router.post("/create-new-product", AuthMiddleware, async (req, res) => {
  const { cartegory_id, name, description, price, bargain, in_stock, crossed_out_price } =
    req.body;
  const loggedInUser = req.session.user;
  let sub_cartegory_id = req.body.sub_cartegory_id;

  // Validate req body
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).json({ error: ErrorMessageGetter(error) });

  if (!sub_cartegory_id) sub_cartegory_id = "0";
  try {
    const sellerExist = await ProductQueries.selectOneSeller(loggedInUser);
    if (sellerExist.rowCount < 1) {
      return res.status(403).json({ error: "Unauthorized, you're not a seller!" });
    }
    const cartegoryAndSubCartegory = await ProductQueries.selectCartegoryAndSubCartegory([
      sub_cartegory_id,
      cartegory_id,
    ]);
    if (cartegoryAndSubCartegory.rowCount < 1) {
      return res.status(400).json({ error: "Invalid cartegory id!" });
    }

    const cartegoryAndSubCartegoryData = cartegoryAndSubCartegory.rows[0];
    if (
      cartegoryAndSubCartegoryData.cartegory_name !== "Others" &&
      !cartegoryAndSubCartegoryData.sub_cart_names
    ) {
      return res.status(400).json({ error: "Invalid sub-cartegory id!" });
    }
    await ProductQueries.insertNewProduct([
      name,
      description,
      price,
      bargain,
      in_stock,
      crossed_out_price || null,
      sellerExist.rows[0].seller_id,
      cartegoryAndSubCartegoryData.cartegory_name,
      cartegoryAndSubCartegoryData.sub_cart_names || null,
    ]);
    return res.status(200).json({ message: "Product added successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin later!" });
  }
});

router.put("/edit-product/:product_id", AuthMiddleware, async (req, res) => {
  const { cartegory_id, name, description, price, bargain, in_stock, crossed_out_price } =
    req.body;
  const { product_id } = req.params;
  const loggedInUser = req.session.user;
  let sub_cartegory_id = req.body.sub_cartegory_id;

  if (cartegory_id && !sub_cartegory_id) sub_cartegory_id = "0";

  try {
    const sellerExist = await ProductQueries.selectOneSeller(loggedInUser);
    if (sellerExist.rowCount < 1) {
      return res.status(403).json({ error: "Unauthorized, you're not a seller!" });
    }
    let cartegoryName = "";
    let subCartegoryName = "";
    if (sub_cartegory_id && !cartegory_id) {
      return res
        .status(400)
        .json({ error: "Cartegory id is required if sub cartegory id is present" });
    }
    if (cartegory_id) {
      const cartegoryAndSubCartegory =
        await ProductQueries.selectCartegoryAndSubCartegory([
          sub_cartegory_id,
          cartegory_id,
        ]);

      const cartegoryAndSubCartegoryData = cartegoryAndSubCartegory.rows[0];
      if (cartegoryAndSubCartegory.rowCount < 1) {
        return res.status(400).json({ error: "Invalid cartegory id!" });
      }
      if (
        cartegoryAndSubCartegoryData.cartegory_name !== "Others" &&
        !cartegoryAndSubCartegoryData.sub_cart_names
      ) {
        return res.status(400).json({ error: "Invalid sub-cartegory id!" });
      }

      cartegoryName = cartegoryAndSubCartegoryData.cartegory_name;
      subCartegoryName = cartegoryAndSubCartegoryData.sub_cart_names;
    }

    const productData = await ProductQueries.getProductById(product_id);
    const theProductData = productData.rows[0];

    await ProductQueries.updateProduct([
      name || theProductData.name,
      description || theProductData.description,
      price || theProductData.price,
      bargain || theProductData.bargain,
      in_stock || theProductData.in_stock,
      crossed_out_price || theProductData.crossed_out_price,
      cartegoryName || theProductData.cartegory_name,
      subCartegoryName || null,
      product_id,
    ]);
    return res.status(200).json({ message: "Product updated successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin later!" });
  }
});

router.get("/get-a-product/:product_id", AuthMiddleware, async (req, res) => {
  const { product_id } = req.params;

  try {
    const selectedSeller = await ProductQueries.selectProductDataById(product_id);
    if (selectedSeller.rowCount < 1) {
      return res.status(400).json({ error: "Product doesn't exist!" });
    }
    return res.status(200).json({ data: selectedSeller.rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin later!" });
  }
});

router.get("/get-all-products/:data_amount", AuthMiddleware, async (req, res) => {
  const { data_amount } = req.params;
  const { data_offset, sub_cartegory_name } = req.query;

  if (!data_amount || data_amount > 100)
    return res
      .status(400)
      .json({ error: "Amount of data to fetch is required, max 100" });

  try {
    let allProducts;
    if (sub_cartegory_name) {
      allProducts = await ProductQueries.selectAllProductDataBySubCartegory([
        sub_cartegory_name,
        data_amount,
        data_offset || "0",
      ]);
    } else {
      allProducts = await ProductQueries.selectAllProductDataById([
        data_amount,
        data_offset || "0",
      ]);
    }
    if (allProducts.rowCount < 1)
      return res.status(400).json({ error: "No product found!" });

    return res.status(200).json({ data: allProducts.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin later!" });
  }
});

export default router;
