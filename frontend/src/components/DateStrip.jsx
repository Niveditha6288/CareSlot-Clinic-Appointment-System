import { getNextDays } from '../utils/dateUtils';

const DAYS_TO_SHOW = 14;

// Horizontal strip of the next 14 days; days the doctor doesn't work are dimmed
const DateStrip = ({ selectedDate, onSelect, workingDays }) => {
  const days = getNextDays(DAYS_TO_SHOW);

  return (
    <section className="card">
      <h2>2. Pick a date</h2>
      <div className="date-strip">
        {days.map(({ iso, day, dayNum, month }) => {
          const off = workingDays && !workingDays.includes(day);
          return (
            <button
              key={iso}
              type="button"
              className={`date-pill ${selectedDate === iso ? 'selected' : ''} ${off ? 'off' : ''}`}
              onClick={() => onSelect(iso)}
              title={off ? 'Doctor not available this day' : ''}
            >
              <small>{day}</small>
              <strong>{dayNum}</strong>
              <small>{month}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default DateStrip;
