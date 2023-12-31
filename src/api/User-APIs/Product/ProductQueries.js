import pool from "../../../LIB/DB-Client.js";

export const ProductQueries = {
  selectLoggedInUser(payload) {
    return pool.query("SELECT first_name, last_name, email FROM users WHERE id = $1", [
      ...payload,
    ]);
  },

  selectCategoryAndSubCategory(payload) {
    return pool.query(
      "SELECT c.id as category_id, c.name as category_name, sc.sub_cat_names, sc.id as sub_category_id FROM categories c LEFT JOIN sub_categories sc ON c.id = sc.category_id AND sc.id = $1 WHERE c.id = $2",
      [...payload]
    );
  },

  selectOneSeller(payload) {
    return pool.query(
      "SELECT s.id as seller_id FROM users u LEFT JOIN sellers s ON u.id = s.user_id WHERE u.id = $1",
      [payload]
    );
  },

  insertNewProduct(payload) {
    return pool.query(
      "INSERT INTO products(name, description, price, bargain, in_stock, crossed_out_price, seller_id, category_id, sub_category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [...payload]
    );
  },

  updateProduct(payload) {
    return pool.query(
      "UPDATE products SET name = $1, description = $2, price = $3, bargain = $4, in_stock = $5, crossed_out_price = $6, category_id = $7, sub_category_id = $8 WHERE id = $9",
      [...payload]
    );
  },

  getProductById(payload) {
    return pool.query("SELECT * FROM products WHERE id = $1", [payload]);
  },

  selectProductDataById(payload) {
    return pool.query(
      "SELECT p.*, c.id category_id, c.name category_name, sub_cat.id sub_category_id, sub_cat.sub_cat_names sub_category_name, p_img.images FROM products p LEFT JOIN product_images p_img ON p.id = p_img.product_id LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN sub_categories sub_cat ON p.sub_category_id = sub_cat.id WHERE p.id = $1",
      [payload]
    );
  },

  selectAllProduct(payload) {
    return pool.query(
      "SELECT p.*, s.business_name, s.business_logo, p_img.images FROM products p LEFT JOIN product_images p_img ON p.id = p_img.product_id LEFT JOIN sellers s ON p.seller_id = s.id ORDER BY p.id LIMIT $1 OFFSET $2",
      [...payload]
    );
  },

  selectMultiplePaymentProduct(payload) {
    return pool.query("SELECT seller_id, price FROM products WHERE id = ANY($1::int[])", [
      ...payload,
    ]);
  },

  selectBuyerCartByUserID(payload) {
    return pool.query(
      "SELECT c.id, c.product_count, p.id product_id, p.price, p.seller_id FROM carts c LEFT JOIN products p ON c.product_id = p.id WHERE user_id = $1",
      [...payload]
    );
  },

  selectAllProductBySellerID(payload) {
    return pool.query(
      "SELECT p.*, p_img.images FROM products p LEFT JOIN product_images p_img ON p.id = p_img.product_id WHERE p.seller_id = $1 ORDER BY p.id DESC LIMIT $2 OFFSET $3",
      [...payload]
    );
  },

  saveProductImages(payload) {
    return pool.query("INSERT INTO product_images (product_id, images) VALUES($1, $2)", [
      ...payload,
    ]);
  },

  updateProductImages(payload) {
    return pool.query("UPDATE product_images SET images = $1 WHERE product_id = $2", [
      ...payload,
    ]);
  },

  selectImagesByProductID(payload) {
    return pool.query("SELECT images FROM product_images WHERE product_id = $1", [payload]);
  },

  selectAllProductDataBySubCategory(payload) {
    return pool.query(
      "SELECT p.*, s.business_name, s.business_logo, p_img.images FROM products p LEFT JOIN product_images p_img ON p.id = p_img.product_id LEFT JOIN sellers s ON p.seller_id = s.id WHERE sub_category_id = $1 ORDER BY p.id LIMIT $2 OFFSET $3",
      [...payload]
    );
  },

  selectAllCategories() {
    return pool.query("SELECT * FROM categories");
  },

  selectSubCategories(payload) {
    return pool.query("SELECT * FROM sub_categories sc WHERE sc.category_id = $1", [
      ...payload,
    ]);
  },

  addNewTransaction(payload) {
    return pool.query(
      "INSERT INTO transactions (user_id, tx_ref, amount) VALUES ($1, $2, $3) RETURNING id",
      [...payload]
    );
  },

  addNewProductPurchase(payload) {
    return pool.query(
      "INSERT INTO product_purchases (transaction_id, product_id, product_count, seller_id) VALUES ($1, $2, $3, $4) RETURNING id",
      [...payload]
    );
  },

  deleteUserProductFromCart(payload) {
    return pool.query("DELETE FROM carts WHERE  user_id = $1", [...payload]);
  },
};
