import pool from "../../../LIB/DB-Client.js";

export const AuthenticationQueries = {
  selectAdminDetailByEmail(payload) {
    return pool.query("SELECT id, email, password, role  FROM users WHERE email = $1", [
      ...payload,
    ]);
  },

  selectAdmin(payload) {
    return pool.query("SELECT id FROM otp_auth WHERE user_id = $1", [...payload]);
  },

  updateAdminAuthSecret(payload) {
    return pool.query(
      "UPDATE otp_auth SET temp_secret = $1, valid_secret = $2 WHERE user_id = $3",
      [...payload]
    );
  },

  updateAdminOtpVerified(payload) {
    return pool.query("UPDATE otp_auth SET verified = $1 WHERE user_id = $2", [...payload]);
  },

  updateAllAdminSecrets(payload) {
    return pool.query(
      "UPDATE otp_auth SET temp_secret = $1, verified = $2, valid_secret = $3 WHERE user_id = $4",
      [...payload]
    );
  },

  updateAdminSecrets(payload) {
    return pool.query("UPDATE otp_auth SET valid_secret = $1 WHERE user_id = $2", [
      ...payload,
    ]);
  },

  insertAdminAuthSecret(payload) {
    return pool.query("INSERT INTO otp_auth (temp_secret, user_id) VALUES ($1, $2)", [
      ...payload,
    ]);
  },

  selectLoggedInUserRole(payload) {
    return pool.query("SELECT role FROM users WHERE id = $1", [...payload]);
  },

  selectLoggedInAdminScerets(payload) {
    return pool.query(
      "SELECT temp_secret, valid_secret, verified FROM otp_auth WHERE user_id = $1",
      [...payload]
    );
  },
};
