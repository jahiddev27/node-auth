const jwt = require("jsonwebtoken");

// yoken Verification
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied! No Token Provided." });

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey123");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or Expired Token!" });
  }
};


const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission for this action!" });
    }
    next();
  };
};


module.exports = { 
  verifyToken, 
  authorizeRoles 
};