const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const {
  toMinutes,
  toTime,
  dayName,
  isValidDate,
  todayISO,
  nowMinutes,
  generateSlots,
  trimSeconds,
} = require('../utils/time');

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates the booking request and attaches a clean `req.booking` object:
 * { doctor, date, startTime, endTime, patient }
 */
const validateAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId, date, startTime, patient } = req.body || {};
  const errors = [];

  if (!doctorId) errors.push('doctorId is required');
  if (!isValidDate(date)) errors.push('date must be in YYYY-MM-DD format');
  if (!/^\d{2}:\d{2}$/.test(startTime || '')) errors.push('startTime must be in HH:MM format');

  const name = (patient?.name || '').trim();
  const phone = (patient?.phone || '').trim();
  const email = (patient?.email || '').trim();

  if (name.length < 2) errors.push('Patient name must be at least 2 characters');
  if (!PHONE_REGEX.test(phone)) errors.push('Phone number must be exactly 10 digits');
  if (email && !EMAIL_REGEX.test(email)) errors.push('Email address is not valid');

  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const [doctors] = await db.query('SELECT * FROM doctors WHERE doctor_id = ?', [doctorId]);
  if (!doctors.length) return res.status(404).json({ message: 'Doctor not found' });
  const doctor = doctors[0];

  if (!doctor.available_days.split(',').includes(dayName(date))) {
    return res.status(400).json({ message: `${doctor.name} is not available on ${dayName(date)}s` });
  }

  const validStarts = generateSlots(
    trimSeconds(doctor.start_time),
    trimSeconds(doctor.end_time),
    doctor.slot_minutes
  ).map((slot) => slot.start);

  if (!validStarts.includes(startTime)) {
    return res.status(400).json({ message: 'That time is outside the doctor\'s working hours or not on a slot boundary' });
  }

  if (date < todayISO() || (date === todayISO() && toMinutes(startTime) <= nowMinutes())) {
    return res.status(400).json({ message: 'You cannot book a slot in the past' });
  }

  req.booking = {
    doctor,
    date,
    startTime,
    endTime: toTime(toMinutes(startTime) + doctor.slot_minutes),
    patient: { name, phone, email: email || null },
  };
  return next();
});

module.exports = validateAppointment;
