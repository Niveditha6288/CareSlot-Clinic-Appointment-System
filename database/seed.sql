USE clinic_scheduler;

-- Clear old data first so this script can be run again safely.
-- TRUNCATE also resets the IDs to 1, which the sample bookings below rely on.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE appointments;
TRUNCATE TABLE patients;
TRUNCATE TABLE doctors;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO doctors (name, specialization, available_days, start_time, end_time, slot_minutes) VALUES
  ('Dr. Anitha Rao',    'General Physician', 'Mon,Tue,Wed,Thu,Fri,Sat', '09:00', '13:00', 30),
  ('Dr. Karthik Menon', 'Cardiology',        'Mon,Wed,Fri',             '10:00', '16:00', 30),
  ('Dr. Sneha Reddy',   'Dermatology',       'Tue,Thu,Sat',             '11:00', '17:00', 30),
  ('Dr. Imran Khan',    'Pediatrics',        'Mon,Tue,Wed,Thu,Fri',     '09:30', '14:30', 20);

INSERT INTO patients (name, phone, email) VALUES
  ('Ravi Kumar',  '9876543210', 'ravi@example.com'),
  ('Priya Nair',  '9123456780', 'priya@example.com'),
  ('Arjun Singh', '9988776655', NULL);

-- A few sample bookings for today so the daily summary has data
INSERT INTO appointments (doctor_id, patient_id, appointment_date, start_time, end_time) VALUES
  (1, 1, CURDATE(), '09:00', '09:30'),
  (1, 2, CURDATE(), '09:30', '10:00'),
  (2, 3, CURDATE(), '10:30', '11:00'),
  (4, 1, CURDATE(), '10:10', '10:30');
