const BASE = '/api';

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
  return data;
};

export const getDoctors = () => request('/doctors');

export const getSlots = (doctorId, date) => request(`/doctors/${doctorId}/slots?date=${date}`);

export const bookAppointment = (payload) =>
  request('/appointments', { method: 'POST', body: JSON.stringify(payload) });

export const getSummary = (date) => request(`/appointments/summary?date=${date}`);
