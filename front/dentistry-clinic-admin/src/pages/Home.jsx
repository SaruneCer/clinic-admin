import { useState } from "react";
import { useGetData } from "../customHooks/useGetData";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export function Home() {
  const { data: schedules, loading } = useGetData("schedules");
  const { data: doctors } = useGetData("doctors");

  const [selectedDoctorID, setSelectedDoctorID] = useState(null);

  const handleDoctorChange = (event) => {
      setSelectedDoctorID(event.target.value);
  };

  if (loading || !doctors) {
    return <p>Loading...</p>;
  }

  if (!schedules) {
    return <p>No schedules found.</p>;
  }

  const events = schedules
    .filter(
      (schedule) =>
        !selectedDoctorID || schedule.doctorID === selectedDoctorID
    )
    .map((schedule) => ({
      title: schedule.title,
      start: new Date(schedule.start),
      end: new Date(moment(schedule.end).add(15, "minutes")),
      allDay: false,
      tooltipAccessor: schedule.description,
    }));
  return (
    <div className="home">
      <h1>Schedule</h1>

      <div>
        <label htmlFor="doctorSelect">Select Doctor: </label>
        <select
          id="doctorSelect"
          onChange={handleDoctorChange}
          value={selectedDoctorID || ""}
        >
          <option value=""></option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name}
            </option>
          ))}
        </select>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 400 }}
        defaultView="week"
        views={["day", "week", "month"]}
        step={15}
        timeslots={1}
        min={new Date(new Date().setHours(8, 0, 0))}
        max={new Date(new Date().setHours(17, 0, 0))}
        tooltipAccessor={(event) => event.tooltipAccessor}
      />
    </div>
  );
}
