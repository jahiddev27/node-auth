const jwt = require("jsonwebtoken");

// User ID দিয়ে JWT token তৈরি
const generateToken = (userId) => {
  return jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;