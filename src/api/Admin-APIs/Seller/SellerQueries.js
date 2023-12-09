import pool from "../../../LIB/DB-Client.js";

export const SellerQueries = {
  selectSellerCount(queryPayload) {
    return pool.query("SELECT COUNT(*) AS total_seller_count FROM users WHERE role = $1", [
      ...queryPayload,
    ]);
  },
  selectTodaySellerCount(queryPayload) {
    return pool.query(
      "SELECT COUNT(*) AS total_seller_count FROM users WHERE role = $1 AND DATE(created_at) = CURRENT_DATE",
      [...queryPayload]
    );
  },
};
