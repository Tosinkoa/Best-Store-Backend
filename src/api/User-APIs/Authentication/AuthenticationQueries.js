import pool from "../../../LIB/DB-Client.js";

export const AuthenticationQueries = {
  selectUserDetailByEmail(payload) {
    return pool.query("SELECT id, email, role, password FROM users WHERE email = $1", [
      ...payload,
    ]);
  },

  selectPhoneNumber(payload) {
    return pool.query("SELECT phone_number FROM users WHERE phone_number = $1", [...payload]);
  },

  insertUser(payload) {
    return pool.query(
      "INSERT INTO users (first_name, last_name, email, phone_number, password) VALUES ($1, $2, $3, $4, $5)",
      [...payload]
    );
  },

  selectLoggedInUserRole(payload) {
    return pool.query("SELECT role, email FROM users WHERE id = $1", [...payload]);
  },

  insertUserAuthSecret(payload) {
    return pool.query("INSERT INTO otp_auth (valid_secret, user_id) VALUES ($1, $2)", [
      ...payload,
    ]);
  },

  selectLoggedInUserScerets(payload) {
    return pool.query(
      "SELECT id, valid_secret, verified, updated_at FROM otp_auth WHERE user_id = $1",
      [...payload]
    );
  },

  updateUserSecrets(payload) {
    return pool.query("UPDATE otp_auth SET valid_secret = $1 WHERE user_id = $2", [
      ...payload,
    ]);
  },

  updateUserVerified(payload) {
    return pool.query("UPDATE otp_auth SET verified = $1 WHERE user_id = $2", [...payload]);
  },
};
