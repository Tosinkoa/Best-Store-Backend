/**
 * @todo Check if user is blocked
 */
export const AuthMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "You're unauthorized!" });
  }
  next();
};
