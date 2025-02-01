const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Doctor = require("../models/Doctor"); // Assuming you have a Doctor model

const router = express.Router();

const MAIN_ADMIN_USERNAME = process.env.MAIN_ADMIN_USERNAME;
const MAIN_ADMIN_PASSWORD = process.env.MAIN_ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || "defaultSecretKey";

// Main Admin Login
router.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  if (username === MAIN_ADMIN_USERNAME && password === MAIN_ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "main-admin" }, JWT_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ token, message: "Admin login successful" });
  } else {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }
});

// Doctor Login
router.post("/doctor-login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ username });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: doctor._id, role: "doctor" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token, doctor: { id: doctor._id, name: doctor.name } });
  } catch (err) {
    console.error(err);  // Log the error for debugging
    res.status(500).json({ message: "Error logging in", error: "Internal server error" });
  }
});

module.exports = router;
