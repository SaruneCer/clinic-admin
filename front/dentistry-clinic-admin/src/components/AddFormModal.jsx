import { useState } from "react";
import { Button } from "./Button";
import { usePostData } from "../customHooks/usePostData";
import "../styles/add-form-modal.css";

export function AddFormModal({
  resource,
  onClose,
  rerender,
  existingCategories = [],
  slotInfo,
}) {
  const fieldConfigurations = {
    doctors: [
      { name: "name", type: "text", placeholder: "Name Lastname" },
      { name: "specialization", type: "text", placeholder: "Specialization" },
      { name: "phone", type: "text", placeholder: "Phone number" },
      { name: "email", type: "email", placeholder: "Email address" },
    ],
    patients: [
      { name: "name", type: "text", placeholder: "Name" },
      { name: "lastname", type: "text", placeholder: "Lastname" },
      { name: "dob", type: "date", placeholder: "Date of birth" },
      { name: "phone", type: "text", placeholder: "Phone number" },
      { name: "email", type: "email", placeholder: "Email address" },
      { name: "address", type: "text", placeholder: "Address" },
      { name: "conditions", type: "text", placeholder: "Conditions" },
      {
        name: "notes",
        type: "text",
        placeholder: "Notes about conditions, used medications",
      },
    ],
    procedures: [
      { name: "name", type: "text", placeholder: "Title of procedure" },
      { name: "duration", type: "number", placeholder: "Duration in minutes" },
      { name: "price", type: "number", placeholder: "Price" },
      { name: "category", type: "select", placeholder: "Category" },
    ],
    appointments: [
      { name: "doctorName", type: "text", placeholder: "Doctor's name" },
      { name: "patientName", type: "text", placeholder: "Patient's name" },
      { name: "procedureName", type: "text", placeholder: "Procedure name" },
      { name: "report", type: "text", placeholder: "Report" },
    ],
    schedules: [
      { name: "patientName", type: "text", placeholder: "Patient's name" },
      { name: "procedureName", type: "text", placeholder: "Procedure name" },
      { name: "comment", type: "text", placeholder: "Comment" },
    ],
  };

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const { postData, isLoading } = usePostData(resource);

  const formatDateAndTime = (date) => {
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

  const fields = fieldConfigurations[resource] || [];

  const validateForm = () => {
    const newErrors = {};

    fields.forEach((field) => {
      if (
        resource === "patients" &&
        (field.name === "conditions" || field.name === "notes")
      ) {
        return;
      }
      if (!formData[field.name]) {
        newErrors[field.name] = "Please fill in";
      }
    });

    const emailField = fields.find((field) => field.type === "email");
    if (emailField) {
      const emailValue = formData[emailField.name];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailValue)) {
        newErrors[emailField.name] = "Email invalid";
      }
    }

    const phoneField = fields.find((field) => field.name === "phone");
    if (phoneField) {
      const phoneValue = formData[phoneField.name];
      const phoneRegex = /^\+\d{1,3}\d{6,14}$/;
      if (!phoneRegex.test(phoneValue)) {
        newErrors[phoneField.name] = "Number invalid";
      }
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
      let structuredData = { ...formData };

      if (resource === "schedules" && slotInfo) {
        if (slotInfo.selectedDoctorID) {
          structuredData.doctorID = slotInfo.selectedDoctorID;
        }

        if (slotInfo.start && slotInfo.end) {
          structuredData.start = formatDateAndTime(new Date(slotInfo.start));
          structuredData.end = formatDateAndTime(new Date(slotInfo.end));
        }

        structuredData.title = formData.patientName;
        structuredData.data = {
          procedure: formData.procedureName,
          comment: formData.comment,
        };

        delete structuredData.procedureName;
        delete structuredData.comment;
        delete structuredData.patientName;
      }

      console.log(structuredData);
      await postData(structuredData);
      rerender();
      onClose();
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  return (
    <div id="add-modal">
      <div className="form-container">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <form>
          {fields.map((field) =>
            field.name === "selectedDoctorID" ? null : (
              <div className="input-wrapper" key={field.name}>
                {field.type === "select" ? (
                  <>
                    <select
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      {existingCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      <option value="addNewCategory">Add New Category</option>
                    </select>
                    {formData.category === "addNewCategory" && (
                      <input
                        type="text"
                        placeholder="New category name"
                        value={formData.newCategory || ""}
                        onChange={(e) =>
                          setFormData((prevData) => ({
                            ...prevData,
                            newCategory: e.target.value,
                          }))
                        }
                      />
                    )}
                  </>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                  />
                )}
                {errors[field.name] && (
                  <p className="error-message">{errors[field.name]}</p>
                )}
              </div>
            )
          )}
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
