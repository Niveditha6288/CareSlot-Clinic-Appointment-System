import { isPastSlot, to12Hour } from '../utils/dateUtils';

// Turn the API status + the current time into one of: available | booked | past
const getSlotState = (slot, date) => (isPastSlot(date, slot.start) ? 'past' : slot.status);

const SlotGrid = ({ slots, working, date, loading, selectedSlot, onSelect }) => {
  if (loading) return <p className="muted">Loading slots…</p>;
  if (!working) return <p className="muted">The doctor is not available on this day. Please choose another date.</p>;

  const states = slots.map((slot) => getSlotState(slot, date));
  const availableCount = states.filter((s) => s === 'available').length;

  return (
    <>
      <p className="muted">
        <strong>{availableCount}</strong> of {slots.length} slots available
      </p>

      <div className="slot-grid">
        {slots.map((slot, i) => {
          const state = states[i];
          const isSelected = selectedSlot === slot.start;
          return (
            <button
              key={slot.start}
              type="button"
              disabled={state !== 'available'}
              className={`slot slot-${state} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(slot.start)}
            >
              {to12Hour(slot.start)}
            </button>
          );
        })}
      </div>

      <div className="legend">
        <span><i className="dot dot-available" /> Available</span>
        <span><i className="dot dot-booked" /> Booked</span>
        <span><i className="dot dot-past" /> Passed</span>
        <span><i className="dot dot-selected" /> Selected</span>
      </div>
    </>
  );
};

export default SlotGrid;
