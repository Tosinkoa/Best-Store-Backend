import pool from "../../../LIB/DB-Client.js";

export const AuthenticationQueries = {
  selectUserDetailByEmail(email) {
    return pool.query("SELECT id, email, password FROM users WHERE email = $1", [email]);
  },
  selectPhoneNumber(phoneNumber) {
    return pool.query("SELECT phone_number FROM users WHERE phone_number = $1", [
      phoneNumber,
    ]);
  },
  insertUser(userDetails) {
    return pool.query(
      "INSERT INTO users (first_name, last_name, email, phone_number, password) VALUES ($1, $2, $3, $4, $5)",
      [...userDetails]
    );
  },
};
