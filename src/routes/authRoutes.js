
const express = require('express');
const router = express.Router();

const {register,login} = require("../controllers/authController");
const {verifyToken,authorizeRoles} = require("../middlewares/authMiddleware");

//public endopoints

router.post("/register",register);
router.post("/login",login);

//secure protectected route rbac test

router.get("/admin-dashboard", verifyToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin to Dashboard!" });
});

module.exports = router;

