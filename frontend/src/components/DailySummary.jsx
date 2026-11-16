import { formatLong, to12Hour } from '../utils/dateUtils';

// Doctor-wise summary for the selected date (data comes from the JOIN + subquery endpoint)
const DailySummary = ({ summary, date }) => (
  <section className="card">
    <h2>Clinic schedule · {formatLong(date)}</h2>
    {summary.length === 0 ? (
      <p className="muted">No data for this day.</p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>Doctor</th>
            <th>Booked</th>
            <th>First</th>
            <th>Last ends</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row) => (
            <tr key={row.doctorId}>
              <td>
                {row.doctorName}
                <small>{row.specialization}</small>
              </td>
              <td>
                {row.bookedCount} / {row.totalSlots}
              </td>
              <td>{row.firstAppointment ? to12Hour(row.firstAppointment) : '—'}</td>
              <td>{row.lastAppointment ? to12Hour(row.lastAppointment) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </section>
);

export default DailySummary;
