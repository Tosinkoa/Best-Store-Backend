import pool from "../LIB/DB-Client.js";

export const UserAuthMiddleware = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "You're unauthorized!" });
  }
  const userData = await pool.query("SELECT role FROM users WHERE id = $1", [
    req.session.user,
  ]);
  const userExist = userData.rows[0];
  // If user role is block or admin or moderator, dissaprove user request
  if (userData.rowCount < 1 || ["block", "admin", "moderator"].includes(userExist.role)) {
    return res.status(401).json({ error: "You're unauthorized!" });
  }

  next();
};
