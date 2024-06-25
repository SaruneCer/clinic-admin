import { useState } from "react";
import { Button } from "./Button";
import { usePostData } from "../customHooks/usePostData";
import "../styles/add-form-modal.css";

export function AddFormModal({
  resource,
  onClose,
  rerender,
  existingCategories = [],
  appointmentInfo,
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
      { name: "name", type: "select", placeholder: "Title of procedure" },
      { name: "duration", type: "number", placeholder: "Duration in minutes" },
      { name: "price", type: "number", placeholder: "Price" },
      { name: "category", type: "select", placeholder: "Category" },
    ],
    appointments: [
      {
        name: "report",
        type: "textarea",
        placeholder:
          "Appointment details, prescribed medications and next scheduled appointments.",
      },
    ],
  };

  const initialFormData = {};

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const { postData } = usePostData(resource);

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
    if (resource === "schedules") {
      const { start, end } = formData;
      if (new Date(start) >= new Date(end)) {
        newErrors.start = "Start time must be before end time";
        newErrors.end = "End time must be after start time";
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

      if (resource === "doctors" || resource === "patients") {
        structuredData.contactInfo = {
          phone: structuredData.phone,
          email: structuredData.email,
        };
        delete structuredData.phone;
        delete structuredData.email;
      }
      if (resource === "patients") {
        structuredData.medicalHistory = [
          {
            conditions: structuredData.conditions,
            notes: structuredData.notes,
          },
        ];
        delete structuredData.conditions;
        delete structuredData.notes;
      }

      if (resource === "procedures" && formData.category === "addNewCategory") {
        structuredData.category = formData.newCategory;
        delete structuredData.newCategory;
      }

      if (resource === "appointments") {
        const dateObject = new Date(appointmentInfo.date);
        const formattedDate = dateObject.toISOString().split("T")[0];
        structuredData.appointmentDate = formattedDate;
        structuredData.patientID = appointmentInfo.patientID;
        structuredData.doctorID = appointmentInfo.doctorID;
      }

      await postData(structuredData);
      if (rerender) {
        rerender();
      }
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
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
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <form>
          {fields.map((field) => (
            <div className="input-wrapper" key={field.name}>
              {field.type === "select" && resource === "procedures" && field.name === "category" ? (
                <>
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value === "addNewCategory") {
                        setFormData((prevData) => ({
                          ...prevData,
                          newCategory: "",
                        }));
                      }
                    }}
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
              ) : field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                    onChange={handleChange}
                    className={resource === "appointments" ? "appointment-report-textarea" : ""}
                />
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
          ))}
          <Button buttonText={"ADD"} onClick={handleSubmit} />
        </form>
      </div>
    </div>
  );
}
