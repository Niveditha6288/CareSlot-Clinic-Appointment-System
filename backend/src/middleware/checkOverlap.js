const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Blocks a booking when the same doctor already has an active appointment
 * whose time range overlaps the requested one.
 *
 * Two ranges overlap when: existing.start < requested.end AND existing.end > requested.start
 *
 * (The database also has a unique index on active slots as a last line of
 * defence against two people booking at the exact same moment.)
 */
const checkOverlap = asyncHandler(async (req, res, next) => {
  const { doctor, date, startTime, endTime } = req.booking;

  const [rows] = await db.query(
    `SELECT appointment_id
       FROM appointments
      WHERE doctor_id = ?
        AND appointment_date = ?
        AND status = 'BOOKED'
        AND start_time < ?
        AND end_time > ?
      LIMIT 1`,
    [doctor.doctor_id, date, endTime, startTime]
  );

  if (rows.length) {
    return res.status(409).json({
      message: `${doctor.name} already has an appointment overlapping ${startTime}-${endTime}. Please choose another slot.`,
    });
  }
  return next();
});

module.exports = checkOverlap;
