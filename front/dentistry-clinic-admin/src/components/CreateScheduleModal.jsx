import { useState, useEffect } from "react";
import { usePostData } from "../customHooks/usePostData";
import { Button } from "./Button";
import { useSearch } from "../customHooks/useSearch";
import { SearchInput } from "./SearchInput";
import { useGetData } from "../customHooks/useGetData";
import "../styles/create-schedule-modal.css";

const formatDateAndTime = (dateString) => {
  const date = new Date(dateString);
  const pad = (number) => number.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const timezoneOffset = -date.getTimezoneOffset();
  const sign = timezoneOffset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60));
  const offsetMinutes = pad(Math.abs(timezoneOffset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
};

const toDateTimeLocalString = (date) => {
  const pad = (num) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function CreateScheduleModal({
  onClose,
  rerender,
  slotInfo,
  procedures,
  existingCategories,
}) {
  const initialFormData = {
    start: slotInfo.start
      ? toDateTimeLocalString(new Date(slotInfo.start))
      : "",
    end: slotInfo.end ? toDateTimeLocalString(new Date(slotInfo.end)) : "",
    phone: "",
    category: "",
    procedureName: "",
    comment: "",
    patientID: "",
    doctorID: slotInfo.resourceId,
  };

  const { data: patients } = useGetData("patients");
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [searchValue, setSearchValue, filteredPatients] = useSearch(patients);
  const { postData, isLoading } = usePostData("schedules");
  const [filteredProcedures, setFilteredProcedures] = useState([]);

  useEffect(() => {
    if (formData.category) {
      setFilteredProcedures(
        procedures.filter((proc) => proc.category === formData.category)
      );
    } else {
      setFilteredProcedures(procedures);
    }
  }, [formData.category, procedures]);

  const handlePatientSelect = (selectedPatient) => {
    setFormData({
      ...formData,
      patientName: selectedPatient.name,
      patientLastname: selectedPatient.lastname,
      phone: selectedPatient.contactInfo.phone || "",
      patientID: selectedPatient._id,
    });
    setSearchValue("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName) {
      newErrors.patientName = "Please enter patient's name";
    }
    if (!formData.patientLastname) {
      newErrors.patientLastname = "Please enter patient's lastname";
    }
    if (!formData.start) {
      newErrors.start = "Please enter start date and time";
    }
    if (!formData.end) {
      newErrors.end = "Please enter end date and time";
    }

    if (formData.start >= formData.end) {
      newErrors.start = "Start time must be before end time";
      newErrors.end = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    try {
      const structuredData = {
        start: formatDateAndTime(formData.start),
        end: formatDateAndTime(formData.end),
        patientPhone: formData.phone,
        patientID: formData.patientID,
        doctorID: formData.doctorID,
        title: `${formData.patientName} ${formData.patientLastname}`,
        data: {
          procedure: formData.procedureName,
          comment: formData.comment,
        },
      };

      await postData(structuredData);
      if (rerender) {
        rerender();
      }
      onClose();
    } catch (error) {
      console.error("Error submitting schedule:", error);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      category: value,
      procedureName: "",
    }));
  };

  const handleProcedureChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  return (
    <div id="add-modal">
      <div className="form-container">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <form>
          <div className="search-container">
            <SearchInput
              searchValue={searchValue}
              setSearchValue={setSearchValue}
            />
            {searchValue && (
              <ul className="search-results">
                {filteredPatients && filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <li
                      key={patient.id}
                      className="search-results-item"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      {patient.name} {patient.lastname}
                    </li>
                  ))
                ) : (
                  <li className="search-results-item">No patients found</li>
                )}
              </ul>
            )}
          </div>

          <div className="input-wrapper">
            <input
              type="text"
              name="patientName"
              placeholder="Patient's Name"
              value={formData.patientName}
              onChange={handleChange}
            />
            {errors.patientName && (
              <p className="error-message">{errors.patientName}</p>
            )}
          </div>
          <div className="input-wrapper">
            <input
              type="text"
              name="patientLastname"
              placeholder="Patient's Lastname"
              value={formData.patientLastname}
              onChange={handleChange}
            />
            {errors.patientLastname && (
              <p className="error-message">{errors.patientLastname}</p>
            )}
          </div>
          <div className="input-wrapper">
            <input
              type="text"
              name="phone"
              placeholder="Patient's Phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="input-wrapper">
            <input
              type="datetime-local"
              name="start"
              placeholder="Start Date and Time"
              value={formData.start}
              onChange={handleChange}
            />
            {errors.start && <p className="error-message">{errors.start}</p>}
          </div>
          <div className="input-wrapper">
            <input
              type="datetime-local"
              name="end"
              placeholder="End Date and Time"
              value={formData.end}
              onChange={handleChange}
            />
            {errors.end && <p className="error-message">{errors.end}</p>}
          </div>
          <div className="input-wrapper">
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
            >
              <option value="">Select Category</option>
              {existingCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="input-wrapper">
            <select
              name="procedureName"
              value={formData.procedure}
              onChange={handleProcedureChange}
            >
              <option value="">Select Procedure</option>
              {filteredProcedures.map((procedure) => (
                <option key={procedure.id} value={procedure.name}>
                  {procedure.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrapper">
            <input
              type="text"
              name="comment"
              value={formData.comment}
              placeholder="Comment"
              onChange={handleChange}
            />
          </div>
          <Button
            buttonText="Add"
            disabled={isLoading}
            onClick={handleSubmit}
          />
        </form>
      </div>
    </div>
  );
}
