import express from "express";
import { AuthMiddleware } from "../../../Middlewares/GeneralMiddlewares.js";
import {
  validateAddToCart,
  validateRemoveFromCart,
} from "../../../VALIDATOR/UserValidator/CartValidator.js";
import { CartQueries } from "./CartQueries.js";
const router = express.Router();

router.post("/add-product-to-cart/:product_id", AuthMiddleware, async (req, res) => {
  const { product_count } = req.body;
  const { product_id } = req.params;
  const loggedInUser = req.session.user;

  const { error } = validateAddToCart(req.body);
  if (error) return res.status(400).json({ error: ErrorMessageGetter(error) });
  if (!product_id) return res.status(400).json({ error: "Product id is required!" });

  try {
    const userCartData = await CartQueries.selectAllCartIDByUserID(loggedInUser);
    if (userCartData.rowCount === 20) {
      return res
        .status(400)
        .json({ error: "You cannot add more than 20 items at once!" });
    }
    const productData = await CartQueries.selectCartByProductAndUserID([
      loggedInUser,
      product_id,
    ]);
    if (productData.rowCount < 1)
      return res.status(400).json({ error: "Product didnot exist!" });

    const productExist = productData.rows[0];

    // If user(seller) owns the product, reject the request
    if (productExist.seller_user_id === loggedInUser)
      return res.status(400).json({ error: "You cannot add your own product to cart!" });
    // If product count exist for product_id, add incoming count to it
    if (productExist.product_count) {
      const newProductCount = productExist.product_count + product_count;
      if (newProductCount > 20)
        return res
          .status(400)
          .json({ error: "Max product count you can add to cart is 20" });
      await CartQueries.updateCart([newProductCount, product_id, loggedInUser]);
      return res.status(200).json({ message: "Cart updated successfully!" });
    } else {
      await CartQueries.insertCart([product_id, product_count, loggedInUser]);
      return res.status(200).json({ message: "Product added to cart successfully!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

/**
 * @todo Pass string as an id to check if database will throw error.
 */
router.post("/remove-product-from-cart/:cart_id", AuthMiddleware, async (req, res) => {
  const { cart_id } = req.params;
  const { product_count } = req.body;
  const loggedInUser = req.session.user;

  const { error } = validateRemoveFromCart(req.body);
  if (error) return res.status(400).json({ error: ErrorMessageGetter(error) });

  try {
    const cartData = await CartQueries.selectCartByID([cart_id, loggedInUser]);
    if (cartData.rowCount < 1)
      return res.status(400).json({ error: "Cart didnot exist!" });

    const cartExist = cartData.rows[0];
    // If product count in database exist, subtract incoming product_count from it.
    // If product count didnot exist, delete the product from cart.
    if (product_count) {
      const newProductCount = cartExist.product_count - product_count;
      const newProductCountResult = newProductCount < 0 ? 0 : newProductCount;

      if (newProductCountResult > 0) {
        await CartQueries.updateCartByID([newProductCountResult, cart_id]);
        return res.status(200).json({ message: "Cart updated successfully!" });
      } else {
        await CartQueries.deleteCartByID(cart_id);
        return res.status(200).json({ message: "Product removed successfully!" });
      }
    } else {
      await CartQueries.deleteCartByID(cart_id);
      return res.status(200).json({ message: "Product removed successfully!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

router.get("/get-buyer-carts", async (req, res) => {
  const loggedInUser = req.session.user;

  try {
    const userCartData = await CartQueries.selectAllCartProductByUserID(loggedInUser);
    if (userCartData.rowCount < 1)
      return res.status(400).json({ error: "Cart is empty!" });
    return res.status(200).json({ data: userCartData.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
