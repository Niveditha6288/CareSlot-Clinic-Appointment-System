const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "09:30" or "09:30:00" -> 570
const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// 570 -> "09:30"
const toTime = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};

// "09:30:00" -> "09:30"
const trimSeconds = (time) => time.slice(0, 5);

// "2026-11-16" -> "Mon" (parsed as a local date, so no timezone shifts)
const dayName = (isoDate) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return DAY_NAMES[new Date(y, m - 1, d).getDay()];
};

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value));

const todayISO = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const nowMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

// Build every slot in a doctor's working window
const generateSlots = (startTime, endTime, slotMinutes) => {
  const slots = [];
  const end = toMinutes(endTime);
  for (let t = toMinutes(startTime); t + slotMinutes <= end; t += slotMinutes) {
    slots.push({ start: toTime(t), end: toTime(t + slotMinutes) });
  }
  return slots;
};

module.exports = {
  toMinutes,
  toTime,
  trimSeconds,
  dayName,
  isValidDate,
  todayISO,
  nowMinutes,
  generateSlots,
};
