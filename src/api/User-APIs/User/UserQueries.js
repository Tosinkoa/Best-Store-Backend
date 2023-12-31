import pool from "../../../LIB/DB-Client.js";

export const UserQueries = {
  selectLoggedInUser(payload) {
    return pool.query(
      "SELECT first_name, last_name, email, role, profile_picture, phone_number FROM users WHERE id = $1",
      [...payload]
    );
  },
  saveLoggedInUserData(payload) {
    return pool.query(
      "UPDATE users SET first_name = $1, last_name = $2, phone_number = $3, profile_picture = $4, profile_picture_key = $5 WHERE id = $6",
      [...payload]
    );
  },
};
