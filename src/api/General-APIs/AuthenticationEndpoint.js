import express from "express";
const router = express.Router();

router.post("/logout", (req, res, next) => {
  req.session.user = null;
  req.session.save(function (err) {
    if (err) next(err);
    req.session.regenerate(function (err) {
      console.log(err);
      if (err) next(err);
      return res.status(200).json({ message: "Logged out successfully!" });
    });
  });
});

router.get("/auth", (req, res) => {
  try {
    if (!req.session.user) return res.status(400).send(false);
    return res.status(200).send(true);
  } catch (e) {
    res.status(400).send(false);
  }
});

export default router;
