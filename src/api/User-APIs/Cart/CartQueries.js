import pool from "../../../LIB/DB-Client.js";
export const CartQueries = {
  selectCartByProductAndUserID(IDs) {
    return pool.query(
      "SELECT p.id as product_id, p.seller_id, s.user_id as seller_user_id, c.product_count FROM products p LEFT JOIN sellers s ON p.seller_id = s.id LEFT JOIN carts c ON p.id = c.product_id AND c.user_id = $1 WHERE p.id = $2",
      [...IDs]
    );
  },
  insertCart(cartData) {
    return pool.query(
      "INSERT INTO carts (product_id, product_count, user_id) VALUES ($1, $2, $3)",
      [...cartData]
    );
  },
  updateCart(cartData) {
    return pool.query(
      "UPDATE carts SET product_count = $1 WHERE product_id = $2 AND user_id = $3",
      [...cartData]
    );
  },
  selectCartByID(cartData) {
    return pool.query("SELECT product_count FROM carts WHERE id = $1 AND user_id = $2", [
      ...cartData,
    ]);
  },
  updateCartByID(cartData) {
    return pool.query("UPDATE carts SET product_count = $1 WHERE id = $2", [...cartData]);
  },
  deleteCartByID(cartId) {
    return pool.query("DELETE FROM carts WHERE id = $1", [cartId]);
  },
  selectAllCartIDByUserID(userId) {
    return pool.query("SELECT id FROM carts WHERE user_id = $1", [userId]);
  },
  selectAllCartProductByUserID(userId) {
    return pool.query(
      "SELECT c.id, c.product_count, p.id product_id, p.name, p.price, p.crossed_out_price, p_img.images FROM carts c LEFT JOIN products p ON c.product_id = p.id LEFT JOIN product_images p_img ON p.id = p_img.product_id WHERE user_id = $1",
      [userId]
    );
  },
  deleteCartProductFromSavedItem(savedItemData) {
    return pool.query("DELETE FROM saved_items WHERE product_id = $1 AND user_id = $2", [
      ...savedItemData,
    ]);
  },
  addBulkPoductToCart(cart_products, loggedInUser) {

  },
};
