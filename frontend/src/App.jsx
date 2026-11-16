import { useCallback, useEffect, useState } from 'react';
import { bookAppointment, getDoctors, getSlots, getSummary } from './api';
import { formatLong, to12Hour, todayISO } from './utils/dateUtils';
import Alert from './components/Alert';
import DoctorList from './components/DoctorList';
import DateStrip from './components/DateStrip';
import SlotGrid from './components/SlotGrid';
import BookingForm from './components/BookingForm';
import DailySummary from './components/DailySummary';

const App = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [slotData, setSlotData] = useState({ working: true, slots: [] });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((type, message) => setAlert({ type, message }), []);
  const closeAlert = useCallback(() => setAlert(null), []);

  // Load doctors once
  useEffect(() => {
    getDoctors()
      .then(setDoctors)
      .catch(() => showAlert('error', 'Could not load doctors. Is the backend running?'));
  }, [showAlert]);

  // Slot availability is state-driven: it reloads whenever the doctor or date changes
  const loadSlots = useCallback(async () => {
    if (!doctor) return;
    setLoadingSlots(true);
    try {
      setSlotData(await getSlots(doctor.doctorId, date));
    } catch (err) {
      showAlert('error', err.message);
    } finally {
      setLoadingSlots(false);
    }
  }, [doctor, date, showAlert]);

  const loadSummary = useCallback(() => {
    getSummary(date)
      .then(setSummary)
      .catch(() => setSummary([]));
  }, [date]);

  useEffect(() => {
    setSelectedSlot(null);
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleBook = async (patient) => {
    if (!doctor) {
      showAlert('warning', 'Please choose a doctor first.');
      return false;
    }
    if (!selectedSlot) {
      showAlert('warning', 'Please select a time slot before confirming.');
      return false;
    }

    const confirmed = window.confirm(
      `Book ${doctor.name} on ${formatLong(date)} at ${to12Hour(selectedSlot)} for ${patient.name}?`
    );
    if (!confirmed) return false;

    setSubmitting(true);
    try {
      const result = await bookAppointment({ doctorId: doctor.doctorId, date, startTime: selectedSlot, patient });
      showAlert('success', result.message);
      setSelectedSlot(null);
      loadSlots();
      loadSummary();
      return true;
    } catch (err) {
      showAlert('error', err.message);
      loadSlots(); // someone else may have taken the slot - refresh the indicators
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🩺 CareSlot</h1>
        <p>Book a consultation with your doctor in three quick steps.</p>
      </header>

      <Alert alert={alert} onClose={closeAlert} />

      <DoctorList doctors={doctors} selectedId={doctor?.doctorId} onSelect={setDoctor} />

      <DateStrip selectedDate={date} onSelect={setDate} workingDays={doctor?.availableDays} />

      <section className="card">
        <h2>3. Select a slot &amp; enter details</h2>
        {doctor ? (
          <>
            <SlotGrid
              slots={slotData.slots}
              working={slotData.working}
              date={date}
              loading={loadingSlots}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
            />
            <hr />
            <BookingForm
              disabled={!selectedSlot}
              submitting={submitting}
              onSubmit={handleBook}
              onInvalid={(message) => showAlert('warning', message)}
            />
          </>
        ) : (
          <p className="muted">Choose a doctor above to see available slots.</p>
        )}
      </section>

      <DailySummary summary={summary} date={date} />
    </div>
  );
};

export default App;
