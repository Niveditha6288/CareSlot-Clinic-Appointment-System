-- Patient Appointment & Clinic Scheduling App - MySQL 8 schema
CREATE DATABASE IF NOT EXISTS clinic_scheduler;
USE clinic_scheduler;

CREATE TABLE IF NOT EXISTS doctors (
  doctor_id      INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  available_days VARCHAR(40)  NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri',  -- comma-separated day names
  start_time     TIME         NOT NULL,
  end_time       TIME         NOT NULL,
  slot_minutes   INT          NOT NULL DEFAULT 30,
  CONSTRAINT chk_doctor_hours CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  phone      CHAR(10)     NOT NULL UNIQUE,
  email      VARCHAR(120),
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id   INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id        INT  NOT NULL,
  patient_id       INT  NOT NULL,
  appointment_date DATE NOT NULL,
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  status           ENUM('BOOKED', 'CANCELLED') NOT NULL DEFAULT 'BOOKED',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Only BOOKED rows produce a key, so cancelled slots can be rebooked while
  -- two active bookings for the same doctor/date/start can never coexist.
  slot_key VARCHAR(40) GENERATED ALWAYS AS (
    IF(status = 'BOOKED', CONCAT(doctor_id, '|', appointment_date, '|', start_time), NULL)
  ) STORED,

  -- NOTE: no ON DELETE CASCADE here - MySQL does not allow cascading actions on
  -- columns used by a stored generated column.
  CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors  (doctor_id),
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients (patient_id),
  CONSTRAINT chk_appt_times  CHECK (end_time > start_time),
  UNIQUE KEY uq_active_slot (slot_key),
  INDEX idx_doctor_date (doctor_id, appointment_date)
);
