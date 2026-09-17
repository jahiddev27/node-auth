const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {
    res.status(200).json({
      message: "Profile data",
      user: req.user,
    });
  }
);

const {
  register,
  login,
  sendOtp,
  verifyOtp,
} = require("../controllers/authController");


// Registration
router.post("/register", register);


// Password login
router.post("/login", login);


// OTP send
router.post("/send-otp", sendOtp);


// OTP verify
router.post("/verify-otp", verifyOtp);


module.exports = router;