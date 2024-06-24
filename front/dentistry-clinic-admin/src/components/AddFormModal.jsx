import { useState, useEffect } from "react";
import { Button } from "./Button";
import { usePostData } from "../customHooks/usePostData";
import "../styles/add-form-modal.css";

export function AddFormModal({
  resource,
  onClose,
  rerender,
  existingCategories = [],
  procedures,
  appointmentInfo,
  initialFormData
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
      {
        name: "report",
        type: "textarea",
        placeholder:
          "Appointment details, prescribed medications and next scheduled appointments.",
      },
    ],
  };


  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProcedures, setFilteredProcedures] = useState([]);
  const { postData, isLoading } = usePostData(resource);

  useEffect(() => {
    setFormData(initialFormData); 
  }, [initialFormData]);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProcedures(
        procedures.filter(
          (procedure) => procedure.category === selectedCategory
        )
      );
    } else {
      setFilteredProcedures(procedures);
    }
  }, [selectedCategory, procedures]);

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

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setSelectedCategory(value);
    setFormData((prevData) => ({ ...prevData, procedureName: "" }));
  };

  const handleProcedureChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
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

        structuredData.doctorID = appointmentInfo.doctorID;
        structuredData.patientID = appointmentInfo.patientID;
        structuredData.appointmentDate = formattedDate;
      }

      await postData(structuredData);
      if (rerender) {
        rerender();
      }
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
              {resource === "procedures" && field.type === "select" && (
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
              )}

              {resource === "appointments" && field.name === "report" && (
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                />
              )}

              {resource === "schedules" && field.type === "select" && (
                <>
                  {field.name === "category" && (
                    <select
                      name="category"
                      value={formData.category || ""}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Select Category</option>
                      {existingCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  )}

                  {resource === "appointments" && field.type === "textarea" && (
                    <textarea
                      name="report"
                      placeholder="Appointment details, prescribed medications and next scheduled appointments."
                      value={formData.report || ""}
                      onChange={handleChange}
                    />
                  )}

                  {field.name === "procedureName" && (
                    <select
                      name="procedureName"
                      value={formData.procedureName || ""}
                      onChange={handleProcedureChange}
                    >
                      <option value="">Select Procedure</option>
                      {filteredProcedures.map((procedure) => (
                        <option key={procedure.id} value={procedure.name}>
                          {procedure.name}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}
              {!(resource === "appointments" && field.name === "report") && (
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
