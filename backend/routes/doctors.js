const express = require("express");
const bcrypt = require("bcrypt");
const Doctor = require("../models/Doctor");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Add a Doctor
router.post("/", verifyToken("main-admin"), async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newDoctor = new Doctor({ name, username, email, password: hashedPassword });
    await newDoctor.save();
    res.status(201).json({ message: "Doctor created successfully" });
  } catch (err) {
    console.error('Error creating doctor:', err.message);
    res.status(500).json({ message: "Error creating doctor", error: err });
  }
});

// Get All Doctors
router.get("/", verifyToken("main-admin"), async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Error fetching doctors", error: err });
  }
});

// Delete a Doctor
router.delete("/:id", verifyToken("main-admin"), async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting doctor", error: err });
  }
});

module.exports = router;
