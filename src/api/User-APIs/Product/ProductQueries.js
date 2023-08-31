import pool from "../../../LIB/DB-Client.js";

export const ProductQueries = {
  selectCartegoryAndSubCartegory(cartegoryAndSubCartegoryID) {
    return pool.query(
      "SELECT c.id, c.name as cartegory_name, sc.sub_cart_names, sc.id as sub_cartegory_id FROM cartegories c LEFT JOIN sub_cartegories sc ON c.id = sc.cartegory_id AND sc.id = $1 WHERE c.id = $2",
      [...cartegoryAndSubCartegoryID]
    );
  },
  selectOneSeller(loggedInUser) {
    return pool.query(
      "SELECT s.id as seller_id FROM users u LEFT JOIN sellers s ON u.id = s.user_id WHERE u.id = $1",
      [loggedInUser]
    );
  },
  insertNewProduct(productData) {
    return pool.query(
      "INSERT INTO products (name, description, price, bargain, in_stock, crossed_out_price, seller_id, cartegory, sub_cartegory) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [...productData]
    );
  },
  updateProduct(productData) {
    return pool.query(
      "UPDATE products SET name = $1, description = $2, price = $3, bargain = $4, in_stock = $5, crossed_out_price = $6, cartegory = $7, sub_cartegory = $8 WHERE id = $9",
      [...productData]
    );
  },
  getProductById(productId) {
    return pool.query("SELECT * FROM products WHERE id = $1", [productId]);
  },
  selectProductDataById(productId) {
    return pool.query(
      "SELECT p.*, p_img.images FROM products p LEFT JOIN product_images p_img ON p.id = p_img.product_id WHERE p.id = $1",
      [productId]
    );
  },
  selectAllProductDataById(productData) {
    return pool.query(
      "SELECT p.*, p_img.images FROM products p LEFT JOIN product_images p_img ON p.id = p_img.product_id ORDER BY p.id LIMIT $1 OFFSET $2",
      [...productData]
    );
  },
  selectAllProductDataBySubCartegory(productData) {
    return pool.query(
      "SELECT p.*, p_img.images FROM products p LEFT JOIN product_images p_img ON p.id = p_img.product_id WHERE sub_cartegory = $1 ORDER BY p.id LIMIT $2 OFFSET $3",
      [...productData]
    );
  },
};
