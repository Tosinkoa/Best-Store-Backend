import express from "express";
import { UserAuthMiddleware } from "../../../Middlewares/UserMiddlewares.js";
import {
  validateAddToCart,
  validateRemoveFromCart,
} from "../../../VALIDATOR/UserValidator/CartValidator.js";
import { CartQueries } from "./CartQueries.js";
import { errorMessageGetter } from "../../../ReusableFunctions/errorMessageGetter.js";
const router = express.Router();

const maxCartProduct = 20;

router.post("/add-product-to-cart/:product_id", UserAuthMiddleware, async (req, res) => {
  const { product_count } = req.body;
  let { product_id } = req.params;
  const loggedInUser = req.session.user;

  const { error } = validateAddToCart(req.body);
  if (error) return res.status(400).json({ error: errorMessageGetter(error) });
  if (!product_id) {
    return res.status(400).json({ error: "product_id is required and must be a number" });
  }

  try {
    const userCartData = await CartQueries.selectAllCartIDByUserID(loggedInUser);
    if (userCartData.rowCount === maxCartProduct) {
      return res.status(400).json({ error: "You cannot add more than 20 items at once!" });
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
      if (newProductCount > maxCartProduct)
        return res.status(400).json({ error: "Max quantity count you can add to cart is 20" });
      await CartQueries.updateCart([newProductCount, product_id, loggedInUser]);
      await CartQueries.deleteCartProductFromSavedItem([product_id, loggedInUser]);
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
 * @Todo Optimize query for adding bulk product to cart
 * @important
 */
router.post("/add-bulk-product-to-cart", UserAuthMiddleware, async (req, res) => {
  const { cart_products } = req.body;
  const loggedInUser = req.session.user;

  /**
   * @Todo Validate arrray with Joi
   * @important
   */

  try {
    cart_products.map(async (eachCartProduct) => {
      const eachProductID = eachCartProduct.product_id;
      const eachProductCount = eachCartProduct.product_count;
      try {
        const productData = await CartQueries.selectCartByProductAndUserID([
          loggedInUser,
          eachProductID,
        ]);
        if (productData.rowCount < 1) {
          console.log("Product didn't exist");
          return;
        }

        const productExist = productData.rows[0];
        if (productExist.seller_user_id === loggedInUser) {
          console.log("You cannot add your own product to cart!");
          return;
        }
        // If product count exist for product_id, add incoming count to it
        if (productExist.product_count) {
          const newProductCount = productExist.product_count + eachProductCount;
          if (newProductCount > maxCartProduct) {
            console.log("Max product quantity you can add to cart is 20");
            return;
          }
          await CartQueries.updateCart([newProductCount, eachProductID, loggedInUser]);
          await CartQueries.deleteCartProductFromSavedItem([eachProductID, loggedInUser]);
          console.log("Cart updated successfully!");
        } else {
          await CartQueries.insertCart([eachProductID, eachProductCount, loggedInUser]);
          console.log("Product added to cart successfully!");
        }
      } catch (error) {
        console.log("An error caught while saving bulk cart:", error);
      }
    });
    return res.status(200).json({ message: "Cart updated successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

/**
 * @todo Pass string as an id to check if database will throw error.
 */
router.put("/remove-product-from-cart/:cart_id", UserAuthMiddleware, async (req, res) => {
  let { cart_id } = req.params;
  const { product_count } = req.body;
  const loggedInUser = req.session.user;
  cart_id = parseInt(cart_id);

  if (!cart_id)
    return res.status(400).json({ error: "cart_id is required and must be a number" });

  const { error } = validateRemoveFromCart(req.body);
  if (error) return res.status(400).json({ error: errorMessageGetter(error) });

  try {
    const cartData = await CartQueries.selectCartByID([cart_id, loggedInUser]);
    if (cartData.rowCount < 1) return res.status(400).json({ error: "Cart didnot exist!" });

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

router.get("/get-buyer-cart", async (req, res) => {
  const loggedInUser = req.session.user;

  try {
    const userCartData = await CartQueries.selectAllCartProductByUserID(loggedInUser);
    if (userCartData.rowCount < 1) return res.status(400).json({ error: "Cart is empty!" });
    userCartData.rows.map((eachProductData) => {
      return (eachProductData.images = eachProductData.images.map((eachImages) =>
        JSON.parse(eachImages)
      ));
    });
    return res.status(200).json({ data: userCartData.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error, try agin!" });
  }
});

export default router;
