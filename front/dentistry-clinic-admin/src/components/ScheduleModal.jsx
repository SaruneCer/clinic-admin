import { useState, useEffect } from "react";
import { Button } from "./Button";
import { AlertModal } from "./AlertModal";
import { AddFormModal } from "./AddFormModal";
import { useGetData } from "../customHooks/useGetData";
import "../styles/schedule-modal.css";

export function ScheduleModal({ event, onSave, onClose, onDelete, doctors }) {
  const toDateTimeLocalString = (date) => {
    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [formData, setFormData] = useState(event);
  const [errors, setErrors] = useState({});
  const [isAlertModalOpen, setAlertModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [isAddFormModalOpen, setIsAddFormModalOpen] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const { data: patients, loading, rerender } = useGetData("patients");

  useEffect(() => {
    if (event) {
      const [firstName, lastName] = event.title.split(" ");

      setFormData({
        eventID: event.id,
        patientName: firstName || "",
        patientLastname: lastName || "",
        patientPhone: event.patientPhone || "",
        doctorID: event.resourceId,
        procedure: event.data.procedure,
        comment: event.data.comment || "",
        start: event.start ? toDateTimeLocalString(new Date(event.start)) : "",
        end: event.end ? toDateTimeLocalString(new Date(event.end)) : "",
        patientID: event.patientID,
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
      title: `${formData.patientName} ${formData.patientLastname}`,
      start: formatDateAndTime(new Date(formData.start)),
      end: formatDateAndTime(new Date(formData.end)),
      doctorID: formData.doctorID,
      patientID: formData.patientID,
      data: {
        procedure: formData.procedure,
        comment: formData.comment,
      },
    };

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

  const handleDeleteClick = () => {
    setScheduleToDelete(event.id);
    setAlertMessage("Do you want to delete this appointment?");
    setAlertModalOpen(true);
  };

  const handleCloseAlertModal = () => {
    setAlertModalOpen(false);
    setScheduleToDelete(null);
  };

  const handleAddPatientClick = () => {
    setIsAddingPatient(true);
    setIsAddFormModalOpen(true);
  };

  const handleAppointmentReportClick = () => {
    const eventPatientID = event.patientID;

    const isPatientExists = patients.some((patient) => {
      if (loading) {
        return false;
      }

      return patient._id === eventPatientID;
    });

    if (isPatientExists) {
      setIsAddingAppointment(true);
      setIsAddFormModalOpen(true);
    } else {
      setAlertMessage(
        "Patient does not exist in database. Please add patient first."
      );
      setAlertModalOpen(true);
    }
  };

  const handleAddFormCloseModal = () => {
    setIsAddFormModalOpen(false);
    setIsAddingAppointment(false);

    setIsAddingPatient(false);
  };

  const renderDoctorSelect = () => {
    return (
      <div className="input-wrapper">
        <label htmlFor="doctorID">Doctor:</label>
        <select
          id="doctorID"
          name="doctorID"
          value={formData.doctorID}
          onChange={handleChange}
        >
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderFormFields = () => {
    const leftColumnFields = [
      "patientName",
      "patientLastname",
      "patientPhone",
      "doctorID",
    ];
    const rightColumnFields = ["procedure", "comment", "start", "end"];

    return (
      <div className="form-columns">
        <div className="form-column">
          {leftColumnFields.map((key) => {
            if (key === "doctorID") {
              return renderDoctorSelect();
            }

            const value = formData[key];
            return (
              <div className="input-wrapper" key={key}>
                <label htmlFor={key}>
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}
                  :
                </label>
                <input
                  type={
                    key === "start" || key === "end" ? "datetime-local" : "text"
                  }
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  required={key === "start" || key === "end"}
                />
                {errors[key] && <p className="error-message">{errors[key]}</p>}
              </div>
            );
          })}
        </div>
        <div className="form-column">
          {rightColumnFields.map((key) => {
            const value = formData[key];
            return (
              <div className="input-wrapper" key={key}>
                <label htmlFor={key}>
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}
                  :
                </label>
                <input
                  type={
                    key === "start" || key === "end" ? "datetime-local" : "text"
                  }
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  required={key === "start" || key === "end"}
                />
                {errors[key] && <p className="error-message">{errors[key]}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="schedule-modal">
      <div className="schedule-modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <div className="schedule-modal-header-wrapper">
          {" "}
          <h2 className="modal-h2">Appointment Info</h2>
          <div className="schedule-buttons-wrapper">
            {" "}
            <Button
              buttonText="APPOINTMENT REPORT"
              onClick={handleAppointmentReportClick}
            />
            <Button
              buttonText={"ADD PATIENT"}
              onClick={handleAddPatientClick}
            />
          </div>
        </div>

        <form>
          {renderFormFields()}
          <div className="schedule-buttons-wrapper">
            <Button buttonText="SAVE" onClick={handleSave} />
            <Button buttonText="CANCEL" onClick={onClose} />
          </div>
        </form>
        <Button buttonText="DELETE APPOINTMENT" onClick={handleDeleteClick} />
      </div>
      {isAlertModalOpen && scheduleToDelete && (
        <AlertModal
          isOpen={isAlertModalOpen}
          message={alertMessage}
          onClose={handleCloseAlertModal}
          buttons={[
            {
              label: "Yes",
              className: "confirm-button",
              onClick: () => {
                onDelete(scheduleToDelete);
                handleCloseAlertModal();
              },
            },
            {
              label: "Cancel",
              className: "cancel-button",
              onClick: handleCloseAlertModal,
            },
          ]}
        />
      )}
      {isAlertModalOpen &&
        alertMessage ===
          "Patient does not exist in database. Please add patient first." && (
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
      {isAddFormModalOpen && isAddingAppointment && (
        <AddFormModal
          resource="appointments"
          onClose={handleAddFormCloseModal}
          existingCategories={[]}
          rerender={rerender}
          appointmentInfo={{
            doctorID: formData.doctorID,
            patientID: formData.patientID,
            date: formData.start,
          }}
        />
      )}
      {isAddFormModalOpen && isAddingPatient && (
        <AddFormModal
          resource="patients"
          onClose={handleAddFormCloseModal}
          existingCategories={[]}
          rerender={rerender}
        />
      )}
    </div>
  );
}
