const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token required",
      });
    }

    // Bearer Token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    // JWT verify
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // User database থেকে নেওয়া
    const user = await User.findById(decoded.userId)
      .select("-password -otp -otpExpires");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Request-এর মধ্যে user রাখা
    req.user = user;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;