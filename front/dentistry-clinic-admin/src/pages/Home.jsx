import { useState, useEffect } from "react";
import { useGetData } from "../customHooks/useGetData";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/customCalendar.css";

const localizer = momentLocalizer(moment);

export function Home() {
  const { data: schedules, loading } = useGetData("schedules");
  const { data: doctors } = useGetData("doctors");

  const [selectedDoctorID, setSelectedDoctorID] = useState("");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!schedules) return;
    
    const filteredEvents = schedules
      .filter(schedule => !selectedDoctorID || schedule.doctorID === selectedDoctorID)
      .map(schedule => ({
        title: schedule.title || "Untitled", 
        start: new Date(schedule.start), 
        end: new Date(schedule.end), 
        allDay: false,
        tooltipAccessor: schedule.description,
      }));

    setEvents(filteredEvents);
  }, [schedules, selectedDoctorID]);

  const handleDoctorChange = (event) => {
    setSelectedDoctorID(event.target.value);
  };

  if (loading || !doctors) {
    return <p>Loading...</p>;
  }

  if (!schedules) {
    return <p>No schedules found.</p>;
  }

  const now = new Date();

  return (
    <div className="home">
      <h1>Schedule</h1>

      <div>
        <label htmlFor="doctorSelect">Select Doctor: </label>
        <select
          id="doctorSelect"
          onChange={handleDoctorChange}
          value={selectedDoctorID}
        >
          <option value="">All Doctors</option>
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
        style={{ height: 600 }}
        defaultView={Views.WORK_WEEK} 
        views={{ work_week: true, day: true, month: true }}
        step={15}
        timeslots={1}
        min={new Date(new Date().setHours(8, 0, 0))}
        max={new Date(new Date().setHours(17, 0, 0))}
        tooltipAccessor={(event) => event.tooltipAccessor}
        showCurrentTimeIndicator={true}
        now={now}
        scrollToTime={now}
      />
    </div>
  );
}
