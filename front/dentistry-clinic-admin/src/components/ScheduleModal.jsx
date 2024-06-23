import { useState, useEffect } from "react";
import { Button } from "./Button";
// import "../styles/schedule-modal.css";

export function ScheduleModal({ event, onSave, onClose, onDelete }) {
  console.log(event);
  const toDateTimeLocalString = (date) => {
    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [formData, setFormData] = useState(event);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        eventID: event.id,
        doctorID: event.resourceId,
        patientName: event.title,
        procedure: event.data.procedure,
        comment: event.data.comment,
        start: event.start ? toDateTimeLocalString(new Date(event.start)) : "",
        end: event.end ? toDateTimeLocalString(new Date(event.end)) : "",
      });
    }
  }, [event]);

  const formatDateAndTime = (date) => {
    const pad = (number) => number.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validateForm = () => {
    const newErrors = {};

    const { start, end } = formData;
    if (new Date(start) >= new Date(end)) {
      newErrors.start = "Start time must be before end time";
      newErrors.end = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const structuredData = {
      id: formData.eventID,
      title: formData.patientName,
      start: formatDateAndTime(new Date(formData.start)),
      end: formatDateAndTime(new Date(formData.end)),
      doctorID: formData.doctorID,
      data: {
        procedure: formData.procedure,
        comment: formData.comment,
      },
    };
    console.log(structuredData);

    onSave(structuredData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const renderFormFields = (formData) => {
    return Object.keys(formData).map((key) => {
      if (key === "eventID") return null;
      const value = formData[key];
      return (
        <div className="edit-form-input" key={key}>
          <label htmlFor={key}>
            {key.charAt(0).toUpperCase() +
              key.slice(1).replace(/([A-Z])/g, " $1")}
            :
          </label>
          <input
            type={key === "start" || key === "end" ? "datetime-local" : "text"}
            id={key}
            name={key}
            value={value}
            onChange={handleChange}
            required={key === "start" || key === "end"}
          />
          {errors[key] && <p className="error-message">{errors[key]}</p>}
        </div>
      );
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <h2>Appointment Info</h2>
        <form className="edit-form">
          {renderFormFields(formData)}
          <div className="modal-buttons">
            <Button buttonText="SAVE" onClick={handleSave} />
            <Button buttonText="CANCEL" onClick={onClose} />
            <Button buttonText="DELETE APPOINTMENT" onClick={onDelete} />
          </div>
        </form>
      </div>
    </div>
  );
}
