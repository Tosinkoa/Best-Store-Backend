import pool from "../../../LIB/DB-Client.js";

export const SavedItemsQueries = {
  selectProductByID(productId) {
    return pool.query(
      "SELECT p.id as product_id, si.id as saved_item_id FROM product p LEFT JOIN saved_items si ON p.id = si.product_id WHERE id = $1",
      [productId]
    );
  },
  saveProduct(dataToSave) {
    return pool.query("INSERT INTO saved_items (user_id, product_id) VALUES ($1, $2)", [
      ...dataToSave,
    ]);
  },
  selectSavedProductByID(savedProductId) {
    return pool.query("SELECT product_id FROM saved_products WHERE id = $1", [
      savedProductId,
    ]);
  },
  removeSavedProduct(savedProductData) {
    return pool.query("DELETE FROM saved_products WHERE id = $1 AND user_id = $2", [
      ...savedProductData,
    ]);
  },

  selectAllSavedProduct(loggedInUser) {
    return pool.query(
      "SELECT p.*, p_img.images FROM saved_items LEFT JOIN products p si ON p si.products_id = p.products_id LEFT JOIN product_images p_img ON p.id = p_img.product_id WHERE si.user_id = $1",
      [loggedInUser]
    );
  },
};
