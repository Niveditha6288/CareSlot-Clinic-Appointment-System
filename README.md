# 🩺 CareSlot: Patient Appointment & Clinic Scheduling App

A lightweight system where patients book consultation slots with specific doctors based on schedule availability.

| Layer | Tech | Highlights |
|---|---|---|
| Frontend | React + Vite, modern JS | ES6 arrow-function date helpers, state-driven slot indicators, interactive validation alerts |
| Backend | Node.js + Express | Modular `/doctors` and `/appointments` routers, middleware that blocks overlapping bookings |
| Database | MySQL | Doctors, Patients, Appointments tables; JOINs and subqueries for daily doctor-wise summaries |
| Version control | Git + GitHub | Issue templates, CI workflow, protected `main` branch |

## Project structure

```
clinic-scheduler/
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/db.js                 # MySQL connection pool
│       ├── routes/doctors.js            # /api/doctors
│       ├── routes/appointments.js       # /api/appointments
│       ├── middleware/validateAppointment.js
│       ├── middleware/checkOverlap.js   # overlapping-booking guard
│       └── utils/                       # time helpers, asyncHandler
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       ├── utils/dateUtils.js           # custom ES6 arrow functions
│       └── components/                  # DoctorList, DateStrip, SlotGrid, BookingForm, Alert, DailySummary
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── queries.sql                      # JOIN + subquery examples
├── docs/GITHUB_SETUP.md
└── .github/                             # issue templates, PR template, CI
```

## Getting started

**Requirements:** Node.js 18+ and MySQL 8+

### 1. Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # then put your MySQL password in .env
npm install
npm run dev                 # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173, choose a doctor, pick a date, select a slot and enter patient details.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors` | List all doctors |
| GET | `/api/doctors/:id` | One doctor |
| GET | `/api/doctors/:id/slots?date=YYYY-MM-DD` | Slots for that day marked `available` / `booked` |
| POST | `/api/appointments` | Book a slot (validated + overlap-checked) |
| GET | `/api/appointments/summary?date=` | Doctor-wise daily summary (JOIN + subqueries) |
| GET | `/api/appointments/schedule?date=` | Full day schedule (3-table JOIN) |
| PATCH | `/api/appointments/:id/cancel` | Cancel an appointment |

**POST /api/appointments body**
```json
{
  "doctorId": 1,
  "date": "2026-11-20",
  "startTime": "09:30",
  "patient": { "name": "Ravi Kumar", "phone": "9876543210", "email": "ravi@example.com" }
}
```
Returns `201` on success, `400` for invalid input, `409` if the slot overlaps an existing booking.

## How the key requirements are met

- **Dynamic date selection / ES6 arrow functions:** `frontend/src/utils/dateUtils.js` (`getNextDays`, `addDays`, `formatLong`, `to12Hour`, `isPastSlot`, …).
- **State-driven slot indicators:** `SlotGrid.jsx` colours each slot green / red / grey / blue from React state; slots reload whenever doctor or date changes and after every booking.
- **Interactive alerts:** `Alert.jsx` (dismissible success / error / warning banners), field-level errors in `BookingForm.jsx`, and a confirmation dialog before booking.
- **Overlap middleware:** `checkOverlap.js` rejects a booking when `existing.start < requested.end AND existing.end > requested.start`. A unique index on active slots in `schema.sql` protects against two simultaneous requests.
- **SQL JOINs & subqueries:** `queries.sql` and `routes/appointments.js` (`/summary` uses a LEFT JOIN with scalar subqueries for first/last appointment).

## Git workflow

See [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) for the branching strategy, issue tracker setup and branch protection rules for `main`.

## Future improvements
- Doctor and admin login
- Email / SMS confirmation
- Reschedule flow and patient appointment history
