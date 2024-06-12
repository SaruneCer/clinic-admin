import { useState } from "react";
import { Button } from "./Button";
import { usePostData } from "../customHooks/usePostData";
import "../styles/add-form-modal.css";

export function AddFormModal({ resource, onClose, rerender }) {
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
    ],
    appointments: [
      { name: "doctorName", type: "text", placeholder: "Doctor's name" },
      { name: "patientName", type: "text", placeholder: "Patient's name" },
      { name: "procedureName", type: "text", placeholder: "Procedure name" },
      { name: "report", type: "text", placeholder: "Report" },
    ],
    schedules: [
      { name: "doctorName", type: "text", placeholder: "Doctor's name" },
      { name: "patientId", type: "text", placeholder: "Patient's ID" },
      {
        name: "appointmentDate",
        type: "datetime-local",
        placeholder: "Appointment date and time",
      },
      { name: "procedureName", type: "text", placeholder: "Procedure name" },
      { name: "status", type: "text", placeholder: "Status" },
      { name: "comment", type: "text", placeholder: "Comment" },
    ],
  };

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const { postData, isLoading } = usePostData(resource);

  const fields = fieldConfigurations[resource] || [];

  const validateForm = () => {
    const newErrors = {};

    fields.forEach((field) => {
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

    const adjustedFormData = { ...formData };

    if (resource === "doctors" || resource === "patients") {
      adjustedFormData.contactInfo = {
        phone: adjustedFormData.phone,
        email: adjustedFormData.email,
      };
      delete adjustedFormData.phone;
      delete adjustedFormData.email;
    }
    if (resource === "patients") {
      adjustedFormData.medicalHistory = [
        {
          conditions: adjustedFormData.conditions,
          notes: adjustedFormData.notes,
        },
      ];
      delete adjustedFormData.conditions;
      delete adjustedFormData.notes;
    }

    try {
      await postData(adjustedFormData);
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
          {fields.map((field) => (
            <div className="input-wrapper" key={field.name}>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={handleChange}
              />
              {errors[field.name] && (
                <p className="error-message">{errors[field.name]}</p>
              )}
            </div>
          ))}
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
