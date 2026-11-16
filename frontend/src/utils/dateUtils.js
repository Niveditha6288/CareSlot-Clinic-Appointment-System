// Custom ES6 arrow-function helpers for date selection

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n) => String(n).padStart(2, '0');

// Date -> "2026-11-16" (local time, not UTC)
export const toISODate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// "2026-11-16" -> Date (local midnight)
export const fromISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayISO = () => toISODate(new Date());

export const addDays = (iso, days) => {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

export const dayShort = (iso) => DAYS[fromISODate(iso).getDay()];

// Next N days starting today, shaped for the date strip
export const getNextDays = (count = 14) =>
  Array.from({ length: count }, (_, i) => {
    const iso = addDays(todayISO(), i);
    const date = fromISODate(iso);
    return { iso, day: DAYS[date.getDay()], dayNum: date.getDate(), month: MONTHS[date.getMonth()] };
  });

// "2026-11-16" -> "Mon, 16 Nov 2026"
export const formatLong = (iso) => {
  const date = fromISODate(iso);
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

// "14:30" -> "2:30 PM"
export const to12Hour = (time) => {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${pad(m)} ${suffix}`;
};

// A slot on today's date whose start time has already passed
export const isPastSlot = (iso, startTime) => {
  if (iso !== todayISO()) return false;
  const [h, m] = startTime.split(':').map(Number);
  const now = new Date();
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
};
