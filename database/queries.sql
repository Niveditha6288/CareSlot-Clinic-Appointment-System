USE clinic_scheduler;

-- 1) Daily doctor-wise summary  (LEFT JOIN + scalar subqueries)
--    Replace CURDATE() with any date, e.g. '2026-11-20'
SELECT d.doctor_id,
       d.name AS doctor_name,
       d.specialization,
       COUNT(a.appointment_id) AS booked_count,
       FLOOR(TIME_TO_SEC(TIMEDIFF(d.end_time, d.start_time)) / 60 / d.slot_minutes) AS total_slots,
       (SELECT MIN(x.start_time) FROM appointments x
         WHERE x.doctor_id = d.doctor_id AND x.appointment_date = CURDATE() AND x.status = 'BOOKED') AS first_appointment,
       (SELECT MAX(x.end_time) FROM appointments x
         WHERE x.doctor_id = d.doctor_id AND x.appointment_date = CURDATE() AND x.status = 'BOOKED') AS last_appointment
  FROM doctors d
  LEFT JOIN appointments a
         ON a.doctor_id = d.doctor_id
        AND a.appointment_date = CURDATE()
        AND a.status = 'BOOKED'
 GROUP BY d.doctor_id, d.name, d.specialization, d.start_time, d.end_time, d.slot_minutes
 ORDER BY d.name;

-- 2) Full day schedule  (INNER JOINs across all three tables)
SELECT d.name AS doctor, a.start_time, a.end_time, p.name AS patient, p.phone
  FROM appointments a
  JOIN doctors  d ON d.doctor_id  = a.doctor_id
  JOIN patients p ON p.patient_id = a.patient_id
 WHERE a.appointment_date = CURDATE() AND a.status = 'BOOKED'
 ORDER BY d.name, a.start_time;

-- 3) Doctors busier than average today  (subquery inside HAVING)
SELECT d.name, COUNT(*) AS bookings
  FROM appointments a
  JOIN doctors d ON d.doctor_id = a.doctor_id
 WHERE a.appointment_date = CURDATE() AND a.status = 'BOOKED'
 GROUP BY d.doctor_id, d.name
HAVING COUNT(*) > (
         SELECT AVG(per_doctor.cnt)
           FROM (SELECT COUNT(*) AS cnt
                   FROM appointments
                  WHERE appointment_date = CURDATE() AND status = 'BOOKED'
                  GROUP BY doctor_id) AS per_doctor
       );

-- 4) Patients who have never cancelled  (NOT IN subquery)
SELECT patient_id, name
  FROM patients
 WHERE patient_id NOT IN (SELECT patient_id FROM appointments WHERE status = 'CANCELLED');

-- 5) Overlap check used by the API middleware (returns a row if the slot clashes)
SELECT appointment_id
  FROM appointments
 WHERE doctor_id = 1
   AND appointment_date = CURDATE()
   AND status = 'BOOKED'
   AND start_time < '10:30'   -- requested end
   AND end_time   > '10:00'   -- requested start
 LIMIT 1;
