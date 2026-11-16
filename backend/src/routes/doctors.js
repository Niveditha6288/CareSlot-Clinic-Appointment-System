const express = require('express');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { dayName, isValidDate, generateSlots, trimSeconds } = require('../utils/time');

const router = express.Router();

// GET /api/doctors  (optional ?specialization=Cardiology)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { specialization } = req.query;
    const [rows] = specialization
      ? await db.query('SELECT * FROM doctors WHERE specialization = ? ORDER BY name', [specialization])
      : await db.query('SELECT * FROM doctors ORDER BY name');

    res.json(
      rows.map((d) => ({
        doctorId: d.doctor_id,
        name: d.name,
        specialization: d.specialization,
        availableDays: d.available_days.split(','),
        startTime: trimSeconds(d.start_time),
        endTime: trimSeconds(d.end_time),
        slotMinutes: d.slot_minutes,
      }))
    );
  })
);

// GET /api/doctors/:id/slots?date=YYYY-MM-DD
// Returns every slot for that day marked "available" or "booked"
router.get(
  '/:id/slots',
  asyncHandler(async (req, res) => {
    const { date } = req.query;
    if (!isValidDate(date)) return res.status(400).json({ message: 'date query param (YYYY-MM-DD) is required' });

    const [doctors] = await db.query('SELECT * FROM doctors WHERE doctor_id = ?', [req.params.id]);
    if (!doctors.length) return res.status(404).json({ message: 'Doctor not found' });
    const doctor = doctors[0];

    const working = doctor.available_days.split(',').includes(dayName(date));
    if (!working) return res.json({ working: false, date, slots: [] });

    const [booked] = await db.query(
      `SELECT start_time FROM appointments
        WHERE doctor_id = ? AND appointment_date = ? AND status = 'BOOKED'`,
      [doctor.doctor_id, date]
    );
    const bookedStarts = new Set(booked.map((b) => trimSeconds(b.start_time)));

    const slots = generateSlots(trimSeconds(doctor.start_time), trimSeconds(doctor.end_time), doctor.slot_minutes).map(
      (slot) => ({ ...slot, status: bookedStarts.has(slot.start) ? 'booked' : 'available' })
    );

    return res.json({ working: true, date, slots });
  })
);

// GET /api/doctors/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM doctors WHERE doctor_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Doctor not found' });
    return res.json(rows[0]);
  })
);

module.exports = router;
