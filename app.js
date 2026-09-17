require("dotenv").config();

const express = require("express");
const cors = require("cors");

const dbConnection = require("./config/db");
const authRoute = require("./routes/authRoute");

const app = express();


// JSON data receive করার জন্য
app.use(express.json());


// Frontend থেকে request allow করার জন্য
app.use(cors());


// MongoDB connect
dbConnection();


// Auth routes
app.use("/api/auth", authRoute);


// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
});


module.exports = app;