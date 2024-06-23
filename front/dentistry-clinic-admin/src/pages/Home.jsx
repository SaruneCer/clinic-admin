import { useState, useEffect } from "react";
import { useGetData } from "../customHooks/useGetData";
import { useEditData } from "../customHooks/useEditData";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import { AddFormModal } from "../components/AddFormModal";
import { AlertModal } from "../components/AlertModal";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import "../styles/customCalendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";


const DragAndDropCalendar = withDragAndDrop(Calendar);

const localizer = momentLocalizer(moment);

export function Home() {
  const { data: schedules, loading, rerender } = useGetData("schedules");
  const { data: doctors } = useGetData("doctors");
  const { editData } = useEditData();

  const [selectedDoctorID, setSelectedDoctorID] = useState("");
  const [events, setEvents] = useState([]);
  const [isAddFormModalOpen, setIsAddFormModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [view, setView] = useState(Views.DAY);

  useEffect(() => {
    if (!schedules) return;

    const filteredEvents = schedules
      .filter(
        (schedule) =>
          !selectedDoctorID || schedule.doctorID === selectedDoctorID
      )
      .map((schedule) => ({
        id: schedule._id,
        title: schedule.title || "Untitled",
        start: new Date(schedule.start),
        end: new Date(schedule.end),
        allDay: false,
        data: {
          procedure: schedule.data.procedure,
          comment: schedule.data.comment,
        },
        resourceId: selectedDoctorID ? selectedDoctorID : schedule.doctorID,
        tooltip: `Procedure: ${schedule.data.procedure}, Comment: ${schedule.data.comment}`,
      }));

    setEvents(filteredEvents);
  }, [schedules, selectedDoctorID]);

  const handleDoctorChange = (event) => {
    const doctorID = event.target.value;
    setSelectedDoctorID(doctorID);

    if (doctorID) {
      setView(Views.WORK_WEEK);
    } else {
      setView(Views.DAY);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleOpenAddModal = (slotInfo) => {
    const isOverlapping = events.some((event) => {
      return (
        event.resourceId === slotInfo.resourceId &&
        ((slotInfo.start >= event.start && slotInfo.start < event.end) ||
          (slotInfo.end > event.start && slotInfo.end <= event.end) ||
          (slotInfo.start <= event.start && slotInfo.end >= event.end))
      );
    });

    if (!isOverlapping) {
      setSelectedSlot(slotInfo);
      setIsAddFormModalOpen(true);
    } else {
      setIsAlertModalOpen(true);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddFormModalOpen(false);
  };

  const handleCloseAlertModal = () => {
    setIsAlertModalOpen(false);
  };

  const handleMoveEvent = async ({ event, start, end }) => {
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
      // rerender();
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
      // rerender();
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

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

  const EventComponent = ({ event }) => {
    if (!event || !event.title) return null;
    return (
      <div>
        <div className="header-wrapper">
          <h3 className="patient-name">{event.title}</h3>
          <i className="fas fa-file-medical" alt="Write medical report"></i>
        </div>

        <div className="procedure-comment-wrapper">
          {" "}
          <p className="procedure-title">{event.data?.procedure}</p>
          <p className="procedure-comment">{event.data?.comment}</p>
        </div>
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
      <div className="home">
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
          views={
            selectedDoctorID
              ? { day: true, work_week: true, month: true }
              : { day: true }
          }
          step={15}
          timeslots={1}
          min={new Date(new Date().setHours(8, 0, 0))}
          max={new Date(new Date().setHours(17, 0, 0))}
          showCurrentTimeIndicator={true}
          now={now}
          onEventDrop={handleMoveEvent}
          onEventResize={handleResizeEvent}
          popup
          resizable
          selectable
          onSelectSlot={handleOpenAddModal}
          tooltipAccessor="tooltip"
          //   scrollToTime={now}
          formats={formats}
          components={{
            event: EventComponent,
          }}
          onView={handleViewChange}
        />
        {isAddFormModalOpen && (
          <AddFormModal
            resource="schedules"
            onClose={handleCloseAddModal}
            rerender={rerender}
            existingCategories={[]}
            slotInfo={selectedSlot}
          />
        )}
        {isAlertModalOpen && (
          <AlertModal
            isOpen={isAlertModalOpen}
            message={`Your selected time overlaps with an existing appointment, please choose another time.`}
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
      </div>
    </main>
  );
}

