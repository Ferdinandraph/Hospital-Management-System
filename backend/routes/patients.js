const express = require("express");
const Patient = require("../models/Patient");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Add Patient
router.post("/", verifyToken("doctor"), async (req, res) => {
  const { name, age, address, phone } = req.body;
  const doctorId = req.user.id;

  try {
    const newPatient = new Patient({ doctorId, name, age, address, phone });
    await newPatient.save();
    res.status(201).json({ message: "Patient added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding patient", error: err });
  }
});

// Get All Patients
router.get("/", verifyToken("doctor"), async (req, res) => {
  try {
    const patients = await Patient.find({doctorId: req.user.id});
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching patients", error: err });
  }
});

module.exports = router;

// Update Patient
router.put("/:id", verifyToken("doctor"), async (req, res) => {
  const { id } = req.params;
  const { name, age, address, phone } = req.body;

  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { name, age, address, phone },
      { new: true }
    );
    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json({ message: "Patient updated successfully", updatedPatient });
  } catch (err) {
    res.status(500).json({ message: "Error updating patient", error: err });
  }
});

// Delete Patient
router.delete("/:id", verifyToken("doctor"), async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPatient = await Patient.findByIdAndDelete(id);
    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting patient", error: err });
  }
});

