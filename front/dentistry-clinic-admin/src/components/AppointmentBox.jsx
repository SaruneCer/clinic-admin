export function AppointmentBox({ item }) {
  return (
    <div className="appointment-box">
      <div className="appointment-date">
        <strong>Date</strong> | {item.appointmentDate}
      </div>
      <div className="appointment-doctor">
        <strong>Doctor</strong> | {item.doctorName}
      </div>
      <br />
      <div className="appointment-report">{item.report}</div>
    </div>
  );
}
