const express = require('express');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const validateAppointment = require('../middleware/validateAppointment');
const checkOverlap = require('../middleware/checkOverlap');
const { isValidDate, trimSeconds } = require('../utils/time');

const router = express.Router();

// GET /api/appointments/summary?date=YYYY-MM-DD
// Daily doctor-wise summary: LEFT JOIN for the counts + subqueries for first/last appointment
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const { date } = req.query;
    if (!isValidDate(date)) return res.status(400).json({ message: 'date query param (YYYY-MM-DD) is required' });

    const [rows] = await db.query(
      `SELECT d.doctor_id,
              d.name AS doctor_name,
              d.specialization,
              COUNT(a.appointment_id) AS booked_count,
              FLOOR(TIME_TO_SEC(TIMEDIFF(d.end_time, d.start_time)) / 60 / d.slot_minutes) AS total_slots,
              (SELECT MIN(x.start_time) FROM appointments x
                WHERE x.doctor_id = d.doctor_id AND x.appointment_date = ? AND x.status = 'BOOKED') AS first_appointment,
              (SELECT MAX(x.end_time) FROM appointments x
                WHERE x.doctor_id = d.doctor_id AND x.appointment_date = ? AND x.status = 'BOOKED') AS last_appointment
         FROM doctors d
         LEFT JOIN appointments a
                ON a.doctor_id = d.doctor_id
               AND a.appointment_date = ?
               AND a.status = 'BOOKED'
        GROUP BY d.doctor_id, d.name, d.specialization, d.start_time, d.end_time, d.slot_minutes
        ORDER BY d.name`,
      [date, date, date]
    );

    res.json(
      rows.map((r) => ({
        doctorId: r.doctor_id,
        doctorName: r.doctor_name,
        specialization: r.specialization,
        bookedCount: Number(r.booked_count),
        totalSlots: Number(r.total_slots),
        firstAppointment: r.first_appointment ? trimSeconds(r.first_appointment) : null,
        lastAppointment: r.last_appointment ? trimSeconds(r.last_appointment) : null,
      }))
    );
  })
);

// GET /api/appointments/schedule?date=YYYY-MM-DD[&doctorId=1]
// Full list of the day's appointments: JOIN across appointments, doctors and patients
router.get(
  '/schedule',
  asyncHandler(async (req, res) => {
    const { date, doctorId } = req.query;
    if (!isValidDate(date)) return res.status(400).json({ message: 'date query param (YYYY-MM-DD) is required' });

    const params = [date];
    let doctorFilter = '';
    if (doctorId) {
      doctorFilter = 'AND a.doctor_id = ?';
      params.push(doctorId);
    }

    const [rows] = await db.query(
      `SELECT a.appointment_id, a.start_time, a.end_time,
              d.name AS doctor_name, d.specialization,
              p.name AS patient_name, p.phone
         FROM appointments a
         JOIN doctors  d ON d.doctor_id  = a.doctor_id
         JOIN patients p ON p.patient_id = a.patient_id
        WHERE a.appointment_date = ? AND a.status = 'BOOKED' ${doctorFilter}
        ORDER BY d.name, a.start_time`,
      params
    );

    res.json(
      rows.map((r) => ({
        appointmentId: r.appointment_id,
        startTime: trimSeconds(r.start_time),
        endTime: trimSeconds(r.end_time),
        doctorName: r.doctor_name,
        specialization: r.specialization,
        patientName: r.patient_name,
        phone: r.phone,
      }))
    );
  })
);

// POST /api/appointments
// Body: { doctorId, date, startTime, patient: { name, phone, email } }
router.post(
  '/',
  validateAppointment,
  checkOverlap,
  asyncHandler(async (req, res) => {
    const { doctor, date, startTime, endTime, patient } = req.booking;

    // Reuse the patient if the phone number is already registered
    const [existing] = await db.query('SELECT patient_id FROM patients WHERE phone = ?', [patient.phone]);
    let patientId;
    if (existing.length) {
      patientId = existing[0].patient_id;
      await db.query('UPDATE patients SET name = ?, email = COALESCE(?, email) WHERE patient_id = ?', [
        patient.name,
        patient.email,
        patientId,
      ]);
    } else {
      const [inserted] = await db.query('INSERT INTO patients (name, phone, email) VALUES (?, ?, ?)', [
        patient.name,
        patient.phone,
        patient.email,
      ]);
      patientId = inserted.insertId;
    }

    const [result] = await db.query(
      `INSERT INTO appointments (doctor_id, patient_id, appointment_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?)`,
      [doctor.doctor_id, patientId, date, startTime, endTime]
    );

    res.status(201).json({
      message: `Appointment confirmed with ${doctor.name} on ${date} at ${startTime}`,
      appointment: {
        appointmentId: result.insertId,
        doctorName: doctor.name,
        date,
        startTime,
        endTime,
        patientName: patient.name,
      },
    });
  })
);

// PATCH /api/appointments/:id/cancel
router.patch(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const [result] = await db.query(
      `UPDATE appointments SET status = 'CANCELLED' WHERE appointment_id = ? AND status = 'BOOKED'`,
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Active appointment not found' });
    return res.json({ message: 'Appointment cancelled' });
  })
);

module.exports = router;
