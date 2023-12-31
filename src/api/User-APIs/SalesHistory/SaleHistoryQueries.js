import pool from "../../../LIB/DB-Client.js";

export const SaleHistoryQueries = {
  selectSellerSalesHistory(payload) {
    return pool.query(
      "SELECT pp.created_at date_purchased, pp.id, pp.product_count, p_img.images, p.name product, pp.product_id, t.amount, t.user_id, u.first_name buyer_first_name, u.last_name buyer_last_name FROM product_purchases pp LEFT JOIN sellers s ON pp.seller_id = s.id LEFT JOIN products p ON pp.product_id = p.id LEFT JOIN product_images p_img ON pp.product_id = p_img.product_id LEFT JOIN transactions t ON pp.transaction_id = t.id LEFT JOIN users u ON t.user_id = u.id WHERE s.user_id = $1",
      [...payload]
    );
  },
};
