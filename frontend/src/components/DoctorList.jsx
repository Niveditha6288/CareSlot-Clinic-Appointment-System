const DoctorList = ({ doctors, selectedId, onSelect }) => (
  <section className="card">
    <h2>1. Choose a doctor</h2>
    <div className="doctor-grid">
      {doctors.map((doc) => (
        <button
          key={doc.doctorId}
          type="button"
          className={`doctor-card ${selectedId === doc.doctorId ? 'selected' : ''}`}
          onClick={() => onSelect(doc)}
        >
          <strong>{doc.name}</strong>
          <span>{doc.specialization}</span>
          <small>
            {doc.availableDays.join(', ')} · {doc.startTime}–{doc.endTime}
          </small>
        </button>
      ))}
    </div>
  </section>
);

export default DoctorList;
