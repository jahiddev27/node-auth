const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const generateOtp = require("../utils/generateOtp");
const transporter = require("../config/mail");


// ===============================
// REGISTER USER
// ===============================
const register = async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      password,
    } = req.body;

    // সব field দেওয়া হয়েছে কিনা check
    if (!username || !email || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Email আগে আছে কিনা check
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Phone আগে আছে কিনা check
    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      return res.status(400).json({
        message: "Phone already exists",
      });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // নতুন user তৈরি
    const user = await User.create({
      username,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};



//password

// ===============================
// LOGIN WITH PASSWORD
// ===============================
const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Email অথবা phone না দিলে error
    if (!login || !password) {
      return res.status(400).json({
        message: "Email/Phone and password are required",
      });
    }

    // Email অথবা phone দিয়ে user খোঁজা
    const user = await User.findOne({
      $or: [
        { email: login },
        { phone: login },
      ],
    });

    // User না পাওয়া গেলে
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Password match
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};



//otp

// ===============================
// SEND OTP
// ===============================
const sendOtp = async (req, res) => {
  try {
    const { login } = req.body;

    if (!login) {
      return res.status(400).json({
        message: "Email or phone is required",
      });
    }

    // Email অথবা phone দিয়ে user খোঁজা
    const user = await User.findOne({
      $or: [
        { email: login },
        { phone: login },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // OTP generate
    const otp = generateOtp();

    // OTP 5 মিনিট valid
    const otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Database-এ OTP save
    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    // Email OTP
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Login OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
      html: `
        <h2>Login OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "OTP sending failed",
      error: error.message,
    });
  }
};



// otp verify

// ===============================
// VERIFY OTP
// ===============================
const verifyOtp = async (req, res) => {
  try {
    const { login, otp } = req.body;

    if (!login || !otp) {
      return res.status(400).json({
        message: "Email/Phone and OTP are required",
      });
    }

    // User খোঁজা
    const user = await User.findOne({
      $or: [
        { email: login },
        { phone: login },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // OTP match
    if (user.otp !== otp) {
      return res.status(401).json({
        message: "Invalid OTP",
      });
    }

    // OTP expire হয়েছে কিনা
    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(401).json({
        message: "OTP expired",
      });
    }

    // OTP ব্যবহার হয়ে গেলে delete
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    // JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "OTP login successful",

      token,

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};



module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
};