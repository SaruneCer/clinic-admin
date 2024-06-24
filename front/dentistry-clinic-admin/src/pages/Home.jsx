import { useState, useEffect } from "react";
import { useGetData } from "../customHooks/useGetData";
import { useEditData } from "../customHooks/useEditData";
import { useDeleteData } from "../customHooks/useDeleteData";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import { CreateScheduleModal } from "../components/CreateScheduleModal";
import { AlertModal } from "../components/AlertModal";
import { ScheduleModal } from "../components/ScheduleModal";
import { FaCalendarAlt } from "react-icons/fa";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import DatePicker from "react-datepicker";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../styles/customCalendar.css";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/home.css";

const DragAndDropCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

export function Home() {
  const { data: schedules, loading, rerender } = useGetData("schedules");
  const { data: doctors } = useGetData("doctors");
  const { data: procedures, loading: proceduresLoading } =
    useGetData("procedures");
  const { editData } = useEditData();
  const { deleteData } = useDeleteData();

  const [selectedDoctorID, setSelectedDoctorID] = useState("");
  const [events, setEvents] = useState([]);
  const [isCreateScheduleModalOpen, setCreateScheduleModalOpen] =
    useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [view, setView] = useState(Views.DAY);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!schedules) return;

    const filteredEvents = schedules
      .filter((schedule) => moment(schedule.start).isSame(selectedDate, "day"))
      .map((schedule) => ({
        id: schedule._id,
        title: schedule.title || "Untitled",
        start: new Date(schedule.start),
        end: new Date(schedule.end),
        allDay: false,
        data: {
          procedure: schedule.data.procedure,
          comment: schedule.data.comment || "",
        },
        resourceId: schedule.doctorID,
        tooltip: `Procedure: ${schedule.data.procedure}, Comment: ${
          schedule.data.comment || "No comment"
        }`,
        patientID: schedule.patientID || "",
        patientPhone: schedule.patientPhone || "",
      }));

    setEvents(filteredEvents);
  }, [schedules, selectedDate]);

  const handleDoctorChange = (event) => {
    const doctorID = event.target.value;
    setSelectedDoctorID(doctorID);

    if (doctorID) {
      setView(Views.WORK_WEEK);
    } else {
      setView(Views.DAY);
    }
    setSelectedDate(new Date());
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const isEventOverlapping = (newEvent, eventsToCheck) => {
    return eventsToCheck.some((existingEvent) => {
      return (
        newEvent.resourceId === existingEvent.resourceId &&
        ((newEvent.start >= existingEvent.start &&
          newEvent.start < existingEvent.end) ||
          (newEvent.end > existingEvent.start &&
            newEvent.end <= existingEvent.end) ||
          (newEvent.start <= existingEvent.start &&
            newEvent.end >= existingEvent.end))
      );
    });
  };

  const handleOpenCreateScheduleModal = (slotInfo) => {
    const day = slotInfo.start.getDay();

    if (day === 0 || day === 6) {
      setAlertMessage(
        "You cannot create events on Saturdays or Sundays. Please choose a work day."
      );
      setIsAlertModalOpen(true);
      return;
    }

    const newEvent = {
      resourceId: slotInfo.resourceId,
      start: slotInfo.start,
      end: slotInfo.end,
    };

    const isOverlapping = isEventOverlapping(newEvent, events);

    if (!isOverlapping) {
      setSelectedSlot(slotInfo);
      setCreateScheduleModalOpen(true);
    } else {
      setAlertMessage(
        "Your selected time overlaps with an existing appointment. Please choose another time."
      );
      setIsAlertModalOpen(true);
    }
  };

  const handleCloseCreateScheduleModal = () => {
    setCreateScheduleModalOpen(false);
  };

  const handleCloseAlertModal = () => {
    setIsAlertModalOpen(false);
  };
  const handleMoveEvent = async ({ event, start, end, resourceId }) => {
    const newEvent = {
      id: event.id,
      resourceId: resourceId,
      start: start,
      end: end,
    };

    const isOverlapping = isEventOverlapping(newEvent, events);

    if (isOverlapping) {
      setAlertMessage("Your event overlaps with an existing appointment.");
      setIsAlertModalOpen(true);
      return;
    }

    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id
        ? { ...existingEvent, start, end, resourceId }
        : existingEvent
    );
    setEvents(updatedEvents);

    try {
      const updatedEvent = {
        ...event,
        start: start.toISOString(),
        end: end.toISOString(),
        doctorID: resourceId,
      };

      await editData("schedules", event.id, updatedEvent, "info");
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleResizeEvent = async ({ event, start, end }) => {
    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id
        ? { ...existingEvent, start, end }
        : existingEvent
    );
    setEvents(updatedEvents);

    try {
      const updatedEvent = {
        ...event,
        start: start.toISOString(),
        end: end.toISOString(),
      };

      await editData("schedules", event.id, updatedEvent, "info");
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDoubleClickEvent = (selectedEvent) => {
    setSelectedEvent(selectedEvent);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedEvent(null);
    setScheduleModalOpen(false);
  };

  const handleSaveEditedSchedule = async (editedInfo) => {
    try {
      await editData("schedules", editedInfo.id, editedInfo, "info");
      setScheduleModalOpen(false);
      setSelectedEvent(null);
      rerender();
    } catch (error) {
      console.error("Error editing procedure:", error);
    }
  };

  const handleDelete = async (scheduleToDelete) => {
    await deleteData("schedules", scheduleToDelete, () => rerender());
    setScheduleModalOpen(false);
  };

  if (proceduresLoading || !procedures) {
    return <p>Loading procedures...</p>;
  }

  if (loading || !doctors) {
    return <p>Loading...</p>;
  }

  if (!schedules) {
    return <p>No schedules found.</p>;
  }

  const now = new Date();

  const formats = {
    timeGutterFormat: "HH:mm",
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
        end,
        "HH:mm",
        culture
      )}`,
    agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
        end,
        "HH:mm",
        culture
      )}`,
    dayHeaderFormat: "dddd (MMMM D)",
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(
        start,
        "dddd (MMMM D)",
        culture
      )} - ${localizer.format(end, "dddd (MMMM D)", culture)}`,
  };

  const extractCategories = () => {
    const categoriesSet = new Set();
    procedures.forEach((procedure) => {
      if (procedure.category) {
        categoriesSet.add(procedure.category);
      }
    });
    return Array.from(categoriesSet);
  };

  const categories = extractCategories();

  const EventComponent = ({ event }) => {
    if (!event || !event.title) return null;
    return (
      <div>
        <div className="event-header-wrapper">
          <span className="custom-event-label">
            {event.start ? moment(event.start).format("HH:mm") : ""} -{" "}
            {event.end ? moment(event.end).format("HH:mm") : ""}
          </span>
          <h3 className="patient-name">{event.title}</h3>
        </div>

        <div className="procedure-comment-wrapper">
          <p className="procedure-title">{event.data?.procedure}</p>
          <p className="procedure-comment">{event.data?.comment || ""}</p>
        </div>
      </div>
    );
  };

  const CustomDatepickerInput = ({ value, onClick }) => {
    return (
      <div className="date-picker-input-group">
        <div className="calendar-icon-wrapper">
          <span className="calendar-icon">
            <FaCalendarAlt />
          </span>
        </div>
        <input
          type="text"
          className="form-control"
          value={value}
          onClick={onClick}
          readOnly
        />
      </div>
    );
  };

  const resources = selectedDoctorID
    ? doctors
        .filter((doctor) => doctor._id === selectedDoctorID)
        .map((doctor) => ({
          id: doctor._id,
          title: doctor.name,
        }))
    : doctors.map((doctor) => ({
        id: doctor._id,
        title: doctor.name,
      }));
  return (
    <main>
      <div id="calendar-container">
        <div className="selection-container">
          <div className="doctor-selection-wrapper">
            <select
              className="doctorSelect"
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

          <div className="date-picker-wrapper">
            <label>
              <DatePicker
                customInput={<CustomDatepickerInput />}
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
              />
            </label>
          </div>
        </div>

        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          resources={resources}
          resourceIdAccessor="id"
          resourceTitleAccessor="title"
          startAccessor="start"
          endAccessor="end"
          style={{ height: 1200 }}
          view={view}
          date={selectedDate}
          views={
            selectedDoctorID ? { day: true, work_week: true } : { day: true }
          }
          step={15}
          timeslots={1}
          min={new Date(new Date().setHours(8, 0, 0))}
          max={new Date(new Date().setHours(17, 0, 0))}
          showCurrentTimeIndicator={true}
          now={now}
          onEventDrop={handleMoveEvent}
          onEventResize={handleResizeEvent}
          onNavigate={setSelectedDate}
          popup
          resizable
          selectable
          onSelectSlot={handleOpenCreateScheduleModal}
          tooltipAccessor="tooltip"
          formats={formats}
          components={{
            event: EventComponent,
          }}
          onView={handleViewChange}
          onDoubleClickEvent={handleDoubleClickEvent}
        />
        {isCreateScheduleModalOpen && (
          <CreateScheduleModal
            resource="schedules"
            onClose={handleCloseCreateScheduleModal}
            rerender={rerender}
            slotInfo={selectedSlot}
            procedures={procedures}
            existingCategories={categories}
          />
        )}
        {isAlertModalOpen && (
          <AlertModal
            isOpen={isAlertModalOpen}
            message={alertMessage}
            onClose={handleCloseAlertModal}
            buttons={[
              {
                label: "Close",
                className: "cancel-button",
                onClick: handleCloseAlertModal,
              },
            ]}
          />
        )}
        {isScheduleModalOpen && (
          <ScheduleModal
            event={selectedEvent}
            onClose={handleCloseScheduleModal}
            onDelete={handleDelete}
            onSave={handleSaveEditedSchedule}
            doctors={doctors}
          />
        )}
      </div>
    </main>
  );
}
