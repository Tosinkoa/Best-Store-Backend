import pool from "../../../LIB/DB-Client.js";

export const AuthenticationQueries = {
  selectAdminDetailByEmail(payload) {
    return pool.query("SELECT id, email, password, role  FROM users WHERE email = $1", [
      ...payload,
    ]);
  },

  updateAdminAuthSecret(payload) {
    return pool.query(
      "UPDATE admin_auth SET valid_secret = NULL, temp_secret = $1 WHERE user_id = $2 RETURNING *",
      [...payload]
    );
  },

  insertAdminAuthSecret(payload) {
    const data = pool.query(
      "INSERT INTO admin_auth (temp_secret, user_id) VALUES ($1, $2) RETURNING *",
      [[...payload]]
    );
    return data;
  },
};
