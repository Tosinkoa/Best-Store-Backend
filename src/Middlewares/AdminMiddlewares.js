import pool from "../LIB/DB-Client.js";

export const AdminAuthMiddleware = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "You're unauthorized!" });
  }
  const userData = await pool.query("SELECT role FROM users WHERE id = $1", [
    req.session.user,
  ]);
  const userExist = userData.rows[0];
  // If user role is not admin, dissaprove user request
  if (userData.rowCount < 1 || userExist.role !== "admin") {
    return res.status(401).json({ error: "You're unauthorized!" });
  }

  next();
};

export const AdminAuthAndOtpVerifiedMiddleware = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "You're unauthorized!" });
  }
  // Check if admin has a valid secret saved
  const adminSecret = await pool.query("SELECT verified FROM otp_auth WHERE user_id = $1", [
    req.session.user,
  ]);

  const allAdminSecrets = adminSecret.rows[0];
  if (adminSecret.rowCount < 1) return res.status(401).json({ error: "You're unauthorized!" });
  if (!allAdminSecrets.verified)
    return res.status(401).json({ error: "You're unauthorized!" });

  next();
};
