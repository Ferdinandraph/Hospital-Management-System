const express = require("express");
const Appointment = require("../models/Appointment");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Create an Appointment (Doctor only)
router.post("/", verifyToken("doctor"), async (req, res) => {
  const { patientId, date, reason } = req.body;
  const doctorId = req.user.id;

  try {
    const newAppointment = new Appointment({
      patientId,
      doctorId, 
      date,
      reason,
    });

    await newAppointment.save();
    res.status(201).json({ message: "Appointment created successfully", appointment: newAppointment });
  } catch (err) {
    res.status(500).json({ message: "Error creating appointment", error: err });
  }
});


// Get all Appointments (Doctor only)
router.get("/", verifyToken("doctor"), async (req, res) => {
  try {
    console.log("Request User ID:", req.user?.id);
    const appointments = await Appointment.find({ doctorId: req.user.id })
      .populate("patientId", "name age phone") // Populate patient details
      .select("date reason patientId");


    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments", error: err });
  }
});



// Update Appointment (Doctor only)
router.put("/:id", verifyToken("doctor"), async (req, res) => {
  const { date, reason } = req.body;

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id, // Use `req.params.id` to match the appointment being updated
      { date, reason },
      { new: true }
    )
      .populate("patientId", "name age phone")
      .populate("doctorId", "name username");

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (err) {
    console.error("Error in updating appointment:", err); // Log detailed error
    res.status(500).json({ message: "Error updating appointment", error: err.message });
  }
});



// Delete Appointment (Doctor only)
router.delete("/:id", verifyToken("doctor"), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting appointment", error: err });
  }
});

module.exports = router;
