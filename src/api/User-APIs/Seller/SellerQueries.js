import pool from "../../../LIB/DB-Client.js";

export const SellerQueries = {
  selectSeller(userId, client) {
    return client.query("SELECT id, user_id,  business_name,  business_logo,  business_logo_key, about, state, city FROM sellers WHERE user_id = $1", [userId]);
  },
  setUserAsSeller(sellerData, client) {
    return client.query("UPDATE users SET role = $1 WHERE id = $2", [...sellerData]);
  },
  insertNewSeller(sellerData, client) {
    return client.query("INSERT INTO sellers (business_name, business_logo, business_logo_key, about, state, city, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [...sellerData]);
  },
  updateSeller(sellerData, client) {
    return client.query("UPDATE sellers SET business_name = $1, business_logo = $2, business_logo_key = $3, about = $4, state = $5, city = $6 WHERE id = $7 RETURNING *", [...sellerData]);
  },

  selectOneSeller(sellerId) {
    return pool.query(
      "SELECT s.id, s.user_id, s.business_name, s.business_logo, s.about, s.state, s.city, u.first_name, u.last_name, u.profile_picture, u.phone_number, u.created_at FROM sellers s LEFT JOIN users u ON s.user_id = u.id  WHERE s.id = $1",
      [sellerId]
    );
  },

  selectLoggedInSeller(userId) {
    return pool.query(
      "SELECT s.id, s.user_id, s.business_name, s.business_logo, s.about, s.state, s.city, u.first_name, u.last_name, u.profile_picture, u.phone_number, u.created_at FROM sellers s LEFT JOIN users u ON s.user_id = u.id  WHERE s.user_id = $1",
      [userId]
    );
  },
  selectAllSellers(dataToSelect) {
    return pool.query(
      "SELECT s.id, s.user_id, s.business_name, s.business_logo, s.about, s.state, s.city, u.first_name, u.last_name, u.profile_picture, u.phone_number, u.created_at  FROM sellers s LEFT JOIN users u ON s.user_id = u.id LIMIT $1 OFFSET $2",
      [...dataToSelect]
    );
  },
};
