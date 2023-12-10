import pool from "../../../LIB/DB-Client.js";

export const UserQueries = {
  selectUserCount(queryPayload) {
    return pool.query(
      "SELECT COUNT(*) AS total_user_count FROM users WHERE role != $1 AND role != $2",
      [...queryPayload]
    );
  },
  selectTodayUserCount(queryPayload) {
    return pool.query(
      "SELECT COUNT(*) AS total_seller_count FROM users WHERE role != $1 AND role != $2 AND created_at >= CURRENT_DATE::TIMESTAMP AND created_at < CURRENT_DATE::TIMESTAMP + INTERVAL '1 day'",
      [...queryPayload]
    );
  },
};
