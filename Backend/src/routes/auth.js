const express = require("express");
const router = express.Router();
const passport = require("../config/passport/passport-config");

router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "https://phuchungclinic.vercel.app/login" }),
  (req, res) => {
    // Thành công, trả về thông tin người dùng dưới dạng JSON
    const userData = {
      ...req.user._doc,
      expiresAt: Date.now() + 3600000 // 1 giờ
    };
    const redirectUrl = `https://phuchungclinic.vercel.app/google-auth-success?user=${encodeURIComponent(JSON.stringify(userData))}`;
    res.redirect(redirectUrl);
  }
);

router.get("/user", passport.authenticate("google", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
}));

module.exports = router;
