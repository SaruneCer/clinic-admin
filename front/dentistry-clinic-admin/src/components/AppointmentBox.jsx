export function AppointmentBox({ item }) {
  return (
    <div className="appointment-box">
      <div className="appointment-date">{item.appointmentDate}</div>
      <div className="appointment-doctor">{item.doctorName}</div>
      <div className="appointment-report">{item.report}</div>
    </div>
  );
}

