import { useState } from 'react';

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns an object of field -> error message (empty when everything is valid)
const validate = ({ name, phone, email }) => {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please enter the patient\'s full name';
  if (!PHONE_REGEX.test(phone)) errors.phone = 'Phone must be exactly 10 digits';
  if (email && !EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address';
  return errors;
};

const BookingForm = ({ disabled, submitting, onSubmit, onInvalid }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'phone' ? value.replace(/\D/g, '') : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined })); // clear the error as the user fixes it
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      onInvalid(Object.values(found)[0]);
      return;
    }
    const ok = await onSubmit({ name: form.name.trim(), phone: form.phone, email: form.email.trim() });
    if (ok) setForm({ name: '', phone: '', email: '' });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Patient name
        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ravi Kumar" />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </label>

      <label>
        Phone number
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={10}
          placeholder="10-digit mobile number"
        />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </label>

      <label>
        Email <small>(optional)</small>
        <input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </label>

      <button type="submit" className="primary" disabled={disabled || submitting}>
        {submitting ? 'Booking…' : 'Confirm appointment'}
      </button>
    </form>
  );
};

export default BookingForm;
