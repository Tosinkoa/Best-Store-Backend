import pool from "../../../LIB/DB-Client.js";

export const ProductQueries = {
  selectProductCount() {
    return pool.query("SELECT COUNT(*) AS total_product_count FROM products");
  },
  selectTodaysProductCount() {
    return pool.query(
      "SELECT COUNT(*) AS total_product_count FROM products WHERE DATE(created_at) = CURRENT_DATE"
    );
  },
};
