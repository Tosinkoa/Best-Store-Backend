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
    return pool.query("SELECT role FROM users WHERE id = $1", [...payload]);
  },
};
